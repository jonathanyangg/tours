from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging
import weaviate
from weaviate.classes.init import Auth
from weaviate.collections.classes.filters import Filter
from weaviate.classes.query import MetadataQuery
from contextlib import contextmanager
from dotenv import load_dotenv
import os
from .auth import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

# Environment variables
openai_key = os.environ.get("OPENAI_API_KEY")
tour_guide_weaviate_url = os.environ["TOUR_GUIDE_WEAVIATE_URL"]
tour_guide_weaviate_api_key = os.environ["TOUR_GUIDE_WEAVIATE_API_KEY"]
visiting_student_weaviate_url = os.environ["VISITING_STUDENT_WEAVIATE_URL"]
visiting_student_weaviate_api_key = os.environ["VISITING_STUDENT_WEAVIATE_API_KEY"]

headers = {
    "X-OpenAI-Api-Key": openai_key,
}

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

@contextmanager
def get_weaviate_client():
    """Context manager for Weaviate client connections for tour guides."""
    client = None
    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=tour_guide_weaviate_url,
            auth_credentials=Auth.api_key(tour_guide_weaviate_api_key),
            headers=headers
        )
        logger.info("Successfully connected to Tour Guides Weaviate")
        yield client
    except Exception as e:
        logger.error(f"Failed to connect to Tour Guides Weaviate: {e}")
        raise
    finally:
        if client:
            client.close()
            logger.info("Closed Tour Guides Weaviate connection")

@contextmanager
def get_visiting_students_client():
    """Context manager for Weaviate client connections for visiting students."""
    client = None
    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=visiting_student_weaviate_url,
            auth_credentials=Auth.api_key(visiting_student_weaviate_api_key),
            headers=headers
        )
        logger.info("Successfully connected to Visiting Students Weaviate")
        yield client
    except Exception as e:
        logger.error(f"Failed to connect to Visiting Students Weaviate: {e}")
        raise
    finally:
        if client:
            client.close()
            logger.info("Closed Visiting Students Weaviate connection")

@router.post("/match-tour-guides-manual")
async def match_tour_guides_manual(request: MatchingRequest, user=Depends(get_current_user)):
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
        
        with get_weaviate_client() as client:
            # Get the TourGuide collection
            tour_guide_collection = client.collections.get("TourGuide")
            
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
    """Find the best matching tour guides based on the provided criteria using database data."""
    try:
        logger.info(f"Received matching request: {request}")
        
        with get_visiting_students_client() as client:
            # Get the VisitingStudent collection
            visiting_student_collection = client.collections.get("VisitingStudent")
            
            # Get the student's data
            student_query = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("email").equal(request.student_id)
            )
            
            if not student_query or not student_query.objects:
                return {
                    "status": "error",
                    "message": "Student not found in database",
                    "matches": []
                }
            
            student = student_query.objects[0]
            
            # Format text representation for matching
            text_fields = []
            if student.properties.get("residential_status"):
                text_fields.append(f"residential_status: {student.properties['residential_status']}")
            if student.properties.get("city_country"):
                text_fields.append(f"city_country: {student.properties['city_country']}")
            if student.properties.get("sports"):
                text_fields.append(f"sports: {student.properties['sports']}")
            if student.properties.get("extracurricular_activities"):
                text_fields.append(f"extracurricular_activities: {student.properties['extracurricular_activities']}")
            if student.properties.get("academic_interests"):
                text_fields.append(f"academic_interests: {student.properties['academic_interests']}")
            if student.properties.get("additional_information"):
                text_fields.append(f"additional_information: {student.properties['additional_information']}")
            
            text_representation = ", ".join(text_fields)
            logger.info(f"Generated text representation: {text_representation}")
            
            # Get tour guides client for matching
            with get_weaviate_client() as tour_guides_client:
                # Get the TourGuide collection
                tour_guide_collection = tour_guides_client.collections.get("TourGuide")
                
                # Build the filter conditions
                gender_first_char = student.properties.get("gender", "")[0].lower() if student.properties.get("gender") else ""
                grade = student.properties.get("grade", "")
                
                gender_filter = Filter.by_property("gender").like(f"{gender_first_char}*")
                grade_filter = Filter.by_property("grade").equal(grade)
                
                # Combine filters
                combined_filter = gender_filter & grade_filter
                
                # Add residential status filter if provided
                if student.properties.get("residential_status"):
                    residential_filter = Filter.by_property("residential_status").like(f"{student.properties['residential_status'][0].lower()}*")
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