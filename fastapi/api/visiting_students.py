from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import weaviate
from weaviate.classes.init import Auth
from weaviate.collections.classes.config import DataType
from weaviate.collections.classes.filters import Filter
import os
from dotenv import load_dotenv
import logging
import json
import weaviate.collections.classes.config as wvc

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
    is_matched: Optional[bool] = False
    matched_tour_guide: Optional[str] = None

def create_visiting_student_schema():
    """Create the schema for visiting students if it doesn't exist."""
    try:
        # List existing collections (schemas)
        existing_collections = client.collections.list_all()
        logger.info(f"Existing collections: {existing_collections}")
        
        if "VisitingStudent" not in existing_collections:
            # Configure the OpenAI vectorizer
            vectorizer_config = wvc.Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-large",
                model_version="1.0.0",
                dimensions=3072
            )
            logger.info(f"Created vectorizer config: {vectorizer_config}")
            
            client.collections.create(
                name="VisitingStudent",
                description="A visiting student with their information and vector embedding",
                properties=[
                    {
                        "name": "name",
                        "data_type": DataType.TEXT,
                        "description": "The name of the visiting student",
                    },
                    {
                        "name": "email",
                        "data_type": DataType.TEXT,
                        "description": "The email of the visiting student",
                    },
                    {
                        "name": "gender",
                        "data_type": DataType.TEXT,
                        "description": "The gender of the visiting student",
                    },
                    {
                        "name": "grade",
                        "data_type": DataType.TEXT,
                        "description": "The grade of the visiting student",
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
                        "name": "is_matched",
                        "data_type": DataType.INT,
                        "description": "Whether the student has been matched with a tour guide (0=unmatched, 1=matched)",
                    },
                    {
                        "name": "matched_tour_guide",
                        "data_type": DataType.TEXT,
                        "description": "The ID of the matched tour guide",
                    },
                    {
                        "name": "text_representation",
                        "data_type": DataType.TEXT,
                        "description": "A text representation of the student's information for vector search",
                    }
                ],
                vectorizer_config=vectorizer_config
            )
            logger.info("Created VisitingStudent schema with vectorizer configuration")
            
            # Verify the schema was created correctly
            schema = client.collections.get("VisitingStudent").config.get()
            # Log only the relevant parts of the schema
            logger.info(f"Schema name: {schema.name}")
            logger.info(f"Schema description: {schema.description}")
            logger.info(f"Schema properties: {[prop.name for prop in schema.properties]}")
        else:
            logger.info("VisitingStudent schema already exists")
            # Log only the relevant parts of the existing schema
            schema = client.collections.get("VisitingStudent").config.get()
            logger.info(f"Schema name: {schema.name}")
            logger.info(f"Schema description: {schema.description}")
            logger.info(f"Schema properties: {[prop.name for prop in schema.properties]}")
    except Exception as e:
        logger.error(f"Error creating VisitingStudent schema: {e}")
        raise

def delete_visiting_student_schema():
    """Delete the visiting student schema if it exists."""
    try:
        if "VisitingStudent" in client.collections.list_all():
            client.collections.delete("VisitingStudent")
            logger.info("Deleted existing VisitingStudent schema")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting VisitingStudent schema: {e}")
        raise

@router.delete("/visiting-students/schema")
async def delete_schema():
    """Endpoint to delete the visiting student schema. Use with caution as this will delete all visiting student data."""
    try:
        deleted = delete_visiting_student_schema()
        if deleted:
            return {"status": "success", "message": "VisitingStudent schema deleted successfully"}
        return {"status": "not_found", "message": "VisitingStudent schema does not exist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

        # Log that vector was generated
        logger.info("Vector property generated successfully")
        
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

@router.get("/visiting-students/unmatched")
async def get_unmatched_students():
    """Retrieve all unmatched visiting students from the database."""
    try:
        logger.info("Fetching unmatched visiting students")
        visiting_student_collection = client.collections.get("VisitingStudent")
        
        # Query unmatched visiting students
        response = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("is_matched").equal(0),  # Use 0 for unmatched
            limit=100,
            return_properties=[
                "name", "email", "gender", "grade", "residential_status",
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
async def get_matched_students():
    """Retrieve all matched visiting students from the database."""
    try:
        logger.info("Fetching matched visiting students")
        visiting_student_collection = client.collections.get("VisitingStudent")
        
        # Query matched visiting students
        response = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("is_matched").equal(1),  # Use 1 for matched
            limit=100,
            return_properties=[
                "name", "email", "gender", "grade", "residential_status",
                "city_country", "sports", "extracurricular_activities",
                "academic_interests", "additional_information", "race",
                "tour_datetime", "is_matched", "matched_tour_guide"
            ]
        )

        students = []
        tour_guides_client = None
        if response and hasattr(response, 'objects'):
            for obj in response.objects:
                student_data = obj.properties
                
                # If there's a matched tour guide, fetch their name
                if student_data.get("matched_tour_guide"):
                    try:
                        # Connect to the tour guides database
                        tour_guides_client = weaviate.connect_to_weaviate_cloud(
                            cluster_url=os.environ["TOUR_GUIDE_WEAVIATE_URL"],
                            auth_credentials=Auth.api_key(os.environ["TOUR_GUIDE_WEAVIATE_API_KEY"]),
                            headers={"X-OpenAI-Api-Key": os.environ.get("OPENAI_API_KEY")}
                        )
                        
                        # Get the tour guide collection
                        tour_guide_collection = tour_guides_client.collections.get("TourGuide")
                        
                        # Fetch the tour guide by UUID
                        tour_guide = tour_guide_collection.query.fetch_objects(
                            filters=Filter.by_id().equal(student_data["matched_tour_guide"]),
                            limit=1
                        )
                        
                        # If tour guide found, add their name to the student data
                        if tour_guide and hasattr(tour_guide, 'objects') and tour_guide.objects:
                            tour_guide_name = tour_guide.objects[0].properties.get("student_id", "Unknown")
                            student_data["matched_tour_guide_name"] = tour_guide_name
                        else:
                            student_data["matched_tour_guide_name"] = "Unknown"
                    except Exception as e:
                        logger.error(f"Error fetching tour guide name: {e}")
                        student_data["matched_tour_guide_name"] = "Unknown"
                
                students.append(student_data)
        
        logger.info(f"Retrieved {len(students)} matched visiting students")

        # Close the tour guides client if it was created
        if tour_guides_client:
            tour_guides_client.close()

        return {
            "status": "success",
            "students": students
        }

    except Exception as e:
        logger.error(f"Error retrieving matched visiting students: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/visiting-students/{student_email}/match")
async def update_student_match(student_email: str, tour_guide_id: str):
    """Update a visiting student's match status with a tour guide."""
    try:
        logger.info(f"Updating match status for student {student_email} with tour guide {tour_guide_id}")
        visiting_student_collection = client.collections.get("VisitingStudent")
        
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

@router.delete("/visiting-students/{student_email}")
async def delete_visiting_student(student_email: str):
    """Delete a visiting student from the database."""
    try:
        logger.info(f"Attempting to delete visiting student with email: {student_email}")
        
        # Get the VisitingStudent collection
        visiting_student_collection = client.collections.get("VisitingStudent")
        logger.info("Successfully retrieved VisitingStudent collection")
        
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