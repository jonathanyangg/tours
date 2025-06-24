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
        "user_id": response_data["id"],
        "email": response_data["email"],
        "status": "success"
    }

