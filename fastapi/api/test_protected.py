from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from dotenv import load_dotenv
import os
import logging
from .supabase_client import get_supabase_client

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
async def get_weaviate_credentials(response_data=Depends(get_current_user)):
    table_name = "school_weaviate_credentials"
    columns = [
        "tour_guides_weaviate_url", 
        "tour_guides_weaviate_api_key", 
        "visiting_students_weaviate_url", 
        "visiting_students_weaviate_api_key", 
        "openai_api_key"
    ]

    user_id = response_data.id
    try:
        with get_supabase_client() as supabase:
            # Create the select query with the specified columns
            supabase_data_response = supabase.table(table_name).select(','.join(columns)).eq('user_id', user_id).execute()

            if supabase_data_response.data:
                return {
                    "status": "success",
                    "data": supabase_data_response.data
                } 
            else:
                logger.error(f"No data found for user {user_id}")
                raise HTTPException(
                    status_code=404,
                    detail="Credentials not found for this user"
                )
    except Exception as e:
        logger.error(f"Error fetching credentials: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching credentials: {str(e)}"
        )