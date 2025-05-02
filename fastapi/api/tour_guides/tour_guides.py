from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import pandas as pd
import tempfile
import os
from typing import List, Dict
import json
import io
import logging
from dotenv import load_dotenv
import weaviate
import numpy as np
from weaviate.classes.init import Auth
import weaviate.classes as wvc
from contextlib import contextmanager
from openai import OpenAI
from ..auth import get_token_then_APIS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

# Configuration constants
BATCH_SIZE = 100
EMBEDDING_MODEL = "text-embedding-3-large"

# Environment variables
openai_key = os.environ.get("OPENAI_API_KEY")
weaviate_url = os.environ["TOUR_GUIDE_WEAVIATE_URL"]
weaviate_api_key = os.environ["TOUR_GUIDE_WEAVIATE_API_KEY"]

# Configure OpenAI client
client_openai = OpenAI(api_key=openai_key)

headers = {
    "X-OpenAI-Api-Key": openai_key,
}

def get_weaviate_credentials(api_keys):
    """Extract Weaviate credentials from the API keys dictionary."""
    if not api_keys or len(api_keys) == 0:
        logger.error("No API keys provided")
        raise HTTPException(
            status_code=401, 
            detail="No API keys available. Authentication required."
        )
    
    try:
        weaviate_url = api_keys[0]["tour_guides_weaviate_url"]
        weaviate_api_key = api_keys[0]["tour_guides_weaviate_api_key"]
        return weaviate_url, weaviate_api_key
    except (KeyError, IndexError) as e:
        logger.error(f"Missing required Weaviate credentials: {e}")
        raise HTTPException(
            status_code=500,
            detail="Missing required Weaviate credentials"
        )

@contextmanager
def get_weaviate_client(weaviate_url=None, weaviate_api_key=None):
    """Context manager for Weaviate client connections."""
    # Use environment variables as fallback if not provided
    # This is kept for backward compatibility but should be avoided in protected endpoints
    if weaviate_url is None:
        weaviate_url = os.environ["TOUR_GUIDE_WEAVIATE_URL"]
        logger.warning("Using environment variable for Weaviate URL - this should be avoided in production")
    
    if weaviate_api_key is None:
        weaviate_api_key = os.environ["TOUR_GUIDE_WEAVIATE_API_KEY"]
        logger.warning("Using environment variable for Weaviate API key - this should be avoided in production")
    
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

def create_schema(weaviate_url=None, weaviate_api_key=None):
    """Create or update the Weaviate schema for tour guides."""
    try:
        with get_weaviate_client(weaviate_url, weaviate_api_key) as client:
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

def process_and_store_tour_guides(df: pd.DataFrame, weaviate_url=None, weaviate_api_key=None) -> Dict:
    """
    Process tour guide data and store it in Weaviate.
    
    This includes:
      - Creating (or recreating) the schema.
      - Formatting a text representation of each row.
      - Inserting objects with the v4 API.
    """
    try:
        # Create or verify the schema first
        create_schema(weaviate_url, weaviate_api_key)

        # Format the text representation
        df = format_dataframe_columns(df)
        
        # Insert each tour guide object into Weaviate using the collections API (v4)
        logger.info("Inserting tour guide data into Weaviate...")
        count = 0
        
        with get_weaviate_client(weaviate_url, weaviate_api_key) as client:
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

@router.post("/upload-tour-guides")
async def upload_tour_guides(file: UploadFile = File(...), api_keys=Depends(get_token_then_APIS)):
    """Upload and process a CSV file of tour guides.
    
    The CSV should have at least 3 columns:
    1. ID
    2. Gender
    3. Grade
    All remaining columns will be combined into a text representation for embedding.
    """
    logger.info(f"Received file upload: {file.filename}")
    weaviate_url, weaviate_api_key = get_weaviate_credentials(api_keys)
    
    if not file.filename.endswith('.csv'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read the uploaded file
        logger.info("Reading file content...")
        content = await file.read()
        logger.info(f"File content read successfully, size: {len(content)} bytes")
        
        logger.info("Converting to pandas DataFrame...")
        df = pd.read_csv(io.BytesIO(content))
        logger.info(f"Successfully created DataFrame with shape: {df.shape}")
        logger.info(f"DataFrame columns: {df.columns.tolist()}")
        logger.info(f"First few rows of data:\n{df.head().to_string()}")

        # Validate the DataFrame has the required columns
        if len(df.columns) < 3:
            logger.error(f"CSV has insufficient columns: {len(df.columns)}")
            raise HTTPException(
                status_code=400, 
                detail="CSV must have at least 3 columns: ID, Gender, and Grade"
            )
        
        logger.info(f"Processing CSV with {len(df)} rows and {len(df.columns)} columns")
        
        # Process and store the tour guides
        result = process_and_store_tour_guides(df, weaviate_url, weaviate_api_key)
        
        return JSONResponse(
            content=result,
            status_code=200
        )
            
    except pd.errors.EmptyDataError:
        logger.error("Empty CSV file uploaded")
        raise HTTPException(status_code=400, detail="The CSV file is empty")
    except pd.errors.ParserError:
        logger.error("Invalid CSV format")
        raise HTTPException(status_code=400, detail="Invalid CSV format. Please check your file")
    except Exception as e:
        logger.error(f"Error processing tour guides: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing tour guides: {str(e)}")

@router.get("/tour-guides")
async def get_tour_guides(api_keys=Depends(get_token_then_APIS)):
    """Retrieve tour guide information from Weaviate."""
    logger.info(f"API keys: {api_keys}")
    weaviate_url, weaviate_api_key = get_weaviate_credentials(api_keys)

    try:
        with get_weaviate_client(weaviate_url, weaviate_api_key) as client:
            # Check if the TourGuide collection exists
            if "TourGuide" not in client.collections.list_all():
                return {
                    "status": "empty",
                    "message": "No tour guides currently in database",
                    "students": []
                }
            
            # Get the collection
            tour_guide_collection = client.collections.get("TourGuide")
            
            # Using the newer API with proper method chain
            query_result = tour_guide_collection.query.fetch_objects(
                limit=50  # Set limit to 50 records
            )
            
            # Convert the response to a format that can be JSON serialized
            students = []
            if query_result and hasattr(query_result, 'objects'):
                for obj in query_result.objects:
                    students.append({
                        "student_id": obj.properties.get("student_id", ""),
                        "gender": obj.properties.get("gender", ""),
                        "grade": obj.properties.get("grade", ""),
                        "residential_status": obj.properties.get("residential_status", "")
                    })
            
            return {
                "status": "success",
                "message": "Tour guides retrieved successfully",
                "students": students
            }
    except Exception as e:
        logger.error(f"Error retrieving tour guide information: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-weaviate")
async def test_weaviate_connection(api_keys=Depends(get_token_then_APIS)):
    """Test the connection to Weaviate using user-specific credentials."""
    weaviate_url, weaviate_api_key = get_weaviate_credentials(api_keys)
    
    try:
        with get_weaviate_client(weaviate_url, weaviate_api_key) as client:
            # Try to list collections
            collections = client.collections.list_all()
            return {
                "status": "success",
                "message": "Successfully connected to Weaviate",
                "collections": collections
            }
    except Exception as e:
        logger.error(f"Error connecting to Weaviate: {e}")
        raise HTTPException(status_code=500, detail=str(e))