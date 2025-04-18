import pandas as pd
import numpy as np
from typing import List, Dict
import logging
import os
from dotenv import load_dotenv
from openai import OpenAI
import weaviate
import weaviate.classes as wvc
from weaviate.classes.init import Auth
from weaviate.auth import AuthApiKey
from contextlib import contextmanager

# Load environment variables
load_dotenv()

openai_key = os.environ.get("OPENAI_API_KEY")
weaviate_url = os.environ["TOUR_GUIDE_WEAVIATE_URL"]
weaviate_api_key = os.environ["TOUR_GUIDE_WEAVIATE_API_KEY"]

# Configure OpenAI client with the new API structure
client_openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

headers = {
    "X-OpenAI-Api-Key": openai_key,
}

# Configuration constants
BATCH_SIZE = 100
EMBEDDING_MODEL = "text-embedding-3-large"  # Updated to use the latest model

@contextmanager
def get_weaviate_client():
    """Context manager for Weaviate client connections."""
    client = None
    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=weaviate_url,
            auth_credentials=Auth.api_key(weaviate_api_key),
            headers=headers
        )
        logger.info("Successfully connected to Weaviate")
        yield client
    except Exception as e:
        logger.error(f"Failed to connect to Weaviate: {e}")
        raise
    finally:
        if client:
            client.close()
            logger.info("Closed Weaviate connection")

def create_schema():
    """Create or update the Weaviate schema for tour guides."""
    try:
        with get_weaviate_client() as client:
            # List existing collections (schemas)
            existing_collections = client.collections.list_all()
            logger.info(f"Existing collections: {existing_collections}")
            
            # Delete existing TourGuide collection if it exists
            if "TourGuide" in existing_collections:
                logger.info("TourGuide collection already exists. Deleting it first...")
                client.collections.delete("TourGuide")
                logger.info("Successfully deleted existing TourGuide collection")
            
            # Define the schema properties
            properties = [
                wvc.config.Property(
                    name="student_id",
                    data_type=wvc.config.DataType.TEXT,
                    description="Unique identifier for the tour guide",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="gender",
                    data_type=wvc.config.DataType.TEXT,
                    description="Gender of the tour guide",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="grade",
                    data_type=wvc.config.DataType.TEXT,
                    description="Grade level of the tour guide",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="residential_status",
                    data_type=wvc.config.DataType.TEXT,
                    description="Residential status of the tour guide",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="text_representation",
                    data_type=wvc.config.DataType.TEXT,
                    description="A text representation of the tour guide's information for vector search",
                    indexFilterable=False,
                    indexSearchable=True,
                    tokenization=wvc.config.Tokenization.WORD  # Use the proper Tokenization enum
                )
            ]
            
            # Configure the OpenAI vectorizer
            vectorizer_config = wvc.config.Configure.NamedVectors.text2vec_openai(
                name="text_vector",
                source_properties=["text_representation"],
                model=EMBEDDING_MODEL,
                dimensions=3072,

            )
            
            # Create the collection
            client.collections.create(
                name="TourGuide",
                description="A tour guide with their information and vector embedding",
                properties=properties,
                vectorizer_config=[vectorizer_config]
            )
            logger.info("Created TourGuide schema in Weaviate")
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

def process_and_store_tour_guides(df: pd.DataFrame) -> Dict:
    """
    Process tour guide data and store it in Weaviate.
    
    This includes:
      - Creating (or recreating) the schema.
      - Formatting a text representation of each row.
      - Inserting objects with the v4 API.
    """
    try:
        # Create or verify the schema first
        create_schema()

        # Format the text representation
        df = format_dataframe_columns(df)
        
        # Insert each tour guide object into Weaviate using the collections API (v4)
        logger.info("Inserting tour guide data into Weaviate...")
        count = 0
        
        with get_weaviate_client() as client:
            # Get the TourGuide collection
            tour_guide_collection = client.collections.get("TourGuide")
            
            # Use batch operations for better performance
            with tour_guide_collection.batch.dynamic() as batch:
                for idx, row in df.iterrows():
                    # Get residential_status from the 4th column if it exists
                    residential_status = str(row.iloc[3]) if len(row) > 3 else ""
                    
                    data_object = {
                        "student_id": str(row.iloc[0]),  # Assumes the first column is a unique identifier
                        "gender": str(row.iloc[1]),
                        "grade": str(row.iloc[2]),
                        "residential_status": residential_status,
                        "text_representation": row['text_representation']
                    }
                    
                    batch.add_object(
                        properties=data_object
                    )
                    count += 1
                    
                    if batch.number_errors > 10:
                        logger.error("Batch import stopped due to excessive errors.")
                        break

            # Check for failed objects
            failed_objects = tour_guide_collection.batch.failed_objects
            if failed_objects:
                logger.error(f"Number of failed imports: {len(failed_objects)}")
                logger.error(f"First failed object: {failed_objects[0]}")

        logger.info(f"Successfully inserted {count} tour guides into Weaviate.")
        return {
            "status": "success",
            "message": f"Successfully processed and stored {count} tour guides",
            "count": count
        }
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise