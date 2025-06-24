import pandas as pd
from typing import Dict
import logging
import weaviate.classes as wvc
from ..weaviate_pool import get_weaviate_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration constants
BATCH_SIZE = 100
EMBEDDING_MODEL = "text-embedding-3-large"
collection_name = "Tour_guides"


def create_schema(weaviate_url=None, weaviate_api_key=None, openai_api_key=None, user_id=None):
    """Create or update the Weaviate schema for tour guides."""
    try:
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        # List existing collections (schemas)
        existing_collections = client.collections.list_all()
        logger.info(f"Existing collections: {existing_collections}")
        
        # Delete existing tour_guides collection if it exists
        if collection_name in existing_collections:
            logger.info(f"{collection_name} collection already exists. Deleting it first...")
            client.collections.delete(collection_name)
            logger.info(f"Successfully deleted existing {collection_name} collection")
        
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
                tokenization=wvc.config.Tokenization.WORD
            )
        ]
        
        # Configure the OpenAI vectorizer
        vectorizer_config = wvc.config.Configure.NamedVectors.text2vec_openai(
            name="text_vector",
            source_properties=["text_representation"],
            model=EMBEDDING_MODEL,
            dimensions=3072
        )
        
        # Create the collection
        client.collections.create(
            name=collection_name,
            description="A tour guide with their information and vector embedding",
            properties=properties,
            vectorizer_config=[vectorizer_config]
        )
        logger.info(f"Created {collection_name} schema in Weaviate")
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


def process_and_store_tour_guides(df: pd.DataFrame, weaviate_url=None, weaviate_api_key=None, openai_api_key=None, user_id=None) -> Dict:
    """
    Process tour guide data and store it in Weaviate.
    
    This includes:
      - Creating (or recreating) the schema.
      - Formatting a text representation of each row.
      - Inserting objects with the v4 API.
    """
    try:
        # Create or verify the schema first
        create_schema(weaviate_url, weaviate_api_key, openai_api_key, user_id)

        # Format the text representation
        df = format_dataframe_columns(df)
        
        # Insert each tour guide object into Weaviate using the collections API (v4)
        logger.info("Inserting tour guide data into Weaviate...")
        count = 0
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        # Get the tour_guides collection
        tour_guide_collection = client.collections.get(collection_name)
        
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