from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import tempfile
import os
from typing import List
import json
import io
import logging
from dotenv import load_dotenv
from .vectorization import process_and_store_tour_guides, create_schema
import weaviate
from weaviate.classes.init import Auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()


# Initialize Weaviate client
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
    )


@router.post("/upload-tour-guides")
async def upload_tour_guides(file: UploadFile = File(...)):
    """Upload and process a CSV file of tour guides.
    
    The CSV should have at least 3 columns:
    1. ID
    2. Gender
    3. Grade
    All remaining columns will be combined into a text representation for embedding.
    """
    logger.info(f"Received file upload: {file.filename}")
    
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
        result = process_and_store_tour_guides(df)
        
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
async def get_tour_guides():
    """Retrieve all tour guides from Weaviate."""
    try:
        # Get the collection
        tour_guide_collection = client.collections.get("TourGuide")
        
        # Using the newer API with proper method chain
        query_result = tour_guide_collection.query.fetch_objects(
            limit=1000  # Set a reasonable limit
        )
        
        # Convert the response to a format that can be JSON serialized
        guides = []
        if query_result and hasattr(query_result, 'objects'):
            for obj in query_result.objects:
                guides.append({
                    "student_id": obj.properties.get("student_id", ""),
                    "gender": obj.properties.get("gender", ""),
                    "grade": obj.properties.get("grade", ""),
                    "text_representation": obj.properties.get("text_representation", "")
                })
        
        return guides
    except Exception as e:
        logger.error(f"Error retrieving tour guides: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-weaviate")
async def test_weaviate_connection():
    """Test the connection to Weaviate and return the schema."""
    try:
        # Try to get the collections to check connection
        status = client.is_ready()
        return {
            "status": status, 
            "message": "Weaviate connection successful",
        }
    except Exception as e:
        logger.error(f"Weaviate connection error: {e}")
        return {
            "status": "error", 
            "message": f"Weaviate connection failed: {str(e)}"
        } 