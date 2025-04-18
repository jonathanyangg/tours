from fastapi import APIRouter, HTTPException
import logging
from .tour_guides import get_tour_guides_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def delete_tour_guide_schema():
    """Delete the tour guide schema if it exists."""
    try:
        with get_tour_guides_client() as client:
            if "TourGuide" in client.collections.list_all():
                client.collections.delete("TourGuide")
                logger.info("Deleted existing TourGuide schema")
                return True
            return False
    except Exception as e:
        logger.error(f"Error deleting TourGuide schema: {e}")
        raise

@router.delete("/tour-guides/schema")
async def delete_schema():
    """Endpoint to delete the tour guide schema. Use with caution as this will delete all tour guide data."""
    try:
        deleted = delete_tour_guide_schema()
        if deleted:
            return {"status": "success", "message": "TourGuide schema deleted successfully"}
        return {"status": "not_found", "message": "TourGuide schema does not exist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 