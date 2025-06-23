from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import weaviate
from weaviate.classes.init import Auth
from weaviate.collections.classes.filters import Filter
import weaviate.classes as wvc
import os
from dotenv import load_dotenv
import logging
import json
from contextlib import contextmanager
from ..auth import get_token_then_APIS, get_token_then_APIS_cached, get_school_api_keys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

# Configuration constants
EMBEDDING_MODEL = "text-embedding-3-large"
BATCH_SIZE = 100
collection_name = "Visiting_students"

@contextmanager
def get_weaviate_client(weaviate_url=None, weaviate_api_key=None, openai_api_key=None):
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
        logger.info("Successfully connected to Weaviate")
        yield client
    except Exception as e:
        logger.error(f"Failed to connect to Weaviate: {e}")
        raise
    finally:
        if client:
            client.close()
            logger.info("Closed Weaviate connection")

class VisitingStudent(BaseModel):
    school: str
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
    is_matched: Optional[bool] = False
    matched_tour_guide: Optional[str] = None

def create_schema(weaviate_url=None, weaviate_api_key=None, openai_api_key=None):
    """Create the Weaviate schema for visiting students if it doesn't exist."""
    try:
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            # List existing collections (schemas)
            existing_collections = client.collections.list_all()
            logger.info(f"Existing collections: {existing_collections}")
            
            if collection_name not in existing_collections:
                properties = [
                    wvc.config.Property(
                        name="school",
                        data_type=wvc.config.DataType.TEXT,
                        description="School of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="name",
                        data_type=wvc.config.DataType.TEXT,
                        description="Name of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="email",
                        data_type=wvc.config.DataType.TEXT,
                        description="Email address of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="gender",
                        data_type=wvc.config.DataType.TEXT,
                        description="Gender of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="grade",
                        data_type=wvc.config.DataType.TEXT,
                        description="Grade level of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="residential_status",
                        data_type=wvc.config.DataType.TEXT,
                        description="Residential status of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="city_country",
                        data_type=wvc.config.DataType.TEXT,
                        description="City and country of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="sports",
                        data_type=wvc.config.DataType.TEXT,
                        description="Sports interests of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="extracurricular_activities",
                        data_type=wvc.config.DataType.TEXT,
                        description="Extracurricular activities of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="academic_interests",
                        data_type=wvc.config.DataType.TEXT,
                        description="Academic interests of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="additional_information",
                        data_type=wvc.config.DataType.TEXT,
                        description="Additional information about the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="race",
                        data_type=wvc.config.DataType.TEXT,
                        description="Race of the visiting student",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="tour_datetime",
                        data_type=wvc.config.DataType.TEXT,
                        description="Date and time of the tour",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="is_matched",
                        data_type=wvc.config.DataType.INT,
                        description="Whether the student has been matched with a tour guide (0=unmatched, 1=matched)",
                        indexFilterable=True,
                        indexSearchable=False
                    ),
                    wvc.config.Property(
                        name="matched_tour_guide",
                        data_type=wvc.config.DataType.TEXT,
                        description="The ID of the matched tour guide",
                        indexFilterable=True,
                        indexSearchable=True
                    ),
                    wvc.config.Property(
                        name="text_representation",
                        data_type=wvc.config.DataType.TEXT,
                        description="A text representation of the student's information for vector search",
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
                
                client.collections.create(
                    name=collection_name,
                    description="A visiting student with their information and vector embedding",
                    properties=properties,
                    vectorizer_config=[vectorizer_config],
                )
                logger.info(f"Created {collection_name} schema in Weaviate")
            else:
                logger.info(f"{collection_name} schema already exists")
    except Exception as e:
        logger.error(f"Error creating schema: {e}")
        raise

@router.post("/visiting-students")
async def create_visiting_student(student: VisitingStudent):
    """Create a new visiting student record and store it in Weaviate."""
    try:
        logger.info(f"Received visiting student data: {json.dumps(student.model_dump(), indent=2)}")
        school_ceeb = student.school
       
        api_keys = get_school_api_keys(school_ceeb)
        
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        logger.info(f"Weaviate url: {weaviate_url}")
        logger.info(f"Weaviate api key: {weaviate_api_key}")
        logger.info(f"Openai api key: {openai_api_key}")

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

        # Log that vector was generated
        logger.info("Vector property generated successfully")
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            # Get the VisitingStudent collection
            if collection_name not in client.collections.list_all():
                create_schema(weaviate_url, weaviate_api_key, openai_api_key)
            visiting_student_collection = client.collections.get(collection_name)
            logger.info(f"Retrieved {collection_name} collection")

            # Create the student object
            student_data = {
                "school": student.school,
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
                "is_matched": 0,  # Initialize as unmatched (0)
                "matched_tour_guide": student.matched_tour_guide,
                "text_representation": text_representation  # Always include the generated text representation
            }
            logger.info(f"Prepared student data for insertion: {json.dumps(student_data, indent=2)}")

            # Insert the student into Weaviate
            logger.info("Inserting student data into Weaviate")
            result = visiting_student_collection.data.insert(student_data)
            logger.info(f"Student inserted successfully with ID: {result}")

            # Verify the vector was generated
            logger.info("Verifying vector generation...")
            inserted_student = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("email").equal(student.email),
                limit=1,
                include_vector=True
            )
            
            if inserted_student.objects:
                student_obj = inserted_student.objects[0]
                logger.info(f"Retrieved inserted student object: {student_obj}")
                logger.info(f"Vector property: {student_obj.vector}")
                if student_obj.vector:
                    logger.info("Vector was successfully generated")
                    # Log all available vector properties
                    logger.info(f"Available vector properties: {list(student_obj.vector.keys())}")
                    if "default" in student_obj.vector:
                        logger.info(f"Vector length: {len(student_obj.vector['default'])}")
                        logger.info("Vector was successfully generated and stored")
                    else:
                        logger.warning("default vector not found in vector property")
                else:
                    logger.error("Vector is empty or not generated")
            else:
                logger.error("Could not retrieve inserted student")

            # Log the inserted student object
            logger.info("Vector property generated successfully")
            
            return {
                "status": "success",
                "message": "Visiting student registered successfully",
                "student_id": result
            }

    except Exception as e:
        logger.error(f"Error creating visiting student: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visiting-students")
async def get_visiting_students(api_keys=Depends(get_token_then_APIS_cached)):
    """Retrieve all visiting students from the database."""
    try:
        logger.info("Fetching all visiting students")
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            visiting_student_collection = client.collections.get(collection_name)
            
            # Query all visiting students
            response = visiting_student_collection.query.fetch_objects(
                limit=100,
                return_properties=[
                    "school", "name", "email", "gender", "grade", "residential_status",
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

@router.get("/visiting-students/unmatched")
async def get_unmatched_students(api_keys=Depends(get_token_then_APIS_cached)):
    """Retrieve all unmatched visiting students from the database."""
    try:
        logger.info("Fetching unmatched visiting students")
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            visiting_student_collection = client.collections.get(collection_name)
            
            # Query unmatched visiting students
            response = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("is_matched").equal(0),  # Use 0 for unmatched
                limit=100,
                return_properties=[
                    "school", "name", "email", "gender", "grade", "residential_status",
                    "city_country", "sports", "extracurricular_activities",
                    "academic_interests", "additional_information", "race",
                    "tour_datetime", "is_matched", "matched_tour_guide"
                ]
            )

            students = []
            if response and hasattr(response, 'objects'):
                for obj in response.objects:
                    students.append(obj.properties)
            
            logger.info(f"Retrieved {len(students)} unmatched visiting students")

            return {
                "status": "success",
                "students": students
            }

    except Exception as e:
        logger.error(f"Error retrieving unmatched visiting students: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visiting-students/matched")
async def get_matched_students(api_keys=Depends(get_token_then_APIS_cached)):
    """Retrieve all matched visiting students from the database."""
    try:
        logger.info("Fetching matched visiting students")
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            visiting_student_collection = client.collections.get(collection_name)
            
            # Query matched visiting students
            response = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("is_matched").equal(1),  # Use 1 for matched
                limit=100,
                return_properties=[
                    "school", "name", "email", "gender", "grade", "residential_status",
                    "city_country", "sports", "extracurricular_activities",
                    "academic_interests", "additional_information", "race",
                    "tour_datetime", "is_matched", "matched_tour_guide"
                ]
            )

            students = []
            if response and hasattr(response, 'objects'):
                for obj in response.objects:
                    students.append(obj.properties)
            
            logger.info(f"Retrieved {len(students)} matched visiting students")

            return {
                "status": "success",
                "students": students
            }

    except Exception as e:
        logger.error(f"Error retrieving matched visiting students: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/visiting-students/{student_email}/match")
async def update_student_match(student_email: str, tour_guide_id: str, api_keys=Depends(get_token_then_APIS_cached)):
    """Update a visiting student's match status with a tour guide."""
    try:
        logger.info(f"Updating match status for student {student_email} with tour guide {tour_guide_id}")
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            visiting_student_collection = client.collections.get(collection_name)
            
            # Find the student by email
            student = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("email").equal(student_email),
                limit=1
            )
            
            if not student.objects:
                logger.error(f"Student not found with email: {student_email}")
                raise HTTPException(status_code=404, detail="Visiting student not found")
            
            # Update the student's match status
            student_obj = student.objects[0]
            student_obj.properties["is_matched"] = 1  # Use 1 for matched
            student_obj.properties["matched_tour_guide"] = tour_guide_id
            
            # Update the object in Weaviate
            visiting_student_collection.data.update(
                uuid=student_obj.uuid,
                properties=student_obj.properties
            )
            
            logger.info(f"Successfully updated match status for student {student_email}")
            
            return {
                "status": "success",
                "message": "Student match status updated successfully"
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating student match status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/visiting-students/{student_email}/unmatch")
async def unmatch_student(student_email: str, api_keys=Depends(get_token_then_APIS_cached)):
    """Unmatch a visiting student, moving them back to the unmatched list."""
    try:
        logger.info(f"Unmatching student with email: {student_email}")
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            visiting_student_collection = client.collections.get(collection_name)
            
            # Find the student by email
            student = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("email").equal(student_email),
                limit=1
            )
            
            if not student.objects:
                logger.error(f"Student not found with email: {student_email}")
                raise HTTPException(status_code=404, detail="Visiting student not found")
            
            # Update the student's match status
            student_obj = student.objects[0]
            student_obj.properties["is_matched"] = 0  # Set to unmatched (0)
            student_obj.properties["matched_tour_guide"] = None  # Clear the matched tour guide
            
            # Update the object in Weaviate
            visiting_student_collection.data.update(
                uuid=student_obj.uuid,
                properties=student_obj.properties
            )
            
            logger.info(f"Successfully unmatched student {student_email}")
            
            return {
                "status": "success",
                "message": "Student unmatched successfully"
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unmatching student: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 

@router.delete("/visiting-students/{student_email}")
async def delete_visiting_student(student_email: str, api_keys=Depends(get_token_then_APIS_cached)):
    """Delete a visiting student from the database."""
    try:
        logger.info(f"Attempting to delete visiting student with email: {student_email}")
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        with get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key) as client:
            # Get the VisitingStudent collection
            visiting_student_collection = client.collections.get(collection_name)
            logger.info(f"Successfully retrieved {collection_name} collection")
            
            # Find the student by email
            student = visiting_student_collection.query.fetch_objects(
                filters=Filter.by_property("email").equal(student_email),
                limit=1
            )
            logger.info(f"Query result: {student}")
            
            if not student.objects:
                logger.error(f"Student not found with email: {student_email}")
                raise HTTPException(status_code=404, detail="Visiting student not found")
            
            # Delete the student
            student_uuid = student.objects[0].uuid
            logger.info(f"Found student with UUID: {student_uuid}")
            
            # Use the correct method to delete the object
            visiting_student_collection.data.delete_many(
                where=Filter.by_property("email").equal(student_email)
            )
            logger.info(f"Successfully deleted visiting student with email: {student_email}")
            
            return {
                "status": "success",
                "message": "Visiting student deleted successfully"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting visiting student: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))