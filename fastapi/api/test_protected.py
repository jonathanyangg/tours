from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from dotenv import load_dotenv
import os
import logging
from .supabase_client import get_supabase_client
from .auth import get_token_then_APIS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

load_dotenv()

@router.get("/test-auth")
async def test_protected_route(response_data=Depends(get_current_user)):
    """
    A test endpoint to verify authentication is working.
    This endpoint will only work if a valid JWT token is provided.
    """
    return {
        "message": "You have successfully accessed a protected route!",
        "user_id": response_data.id,
        "email": response_data.email,
        "status": "success"
    }

@router.get("/user-credentials")
async def get_weaviate_credentials(api_keys=Depends(get_token_then_APIS)):
    try:
        tour_guides_weaviate_url = api_keys["tour_guides_weaviate_url"]
        tour_guides_weaviate_api_key = api_keys["tour_guides_weaviate_api_key"]
        visiting_students_weaviate_url = api_keys["visiting_students_weaviate_url"]
        visiting_students_weaviate_api_key = api_keys["visiting_students_weaviate_api_key"]
        openai_api_key = api_keys["openai_api_key"]

        return {
            "tour_guides_weaviate_url": tour_guides_weaviate_url,
            "tour_guides_weaviate_api_key": tour_guides_weaviate_api_key,
            "visiting_students_weaviate_url": visiting_students_weaviate_url,
            "visiting_students_weaviate_api_key": visiting_students_weaviate_api_key,
            "openai_api_key": openai_api_key
        }
    
    except Exception as e:
        logger.error(f"Error fetching credentials: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching credentials: {str(e)}"
        )