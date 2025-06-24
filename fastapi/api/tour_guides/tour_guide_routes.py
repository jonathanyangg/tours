from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import pandas as pd
import io
import logging
from dotenv import load_dotenv
from ..auth import get_token_then_APIS_cached
from ..weaviate_pool import get_weaviate_client
from .tour_guide_functions import process_and_store_tour_guides, collection_name

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()


@router.post("/upload-tour-guides")
async def upload_tour_guides(file: UploadFile = File(...), api_keys=Depends(get_token_then_APIS_cached)):
    logger.info(f"Received file upload: {file.filename}")
    weaviate_url = api_keys["weaviate_url"]
    weaviate_api_key = api_keys["weaviate_api_key"]
    openai_api_key = api_keys["openai_api_key"]
    user_id = api_keys["user_id"]

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
        result = process_and_store_tour_guides(df, weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
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
async def get_tour_guides(api_keys=Depends(get_token_then_APIS_cached)):
    """Retrieve tour guide information from Weaviate."""
    logger.info(f"Retrieving tour guides for user: {api_keys.get('user_id', 'unknown')}")
    
    weaviate_url = api_keys["weaviate_url"]
    weaviate_api_key = api_keys["weaviate_api_key"]
    openai_api_key = api_keys["openai_api_key"]
    user_id = api_keys["user_id"]
    
    client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)

    if client is None:
        raise HTTPException(status_code=500, detail="Failed to connect to Weaviate")
    
    try:
        # Check if the tour_guides collection exists
        if collection_name not in client.collections.list_all():
            return {
                "status": "empty",
                "message": "No tour guides currently in database",
                "students": []
            }
        
        # Get the collection
        tour_guide_collection = client.collections.get(collection_name)
        
        # Using the newer API with proper method chain - fetch all records (set high limit)
        query_result = tour_guide_collection.query.fetch_objects(limit=10000)
        
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

