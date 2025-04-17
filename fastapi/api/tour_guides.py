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
from .vectorization import process_and_store_tour_guides
import weaviate
import numpy as np
from weaviate.classes.init import Auth
from pydantic import BaseModel
from weaviate.collections.classes.filters import Filter
from weaviate.classes.query import MetadataQuery

openai_key = os.environ.get("OPENAI_API_KEY")
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
visiting_student_weaviate_url = os.environ["VISITING_STUDENT_WEAVIATE_URL"]
visiting_student_weaviate_api_key = os.environ["VISITING_STUDENT_WEAVIATE_API_KEY"]

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

headers = {
    "X-OpenAI-Api-Key": openai_key,
}

# Connect to tour guides Weaviate instance
tour_guides_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
    headers=headers
)

# Connect to visiting students Weaviate instance
visiting_students_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=visiting_student_weaviate_url,
    auth_credentials=Auth.api_key(visiting_student_weaviate_api_key),
    headers=headers
)

# Define the matching request models
class MatchingRequest(BaseModel):
    student_id: str
    gender: str
    grade: str
    residential_status: str = None
    city_country: str = None
    sports: str = None
    extracurricular_activities: str = None
    academic_interests: str = None
    additional_information: str = None
    race: str = None
    time_period: str = None

    def validate_grade(self, grade: str) -> str:
        """Validate and transform grade values."""
        if not grade:
            raise ValueError("Grade cannot be empty")
        
        # Convert to string and strip whitespace
        grade_str = str(grade).strip().upper()
        
        # Handle "PG" case
        if grade_str == "PG":
            return "12"
        
        try:
            # Try to convert to integer
            grade_num = int(grade_str)
            if grade_num < 1 or grade_num > 12:
                raise ValueError(f"Grade must be between 1 and 12, got {grade_num}")
            return str(grade_num)
        except ValueError as e:
            if "between 1 and 12" in str(e):
                raise e
            raise ValueError(f"Invalid grade format: {grade_str}. Must be a number or 'PG'")

    def __init__(self, **data):
        super().__init__(**data)
        self.grade = self.validate_grade(self.grade)

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
        
        # Validate and transform the grade column
        grade_column = df.columns[2]  # Get the third column name
        logger.info(f"Processing grade column: {grade_column}")
        
        # Function to validate and transform grade values
        def transform_grade(grade):
            if pd.isna(grade):
                raise ValueError("Grade cannot be empty")
            
            # Convert to string and strip whitespace
            grade_str = str(grade).strip().upper()
            
            # Handle "PG" case
            if grade_str == "PG":
                return 12
            
            try:
                # Try to convert to integer
                grade_num = int(grade_str)
                if grade_num < 1 or grade_num > 12:
                    raise ValueError(f"Grade must be between 1 and 12, got {grade_num}")
                return grade_num
            except ValueError as e:
                if "between 1 and 12" in str(e):
                    raise e
                raise ValueError(f"Invalid grade format: {grade_str}. Must be a number or 'PG'")
        
        # Apply the transformation
        try:
            df[grade_column] = df[grade_column].apply(transform_grade)
            logger.info("Successfully validated and transformed grade column")
        except ValueError as e:
            logger.error(f"Grade validation error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
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
        tour_guide_collection = tour_guides_client.collections.get("TourGuide")
        
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
        
        return students
    except Exception as e:
        logger.error(f"Error retrieving student information: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-tour-guides-manual")
async def match_tour_guides_manual(request: MatchingRequest):
    """Find the best matching tour guides based on the provided criteria."""
    try:
        logger.info(f"Received matching request: {request}")
        
        # Format text representation similar to how we do it for tour guides
        text_fields = []
        if request.residential_status:
            text_fields.append(f"residential_status: {request.residential_status}")
        if request.city_country:
            text_fields.append(f"city_country: {request.city_country}")
        if request.sports:
            text_fields.append(f"sports: {request.sports}")
        if request.extracurricular_activities:
            text_fields.append(f"extracurricular_activities: {request.extracurricular_activities}")
        if request.academic_interests:
            text_fields.append(f"academic_interests: {request.academic_interests}")
        if request.additional_information:
            text_fields.append(f"additional_information: {request.additional_information}")
        
        text_representation = ", ".join(text_fields)
        logger.info(f"Generated text representation: {text_representation}")
        
        # Get the TourGuide collection
        tour_guide_collection = tour_guides_client.collections.get("TourGuide")
        
        # First filter by gender and grade
        gender_first_char = request.gender[0].lower() if request.gender else ""
        
        # Build the filter conditions
        gender_filter = Filter.by_property("gender").like(f"{gender_first_char}*")
        grade_filter = Filter.by_property("grade").equal(request.grade)
        
        # Combine filters
        combined_filter = gender_filter & grade_filter
        
        # Add residential status filter if provided
        if request.residential_status:
            residential_filter = Filter.by_property("residential_status").like(f"{request.residential_status[0].lower()}*")
            combined_filter = combined_filter & residential_filter
        
        # Perform vector search with filters
        response = tour_guide_collection.query.near_text(
            query=text_representation,
            limit=3,
            filters=combined_filter,
            return_metadata=MetadataQuery(distance=True)
        )
        
        # Process the results
        matches = []
        if response and hasattr(response, 'objects'):
            for obj in response.objects:
                matches.append({
                    "student_id": obj.properties.get("student_id", ""),
                    "gender": obj.properties.get("gender", ""),
                    "grade": obj.properties.get("grade", ""),
                    "residential_status": obj.properties.get("residential_status", ""),
                    "distance": obj.metadata.distance if hasattr(obj.metadata, 'distance') else None,
                    "id": obj.uuid
                })
        
        if matches:
            return {
                "status": "success",
                "message": f"Found {len(matches)} matching tour guides",
                "matches": matches
            }
        else:
            return {
                "status": "warning",
                "message": "No matching tour guides found with the same gender and grade",
                "matches": []
            }
            
    except Exception as e:
        logger.error(f"Error matching tour guides: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-tour-guides-from-database")
async def match_tour_guides_from_database(request: MatchingRequest):
    """Find the best matching tour guides based on a visiting student from the database."""
    try:
        logger.info(f"Received database matching request: {request}")
        logger.info(f"Request data: student_id={request.student_id}, gender={request.gender}, grade={request.grade}, residential_status={request.residential_status}")
        
        # Get the visiting student's vector from the visiting student database
        visiting_student_collection = visiting_students_client.collections.get("VisitingStudent")
        logger.info("Fetching visiting student from database...")
        visiting_student = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("email").equal(request.student_id),
            limit=1,
            include_vector=True  # Explicitly request the vector
        )
        
        if not visiting_student.objects:
            logger.error(f"No visiting student found with email: {request.student_id}")
            raise HTTPException(status_code=404, detail="Visiting student not found")
        
        # Log the visiting student object structure without vector
        student_obj = visiting_student.objects[0]
        student_data = {k: v for k, v in student_obj.properties.items() if k != 'vector'}
        logger.info(f"Found visiting student: {json.dumps(student_data, indent=2)}")
        
        # Get the vector from the visiting student
        visiting_student_vector = visiting_student.objects[0].vector.get('default', [])
        logger.info(f"Retrieved vector with length: {len(visiting_student_vector)}")
        
        # Get the TourGuide collection from the tour guides database
        tour_guide_collection = tour_guides_client.collections.get("TourGuide")
        
        # First filter by gender and grade
        gender_first_char = request.gender[0].lower() if request.gender else ""
        
        # Build the filter conditions
        gender_filter = Filter.by_property("gender").like(f"{gender_first_char}*")
        grade_filter = Filter.by_property("grade").equal(request.grade)
        
        # Combine filters
        combined_filter = gender_filter & grade_filter
        
        # Add residential status filter if provided
        if request.residential_status:
            residential_filter = Filter.by_property("residential_status").like(f"{request.residential_status[0].lower()}*")
            combined_filter = combined_filter & residential_filter
        
        # Log the search parameters
        logger.info(f"Searching with filters: {combined_filter}")
        logger.info(f"Vector length: {len(visiting_student_vector) if visiting_student_vector else 'None'}")
        
        # Perform vector search with filters using the visiting student's vector
        logger.info("Performing vector search...")
        response = tour_guide_collection.query.near_vector(
            near_vector=visiting_student_vector,  # Use the vector values directly
            limit=6,
            filters=combined_filter,
            return_metadata=MetadataQuery(distance=True)
        )
        
        # Process the results
        matches = []
        if response and hasattr(response, 'objects'):
            for obj in response.objects:
                match_data = {
                    "student_id": obj.properties.get("student_id", ""),
                    "name": obj.properties.get("student_id", ""),  # Use student_id as name since that's what we store
                    "gender": obj.properties.get("gender", ""),
                    "grade": obj.properties.get("grade", ""),
                    "residential_status": obj.properties.get("residential_status", ""),
                    "distance": obj.metadata.distance if hasattr(obj.metadata, 'distance') else None,
                    "id": str(obj.uuid)  # Convert UUID to string
                }
                matches.append(match_data)
                # Log without the UUID to avoid serialization issues
                log_data = match_data.copy()
                log_data["id"] = str(log_data["id"])  # Ensure ID is string for logging
                logger.info(f"Found match: {json.dumps(log_data, indent=2)}")
        
        if matches:
            logger.info(f"Found {len(matches)} matching tour guides")
            return {
                "status": "success",
                "message": f"Found {len(matches)} matching tour guides",
                "matches": matches
            }
        else:
            logger.warning("No matching tour guides found")
            return {
                "status": "warning",
                "message": "No matching tour guides found with the same gender and grade",
                "matches": []
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error matching tour guides: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-weaviate")
async def test_weaviate_connection():
    """Test the connection to Weaviate and return the schema."""
    try:
        # Try to get the collections to check connection
        status = tour_guides_client.is_ready()
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