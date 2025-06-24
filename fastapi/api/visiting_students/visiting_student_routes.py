from fastapi import APIRouter, HTTPException, Depends
import logging
import json
from weaviate.collections.classes.filters import Filter
from ..auth import get_token_then_APIS_cached, get_school_api_keys
from ..weaviate_pool import get_weaviate_client
from .visiting_student_functions import (
    VisitingStudent, 
    create_schema, 
    create_text_representation, 
    prepare_student_data,
    collection_name
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/visiting-students/{ceeb_code}")
async def create_visiting_student(ceeb_code: str, student: VisitingStudent):
    """Create a new visiting student record and store it in Weaviate."""
    try:
        logger.info(f"Received visiting student data for school {ceeb_code}: {json.dumps(student.model_dump(), indent=2)}")
        school_ceeb = ceeb_code
       
        api_keys = get_school_api_keys(school_ceeb)
        
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        user_id = "school_user"  # For school-based endpoints, use a generic user_id
        logger.info(f"Processing student for school: {school_ceeb}")
        logger.info(f"Using Weaviate cluster: {weaviate_url}")
        # NEVER log API keys - security risk!

        # Create text representation for vector search
        text_representation = create_text_representation(student)
        logger.info(f"Generated text representation: {text_representation}")

        # Log that vector was generated
        logger.info("Vector property generated successfully")
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        # Get the VisitingStudent collection
        if collection_name not in client.collections.list_all():
            create_schema(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        visiting_student_collection = client.collections.get(collection_name)
        logger.info(f"Retrieved {collection_name} collection")

        # Create the student object
        student_data = prepare_student_data(student, school_ceeb, text_representation)
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
            logger.info(f"Student object retrieved successfully for email: {student.email}")
            if student_obj.vector:
                logger.info("Vector was successfully generated and stored")
            else:
                logger.warning("Vector was not generated - check OpenAI API key and text_representation")
        else:
            logger.error("Could not retrieve inserted student for verification")

        return {
            "status": "success",
            "message": "Student created successfully",
            "student_id": result,
            "vector_generated": bool(inserted_student.objects and inserted_student.objects[0].vector)
        }

    except Exception as e:
        logger.error(f"Error creating visiting student: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/visiting-students")
async def get_visiting_students(api_data=Depends(get_token_then_APIS_cached)):
    """Retrieve all visiting students from Weaviate."""
    try:
        user_id = api_data["user_id"]
        weaviate_url = api_data["weaviate_url"]
        weaviate_api_key = api_data["weaviate_api_key"]
        openai_api_key = api_data["openai_api_key"]
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
        # Check if the visiting_students collection exists
        if collection_name not in client.collections.list_all():
            return {
                "status": "empty",
                "message": "No visiting students currently in database",
                "students": []
            }
        
        # Get the collection
        visiting_student_collection = client.collections.get(collection_name)
        
        # Fetch all visiting students
        query_result = visiting_student_collection.query.fetch_objects(limit=10000)
        
        # Convert the response to a format that can be JSON serialized
        students = []
        if query_result and hasattr(query_result, 'objects'):
            for obj in query_result.objects:
                students.append({
                    "school": obj.properties.get("school", ""),
                    "name": obj.properties.get("name", ""),
                    "email": obj.properties.get("email", ""),
                    "gender": obj.properties.get("gender", ""),
                    "grade": obj.properties.get("grade", ""),
                    "residential_status": obj.properties.get("residential_status", ""),
                    "city_country": obj.properties.get("city_country", ""),
                    "sports": obj.properties.get("sports", ""),
                    "extracurricular_activities": obj.properties.get("extracurricular_activities", ""),
                    "academic_interests": obj.properties.get("academic_interests", ""),
                    "additional_information": obj.properties.get("additional_information", ""),
                    "race": obj.properties.get("race", ""),
                    "tour_datetime": obj.properties.get("tour_datetime", ""),
                    "is_matched": obj.properties.get("is_matched", 0),
                    "matched_tour_guide": obj.properties.get("matched_tour_guide", "")
                })
        
        return {
            "status": "success",
            "message": "Visiting students retrieved successfully",
            "students": students
        }
    except Exception as e:
        logger.error(f"Error retrieving visiting students: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/visiting-students/unmatched")
async def get_unmatched_students(api_data=Depends(get_token_then_APIS_cached)):
    """Retrieve all unmatched visiting students from Weaviate."""
    try:
        user_id = api_data["user_id"]
        weaviate_url = api_data["weaviate_url"]
        weaviate_api_key = api_data["weaviate_api_key"]
        openai_api_key = api_data["openai_api_key"]
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
        # Check if the visiting_students collection exists
        if collection_name not in client.collections.list_all():
            return {
                "status": "empty",
                "message": "No visiting students currently in database",
                "students": []
            }
        
        # Get the collection
        visiting_student_collection = client.collections.get(collection_name)
        
        # Fetch unmatched visiting students (is_matched = 0)
        query_result = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("is_matched").equal(0),
            limit=10000
        )
        
        # Convert the response to a format that can be JSON serialized
        students = []
        if query_result and hasattr(query_result, 'objects'):
            for obj in query_result.objects:
                students.append({
                    "school": obj.properties.get("school", ""),
                    "name": obj.properties.get("name", ""),
                    "email": obj.properties.get("email", ""),
                    "gender": obj.properties.get("gender", ""),
                    "grade": obj.properties.get("grade", ""),
                    "residential_status": obj.properties.get("residential_status", ""),
                    "city_country": obj.properties.get("city_country", ""),
                    "sports": obj.properties.get("sports", ""),
                    "extracurricular_activities": obj.properties.get("extracurricular_activities", ""),
                    "academic_interests": obj.properties.get("academic_interests", ""),
                    "additional_information": obj.properties.get("additional_information", ""),
                    "race": obj.properties.get("race", ""),
                    "tour_datetime": obj.properties.get("tour_datetime", ""),
                    "is_matched": obj.properties.get("is_matched", 0),
                    "matched_tour_guide": obj.properties.get("matched_tour_guide", "")
                })
        
        return {
            "status": "success",
            "message": f"Found {len(students)} unmatched visiting students",
            "students": students
        }
    except Exception as e:
        logger.error(f"Error retrieving unmatched students: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/visiting-students/matched")
async def get_matched_students(api_data=Depends(get_token_then_APIS_cached)):
    """Retrieve all matched visiting students from Weaviate."""
    try:
        user_id = api_data["user_id"]
        weaviate_url = api_data["weaviate_url"]
        weaviate_api_key = api_data["weaviate_api_key"]
        openai_api_key = api_data["openai_api_key"]
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
        # Check if the visiting_students collection exists
        if collection_name not in client.collections.list_all():
            return {
                "status": "empty",
                "message": "No visiting students currently in database",
                "students": []
            }
        
        # Get the collection
        visiting_student_collection = client.collections.get(collection_name)
        
        # Fetch matched visiting students (is_matched = 1)
        query_result = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("is_matched").equal(1),
            limit=10000
        )
        
        # Convert the response to a format that can be JSON serialized
        students = []
        if query_result and hasattr(query_result, 'objects'):
            for obj in query_result.objects:
                students.append({
                    "school": obj.properties.get("school", ""),
                    "name": obj.properties.get("name", ""),
                    "email": obj.properties.get("email", ""),
                    "gender": obj.properties.get("gender", ""),
                    "grade": obj.properties.get("grade", ""),
                    "residential_status": obj.properties.get("residential_status", ""),
                    "city_country": obj.properties.get("city_country", ""),
                    "sports": obj.properties.get("sports", ""),
                    "extracurricular_activities": obj.properties.get("extracurricular_activities", ""),
                    "academic_interests": obj.properties.get("academic_interests", ""),
                    "additional_information": obj.properties.get("additional_information", ""),
                    "race": obj.properties.get("race", ""),
                    "tour_datetime": obj.properties.get("tour_datetime", ""),
                    "is_matched": obj.properties.get("is_matched", 0),
                    "matched_tour_guide": obj.properties.get("matched_tour_guide", "")
                })
        
        return {
            "status": "success",
            "message": f"Found {len(students)} matched visiting students",
            "students": students
        }
    except Exception as e:
        logger.error(f"Error retrieving matched students: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/visiting-students/{student_email}/match")
async def update_student_match(student_email: str, tour_guide_id: str, api_data=Depends(get_token_then_APIS_cached)):
    """Update a student's match status and assign a tour guide."""
    try:
        user_id = api_data["user_id"]
        weaviate_url = api_data["weaviate_url"]
        weaviate_api_key = api_data["weaviate_api_key"]
        openai_api_key = api_data["openai_api_key"]
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
        # Get the collection
        visiting_student_collection = client.collections.get(collection_name)
        
        # Find the student by email
        query_result = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("email").equal(student_email),
            limit=1
        )
        
        if not query_result.objects:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_obj = query_result.objects[0]
        
        # Update the student object
        visiting_student_collection.data.update(
            uuid=student_obj.uuid,
            properties={
                "is_matched": 1,
                "matched_tour_guide": tour_guide_id
            }
        )
        
        return {
            "status": "success",
            "message": f"Student {student_email} successfully matched with tour guide {tour_guide_id}"
        }
    except Exception as e:
        logger.error(f"Error updating student match: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/visiting-students/{student_email}/unmatch")
async def unmatch_student(student_email: str, api_data=Depends(get_token_then_APIS_cached)):
    """Remove a student's match and set them back to unmatched status."""
    try:
        user_id = api_data["user_id"]
        weaviate_url = api_data["weaviate_url"]
        weaviate_api_key = api_data["weaviate_api_key"]
        openai_api_key = api_data["openai_api_key"]
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
        # Get the collection
        visiting_student_collection = client.collections.get(collection_name)
        
        # Find the student by email
        query_result = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("email").equal(student_email),
            limit=1
        )
        
        if not query_result.objects:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_obj = query_result.objects[0]
        
        # Update the student object to unmatched status
        visiting_student_collection.data.update(
            uuid=student_obj.uuid,
            properties={
                "is_matched": 0,
                "matched_tour_guide": ""
            }
        )
        
        return {
            "status": "success",
            "message": f"Student {student_email} successfully unmatched"
        }
    except Exception as e:
        logger.error(f"Error unmatching student: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/visiting-students/{student_email}")
async def delete_visiting_student(student_email: str, api_data=Depends(get_token_then_APIS_cached)):
    """Delete a visiting student from Weaviate."""
    try:
        user_id = api_data["user_id"]
        weaviate_url = api_data["weaviate_url"]
        weaviate_api_key = api_data["weaviate_api_key"]
        openai_api_key = api_data["openai_api_key"]
        
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        
        # Get the collection
        visiting_student_collection = client.collections.get(collection_name)
        
        # Find the student by email
        query_result = visiting_student_collection.query.fetch_objects(
            filters=Filter.by_property("email").equal(student_email),
            limit=1
        )
        
        if not query_result.objects:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_obj = query_result.objects[0]
        
        # Delete the student
        visiting_student_collection.data.delete_by_id(student_obj.uuid)
        
        return {
            "status": "success",
            "message": f"Student {student_email} successfully deleted"
        }
    except Exception as e:
        logger.error(f"Error deleting student: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 