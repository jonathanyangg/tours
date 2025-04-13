import pandas as pd
import numpy as np
from typing import List, Dict
import logging
import os
from dotenv import load_dotenv
from openai import OpenAI

import weaviate
import weaviate.classes as wvc  # Use the classes module as per the docs
from weaviate.classes.init import Auth
from weaviate.auth import AuthApiKey

# Load environment variables
load_dotenv()

# Configure OpenAI client with the new API structure
client_openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Weaviate client
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
    )

# Configuration constants
BATCH_SIZE = 100
EMBEDDING_MODEL = "text-embedding-ada-002"  # or your preferred model

def create_schema():
    """Create the Weaviate schema for tour guides if it doesn't exist."""
    try:
        # List existing collections (schemas)
        existing_collections = client.collections.list_all()
        logger.info(f"Existing collections: {existing_collections}")
        
        if "TourGuide" not in existing_collections:
            properties = [
                wvc.config.Property(name="student_id", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="gender", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="grade", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(name="residential_status", data_type=wvc.config.DataType.TEXT),
                # Using the proper DataType for vector embeddings
                wvc.config.Property(name="embedding", data_type=wvc.config.DataType.NUMBER_ARRAY),
            ]
            client.collections.create(
                name="TourGuide",
                description="A tour guide with their information and vector embedding",
                properties=properties,
                vectorizer_config=wvc.config.Configure.Vectorizer.none(),  # Using our own embeddings
            )
            logger.info("Created TourGuide schema in Weaviate")
        else:
            logger.info("TourGuide schema already exists")
    except Exception as e:
        logger.error(f"Error creating schema: {e}")
        raise

def format_dataframe_columns(df: pd.DataFrame, start_pos: int = 3) -> pd.DataFrame:
    """Concatenate columns (from start_pos onward) into a text representation."""
    columns_to_merge = df.columns[start_pos:]
    df['text_representation'] = df.apply(
        lambda row: ', '.join([f"{col}: {row[col]}" for col in columns_to_merge if pd.notna(row[col])]),
        axis=1
    )
    return df

def generate_embeddings(texts: List[str], batch_size: int = BATCH_SIZE) -> List[List[float]]:
    """Generate embeddings for a list of texts using OpenAI's API in batches.
    
    Args:
        texts: List of text strings to get embeddings for
        batch_size: Number of texts to process in each API call
        
    Returns:
        List of embedding vectors
    """
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        try:
            # Clean and validate the batch
            cleaned_batch = []
            for text in batch:
                # Handle None/null values
                if pd.isna(text):
                    text = ""
                
                # Convert to string and clean
                text = str(text).strip()
                
                # Ensure non-empty string
                if not text:
                    text = "no information provided"
                
                cleaned_batch.append(text)
            
            logger.info(f"Processing batch {i//batch_size + 1} of {(len(texts)-1)//batch_size + 1}")
            logger.info(f"Sample text from batch: {cleaned_batch[0][:100]}...")
            
            # Use the new OpenAI client API structure
            response = client_openai.embeddings.create(
                model=EMBEDDING_MODEL,
                input=cleaned_batch,
                encoding_format="float"
            )
            batch_embeddings = [data.embedding for data in response.data]
            all_embeddings.extend(batch_embeddings)
            
        except Exception as e:
            logger.error(f"Error in batch {i//batch_size + 1}: {e}")
            logger.error(f"Problematic batch content: {batch}")
            raise
    
    return all_embeddings

def process_and_store_tour_guides(df: pd.DataFrame) -> Dict:
    """
    Process tour guide data and store it in Weaviate.
    
    This includes:
      - Creating (or recreating) the schema.
      - Formatting a text representation of each row.
      - Generating vector embeddings for the text representations.
      - Inserting objects with the v4 API.
    """
    try:
        # Create or verify the schema first
        create_schema()

        # (Optional) Clear existing data: delete the TourGuide collection if it exists
        try:
            if "TourGuide" in client.collections.list_all():
                client.collections.delete("TourGuide")
                logger.info("Deleted existing TourGuide collection")
        except Exception as e:
            logger.warning(f"Could not delete existing TourGuide collection: {e}")

        # Recreate the schema after deletion for a clean slate
        create_schema()

        # Format the text representation
        df = format_dataframe_columns(df)
        
        # Generate embeddings for the text representations
        logger.info("Generating embeddings for text representations...")
        embeddings = generate_embeddings(df['text_representation'].tolist())
        logger.info(f"Generated {len(embeddings)} embeddings of dimension {len(embeddings[0])}")
        
        # Insert each tour guide object into Weaviate using the collections API (v4)
        logger.info("Inserting tour guide data into Weaviate...")
        count = 0
        tour_guide_collection = client.collections.get("TourGuide")
        
        for idx, row in df.iterrows():
            # Get residential_status from the 4th column if it exists
            residential_status = str(row.iloc[3]) if len(row) > 3 else ""
            
            data_object = {
                "student_id": str(row.iloc[0]),  # Assumes the first column is a unique identifier
                "gender": str(row.iloc[1]),
                "grade": str(row.iloc[2]),
                "residential_status": residential_status,
                "embedding": embeddings[idx]
            }
            response = tour_guide_collection.data.insert(
                properties=data_object
            )
            logger.info(f"Inserted object {row.iloc[0]} with response: {response}")
            count += 1

        logger.info(f"Successfully inserted {count} tour guides into Weaviate.")
        return {
            "status": "success",
            "message": f"Successfully processed and stored {count} tour guides",
            "count": count
        }
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise

# For testing: Uncomment and adjust the following lines as needed.
# df = pd.read_csv("tourguides_final.csv")
# process_and_store_tour_guides(df)
