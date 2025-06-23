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
from .auth import get_token_then_APIS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

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
def get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key):
    """Context manager for Weaviate client connections."""
    client = None
    headers = {
        "X-OpenAI-Api-Key": openai_api_key,
    }
    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=weaviate_url,
            auth_credentials=Auth.api_key(weaviate_api_key),
            headers=headers
        )
        logger.info(f"Successfully connected to Weaviate")
        yield client
    except Exception as e:
        logger.error(f"Failed to connect to Weaviate: {e}")
        raise
    finally:
        if client:
            client.close()
            logger.info(f"Closed Weaviate connection")


@router.post("/match-tour-guides-from-database")
async def match_tour_guides_from_database(request: MatchingRequest, api_keys=Depends(get_token_then_APIS)):
    """Find the best matching tour guides based on the provided criteria using database data."""
    try:
        logger.info(f"Received matching request: {request}")
        
        matching_cluster_weaviate_url = api_keys["matching_cluster_weaviate_url"]
        matching_cluster_weaviate_api_key = api_keys["matching_cluster_weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(matching_cluster_weaviate_url, matching_cluster_weaviate_api_key, openai_api_key) as client:
            # Get the VisitingStudent collection
            visiting_student_collection = client.collections.get("Lawrenceville_visiting_students")
            
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
            
            # Get the TourGuide collection
            tour_guide_collection = client.collections.get("Lawrenceville_tour_guides")
            
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


@router.post("/match-tour-guides-manual")
def match_tour_guides_manual(request: MatchingRequest, api_keys=Depends(get_token_then_APIS)):
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
        
        matching_cluster_weaviate_url = api_keys["matching_cluster_weaviate_url"]
        matching_cluster_weaviate_api_key = api_keys["matching_cluster_weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(matching_cluster_weaviate_url, matching_cluster_weaviate_api_key, openai_api_key) as client:  
            # Get the TourGuide collection
            tour_guide_collection = client.collections.get("Lawrenceville_tour_guides")
            
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

