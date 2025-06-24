from fastapi import APIRouter, HTTPException, Depends
import logging
from contextlib import contextmanager
import weaviate
from weaviate.classes.init import Auth
from ..auth import get_token_then_APIS_cached
from ..weaviate_pool import get_weaviate_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def delete_tour_guide_schema(weaviate_url=None, weaviate_api_key=None, openai_api_key=None, user_id=None):
    """Delete the tour guide schema if it exists."""
    try:
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        if "Tour_guides" in client.collections.list_all():
            client.collections.delete("Tour_guides")
            logger.info("Deleted existing TourGuide schema")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting TourGuide schema: {e}")
        raise

@router.delete("/tour-guides-deletion/schema")
async def delete_schema(api_keys=Depends(get_token_then_APIS_cached)):
    """Endpoint to delete the tour guide schema. Use with caution as this will delete all tour guide data."""
    try:
        weaviate_url = api_keys["weaviate_url"]
        weaviate_api_key = api_keys["weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        user_id = api_keys["user_id"]
        
        deleted = delete_tour_guide_schema(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        if deleted:
            return {"status": "success", "message": "TourGuide schema deleted successfully"}
        return {"status": "not_found", "message": "TourGuide schema does not exist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))