from fastapi import APIRouter, HTTPException, Depends
import logging
from contextlib import contextmanager
import weaviate
from weaviate.classes.init import Auth
from ..auth import get_token_then_APIS_cached

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()    

@contextmanager
def get_weaviate_client(visiting_students_weaviate_url=None, visiting_students_weaviate_api_key=None, openai_api_key=None):
    client = None
    headers = {
        "X-OpenAI-Api-Key": openai_api_key,
    }

    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=visiting_students_weaviate_url,
            auth_credentials=Auth.api_key(visiting_students_weaviate_api_key),
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

def delete_visiting_student_schema(visiting_students_weaviate_url=None, visiting_students_weaviate_api_key=None, openai_api_key=None):
    """Delete the visiting student schema if it exists."""
    try:
        with get_weaviate_client(visiting_students_weaviate_url, visiting_students_weaviate_api_key, openai_api_key) as client:
            if "VisitingStudent" in client.collections.list_all():
                client.collections.delete("VisitingStudent")
                logger.info("Deleted existing VisitingStudent schema")
                return True
            return False
    except Exception as e:
        logger.error(f"Error deleting VisitingStudent schema: {e}")
        raise

@router.delete("/schema")
async def delete_schema(api_keys=Depends(get_token_then_APIS_cached)):
    """Endpoint to delete the visiting student schema. Use with caution as this will delete all visiting student data."""
    try:
        visiting_students_weaviate_url = api_keys["visiting_students_weaviate_url"]
        visiting_students_weaviate_api_key = api_keys["visiting_students_weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        deleted = delete_visiting_student_schema(visiting_students_weaviate_url, visiting_students_weaviate_api_key, openai_api_key)
        if deleted:
            return {"status": "success", "message": "VisitingStudent schema deleted successfully"}
        return {"status": "not_found", "message": "VisitingStudent schema does not exist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 