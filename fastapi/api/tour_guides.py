from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import tempfile
import os
from typing import List, Dict
import json
import io
import logging
from dotenv import load_dotenv
from .vectorization import process_and_store_tour_guides, create_schema, generate_embeddings
import weaviate
import numpy as np
from weaviate.classes.init import Auth
from pydantic import BaseModel
from weaviate.collections.classes.filters import Filter

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

# Define the matching request models
class MatchingRequest(BaseModel):
    student_id: str
    gender: str
    grade: str
    residential_status: str = None
    domestic_or_international: str = None
    sports: str = None
    extracurricular_activities: str = None
    academic_interests: str = None
    other_notes: str = None


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
    """Retrieve student information from Weaviate."""
    try:
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
                    "grade": obj.properties.get("grade", "")
                })
        
        return students
    except Exception as e:
        logger.error(f"Error retrieving student information: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-tour-guides")
async def match_tour_guides(request: MatchingRequest):
    """Find the best matching tour guides based on the provided criteria."""
    try:
        logger.info(f"Received matching request: {request}")
        
        # Format text representation similar to how we do it for tour guides
        text_fields = []
        if request.residential_status:
            text_fields.append(f"residential_status: {request.residential_status}")
        if request.domestic_or_international:
            text_fields.append(f"domestic_or_international: {request.domestic_or_international}")
        if request.sports:
            text_fields.append(f"sports: {request.sports}")
        if request.extracurricular_activities:
            text_fields.append(f"extracurricular_activities: {request.extracurricular_activities}")
        if request.academic_interests:
            text_fields.append(f"academic_interests: {request.academic_interests}")
        if request.other_notes:
            text_fields.append(f"other_notes: {request.other_notes}")
        
        text_representation = ", ".join(text_fields)
        logger.info(f"Generated text representation: {text_representation}")
        
        # Generate embedding for the request text
        embeddings = generate_embeddings([text_representation])
        request_embedding = embeddings[0]
        
        # Get the TourGuide collection
        tour_guide_collection = client.collections.get("TourGuide")
        
        # First filter by gender and grade
        gender_first_char = request.gender[0].lower() if request.gender else ""
        
        # Using the proper filter object structure with the Weaviate filter builder
        try:
            # Get all guides first (without filtering) and then filter in memory
            all_guides = tour_guide_collection.query.fetch_objects(
                limit=1000  # Get a larger number of guides
            )
            
            # Filter in memory
            filtered_guides = []
            if all_guides and hasattr(all_guides, 'objects'):
                for obj in all_guides.objects:
                    guide_gender = obj.properties.get("gender", "")
                    guide_grade = obj.properties.get("grade", "")
                    
                    # Check if the gender starts with the same letter (case-insensitive)
                    gender_match = guide_gender and guide_gender[0].lower() == gender_first_char
                    # Check if the grade matches exactly
                    grade_match = guide_grade == request.grade
                    
                    if gender_match and grade_match:
                        filtered_guides.append(obj)
            
            # Check if we have results
            matches = []
            
            if filtered_guides and len(filtered_guides) > 0:
                # Calculate similarity scores manually
                for obj in filtered_guides:
                    guide_embedding = obj.properties.get("embedding", [])
                    similarity = 0
                    if guide_embedding and len(guide_embedding) > 0:
                        # Normalize vectors
                        a = np.array(request_embedding)
                        b = np.array(guide_embedding)
                        similarity = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                    
                    matches.append({
                        "student_id": obj.properties.get("student_id", ""),
                        "gender": obj.properties.get("gender", ""),
                        "grade": obj.properties.get("grade", ""),
                        "similarity_score": float(similarity),
                        "id": obj.uuid
                    })
                
                # Sort by similarity score (highest first) and take top 3
                matches.sort(key=lambda x: x["similarity_score"], reverse=True)
                top_matches = matches[:3]
                
                return {
                    "status": "success",
                    "message": f"Found {len(top_matches)} matching tour guides",
                    "matches": top_matches
                }
            else:
                # No matches found
                return {
                    "status": "warning",
                    "message": "No matching tour guides found with the same gender and grade",
                    "matches": []
                }
                
        except Exception as query_error:
            logger.error(f"Error querying Weaviate: {query_error}")
            raise HTTPException(
                status_code=500, 
                detail=f"Error querying tour guides: {str(query_error)}"
            )
            
    except Exception as e:
        logger.error(f"Error matching tour guides: {e}")
        raise HTTPException(status_code=500, detail=f"Error matching tour guides: {str(e)}")


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