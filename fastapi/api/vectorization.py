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

# Configuration constants
BATCH_SIZE = 100
EMBEDDING_MODEL = "text-embedding-3-large"  # Updated to use the latest model

def create_schema():
    """Create or update the Weaviate schema for tour guides."""
    try:
        with get_weaviate_client() as client:
            # List existing collections (schemas)
            existing_collections = client.collections.list_all()
            logger.info(f"Existing collections: {existing_collections}")
            
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
                    description="Combined text representation for vector search",
                    indexFilterable=False,
                    indexSearchable=True,
                    tokenization="word"
                ),
            ]
            
            # Configure the OpenAI vectorizer with more specific settings
            vectorizer_config = wvc.config.Configure.NamedVectors.text2vec_openai(
                name="text_vector",
                source_properties=["text_representation"],
                model=EMBEDDING_MODEL,
                dimensions=3072,
                model_options={
                    "baseURL": "https://api.openai.com/v1",
                    "temperature": 0,  # More deterministic results
                    "maxTokens": 8000  # Maximum context length
                }
            )
            
            if "TourGuide" not in existing_collections:
                logger.info("Creating new TourGuide schema...")
                try:
                    client.collections.create(
                        name="TourGuide",
                        description="A tour guide with their information and vector embedding",
                        properties=properties,
                        vectorizer_config=[vectorizer_config],
                        inverted_index_config={
                            "indexTimestamps": True,  # Enable timestamp indexing
                            "stopwords": {
                                "preset": "en",  # Use English stopwords
                                "additions": [],  # Add custom stopwords if needed
                                "removals": []    # Remove stopwords if needed
                            }
                        }
                    )
                    logger.info("Created TourGuide schema successfully")
                except Exception as e:
                    logger.error(f"Failed to create schema: {e}")
                    raise
            else:
                logger.info("Updating existing TourGuide schema...")
                try:
                    # Get existing collection
                    collection = client.collections.get("TourGuide")
                    
                    # Update properties if needed
                    current_properties = collection.properties
                    current_property_names = {p.name for p in current_properties}
                    
                    # Add any new properties
                    for prop in properties:
                        if prop.name not in current_property_names:
                            logger.info(f"Adding new property: {prop.name}")
                            collection.properties.put(prop)
                    
                    # Update vectorizer config if needed
                    collection.config.update_vectorizer_config(vectorizer_config)
                    
                    logger.info("Updated TourGuide schema successfully")
                except Exception as e:
                    logger.error(f"Failed to update schema: {e}")
                    raise
                    
            # Verify schema
            try:
                collection = client.collections.get("TourGuide")
                schema_properties = collection.properties
                logger.info("Schema verification successful")
                logger.info(f"Current properties: {[p.name for p in schema_properties]}")
            except Exception as e:
                logger.error(f"Schema verification failed: {e}")
                raise
                
    except Exception as e:
        logger.error(f"Error in schema management: {e}")
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
        with get_weaviate_client() as client:
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
            
            # Insert each tour guide object into Weaviate using the collections API (v4)
            logger.info("Inserting tour guide data into Weaviate...")
            count = 0
            error_count = 0
            max_retries = 3
            batch_size = 50  # Optimal batch size for better performance
            tour_guide_collection = client.collections.get("TourGuide")
            
            # Configure batch processing
            with tour_guide_collection.batch.configure(
                batch_size=batch_size,
                dynamic=True,
                timeout_retries=max_retries,
                callback=lambda results: logger.info(f"Batch processed: {len(results)} objects")
            ) as batch:
                total_rows = len(df)
                
                for idx, row in df.iterrows():
                    try:
                        # Get residential_status from the 4th column if it exists
                        residential_status = str(row.iloc[3]) if len(row) > 3 else ""
                        
                        data_object = {
                            "student_id": str(row.iloc[0]),
                            "gender": str(row.iloc[1]),
                            "grade": str(row.iloc[2]),
                            "residential_status": residential_status,
                            "text_representation": row['text_representation']
                        }
                        
                        # Add object to batch with retry logic
                        for retry in range(max_retries):
                            try:
                                batch.add_object(properties=data_object)
                                count += 1
                                break
                            except Exception as e:
                                if retry == max_retries - 1:
                                    logger.error(f"Failed to add object after {max_retries} retries: {e}")
                                    error_count += 1
                                else:
                                    logger.warning(f"Retry {retry + 1}/{max_retries} for object {idx}")
                                    continue
                        
                        # Log progress
                        if (idx + 1) % 100 == 0 or idx + 1 == total_rows:
                            logger.info(f"Progress: {idx + 1}/{total_rows} records processed ({((idx + 1)/total_rows)*100:.1f}%)")
                        
                        if error_count >= 10:
                            logger.error("Batch import stopped due to excessive errors.")
                            break
                            
                    except Exception as e:
                        logger.error(f"Error processing row {idx}: {e}")
                        error_count += 1
                        if error_count >= 10:
                            break

            # Log final statistics
            failed_objects = batch.failed_objects
            success_rate = (count - len(failed_objects)) / count * 100 if count > 0 else 0
            
            logger.info(f"Import completed:")
            logger.info(f"- Total processed: {count}")
            logger.info(f"- Successful: {count - len(failed_objects)}")
            logger.info(f"- Failed: {len(failed_objects)}")
            logger.info(f"- Success rate: {success_rate:.1f}%")
            
            if failed_objects:
                logger.error(f"Failed objects: {failed_objects[:5]}")  # Log first 5 failures

            return {
                "status": "success" if success_rate > 90 else "warning",
                "message": f"Processed {count} tour guides with {len(failed_objects)} failures",
                "statistics": {
                    "total": count,
                    "successful": count - len(failed_objects),
                    "failed": len(failed_objects),
                    "success_rate": success_rate
                }
            }
            
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise