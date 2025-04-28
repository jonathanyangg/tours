from fastapi import APIRouter, HTTPException
import logging
from .visiting_students import get_weaviate_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def delete_visiting_student_schema():
    """Delete the visiting student schema if it exists."""
    try:
        with get_weaviate_client() as client:
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