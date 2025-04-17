from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import weaviate
from weaviate.classes.init import Auth
from weaviate.collections.classes.config import DataType
import os
from dotenv import load_dotenv
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

openai_key = os.environ.get("OPENAI_API_KEY")
weaviate_url = os.environ["VISITING_STUDENT_WEAVIATE_URL"]
weaviate_api_key = os.environ["VISITING_STUDENT_WEAVIATE_API_KEY"]

logger.info(f"Weaviate URL: {weaviate_url}")
logger.info(f"OpenAI API Key available: {openai_key is not None}")

headers = {
    "X-OpenAI-Api-Key": openai_key,
}

try:
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
        headers=headers
    )
    logger.info("Successfully connected to Weaviate")
except Exception as e:
    logger.error(f"Failed to connect to Weaviate: {e}")
    raise

class VisitingStudent(BaseModel):
    name: str
    email: str
    gender: str
    grade: str
    residential_status: str
    city_country: str
    sports: Optional[str] = None
    extracurricular_activities: Optional[str] = None
    academic_interests: Optional[str] = None
    additional_information: Optional[str] = None
    race: Optional[str] = None
    tour_datetime: str

def create_visiting_student_schema():
    """Create the schema for visiting students if it doesn't exist."""
    try:
        # Check if the schema exists
        collections = client.collections.list_all()
        logger.info(f"Available collections: {collections}")
        
        if "VisitingStudent" in collections:
            logger.info("Deleting existing VisitingStudent collection")
            client.collections.delete("VisitingStudent")
            logger.info("Deleted VisitingStudent collection")

        logger.info("Creating VisitingStudent schema")
        # Create the schema
        client.collections.create(
            name="VisitingStudent",
            description="A collection of visiting students who have registered for campus tours",
            properties=[
                {
                    "name": "name",
                    "data_type": DataType.TEXT,
                    "description": "The full name of the visiting student",
                },
                {
                    "name": "email",
                    "data_type": DataType.TEXT,
                    "description": "The email address of the visiting student",
                },
                {
                    "name": "gender",
                    "data_type": DataType.TEXT,
                    "description": "The gender of the visiting student",
                },
                {
                    "name": "grade",
                    "data_type": DataType.TEXT,
                    "description": "The grade level of the visiting student",
                },
                {
                    "name": "residential_status",
                    "data_type": DataType.TEXT,
                    "description": "The residential status of the visiting student",
                },
                {
                    "name": "city_country",
                    "data_type": DataType.TEXT,
                    "description": "The city and country of the visiting student",
                },
                {
                    "name": "sports",
                    "data_type": DataType.TEXT,
                    "description": "The sports interests of the visiting student",
                },
                {
                    "name": "extracurricular_activities",
                    "data_type": DataType.TEXT,
                    "description": "The extracurricular activities of the visiting student",
                },
                {
                    "name": "academic_interests",
                    "data_type": DataType.TEXT,
                    "description": "The academic interests of the visiting student",
                },
                {
                    "name": "additional_information",
                    "data_type": DataType.TEXT,
                    "description": "Additional information about the visiting student",
                },
                {
                    "name": "race",
                    "data_type": DataType.TEXT,
                    "description": "The race/ethnicity of the visiting student",
                },
                {
                    "name": "tour_datetime",
                    "data_type": DataType.TEXT,
                    "description": "The scheduled date and time of the tour",
                },
                {
                    "name": "text_representation",
                    "data_type": DataType.TEXT,
                    "description": "A text representation of the student's information for vector search",
                }
            ]
        )
        logger.info("Created VisitingStudent schema")
    except Exception as e:
        logger.error(f"Error creating VisitingStudent schema: {e}")
        raise

@router.post("/visiting-students")
async def create_visiting_student(student: VisitingStudent):
    """Create a new visiting student record and store it in Weaviate."""
    try:
        logger.info(f"Received visiting student data: {json.dumps(student.dict(), indent=2)}")
        
        # Ensure the schema exists
        create_visiting_student_schema()

        # Create text representation for vector search
        text_fields = []
        if student.residential_status:
            text_fields.append(f"residential status: {student.residential_status}")
        if student.city_country:
            text_fields.append(f"city country: {student.city_country}")
        if student.sports:
            text_fields.append(f"sports: {student.sports}")
        if student.extracurricular_activities:
            text_fields.append(f"extracurricular activities: {student.extracurricular_activities}")
        if student.academic_interests:
            text_fields.append(f"academic interests: {student.academic_interests}")
        if student.additional_information:
            text_fields.append(f"additional information: {student.additional_information}")
        if student.race:
            text_fields.append(f"race: {student.race}")

        text_representation = ", ".join(text_fields)
        logger.info(f"Generated text representation: {text_representation}")

        # Get the VisitingStudent collection
        visiting_student_collection = client.collections.get("VisitingStudent")
        logger.info("Retrieved VisitingStudent collection")

        # Create the student object
        student_data = {
            "name": student.name,
            "email": student.email,
            "gender": student.gender,
            "grade": student.grade,
            "residential_status": student.residential_status,
            "city_country": student.city_country,
            "sports": student.sports,
            "extracurricular_activities": student.extracurricular_activities,
            "academic_interests": student.academic_interests,
            "additional_information": student.additional_information,
            "race": student.race,
            "tour_datetime": student.tour_datetime,
            "text_representation": text_representation
        }

        # Insert the student into Weaviate
        logger.info("Inserting student data into Weaviate")
        result = visiting_student_collection.data.insert(student_data)
        logger.info(f"Student inserted successfully with ID: {result}")

        return {
            "status": "success",
            "message": "Visiting student registered successfully",
            "student_id": result
        }

    except Exception as e:
        logger.error(f"Error creating visiting student: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visiting-students")
async def get_visiting_students():
    """Retrieve all visiting students from the database."""
    try:
        logger.info("Fetching all visiting students")
        visiting_student_collection = client.collections.get("VisitingStudent")
        
        # Query all visiting students
        response = visiting_student_collection.query.fetch_objects(
            limit=100,
            return_properties=[
                "name", "email", "gender", "grade", "residential_status",
                "city_country", "sports", "extracurricular_activities",
                "academic_interests", "additional_information", "race",
                "tour_datetime"
            ]
        )

        students = []
        if response and hasattr(response, 'objects'):
            for obj in response.objects:
                students.append(obj.properties)
        
        logger.info(f"Retrieved {len(students)} visiting students")

        return {
            "status": "success",
            "students": students
        }

    except Exception as e:
        logger.error(f"Error retrieving visiting students: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 