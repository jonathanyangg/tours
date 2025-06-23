from fastapi import APIRouter, HTTPException, Depends
import logging
from contextlib import contextmanager
import weaviate
from weaviate.classes.init import Auth
from ..auth import get_token_then_APIS, get_token_then_APIS_cached

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@contextmanager
def get_weaviate_client(tour_guides_weaviate_url=None, tour_guides_weaviate_api_key=None, openai_api_key=None):
    client = None
    headers = {
        "X-OpenAI-Api-Key": openai_api_key,
    }

    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=tour_guides_weaviate_url,
            auth_credentials=Auth.api_key(tour_guides_weaviate_api_key),
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

def delete_tour_guide_schema(tour_guides_weaviate_url=None, tour_guides_weaviate_api_key=None, openai_api_key=None):
    """Delete the tour guide schema if it exists."""
    try:
        with get_weaviate_client(tour_guides_weaviate_url, tour_guides_weaviate_api_key, openai_api_key) as client:
            if "TourGuide" in client.collections.list_all():
                client.collections.delete("TourGuide")
                logger.info("Deleted existing TourGuide schema")
                return True
            return False
    except Exception as e:
        logger.error(f"Error deleting TourGuide schema: {e}")
        raise

@router.delete("/schema")
async def delete_schema(api_keys=Depends(get_token_then_APIS_cached)):
    """Endpoint to delete the tour guide schema. Use with caution as this will delete all tour guide data."""
    try:
        tour_guides_weaviate_url = api_keys["tour_guides_weaviate_url"]
        tour_guides_weaviate_api_key = api_keys["tour_guides_weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]
        
        deleted = delete_tour_guide_schema(tour_guides_weaviate_url, tour_guides_weaviate_api_key, openai_api_key)
        if deleted:
            return {"status": "success", "message": "TourGuide schema deleted successfully"}
        return {"status": "not_found", "message": "TourGuide schema does not exist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))