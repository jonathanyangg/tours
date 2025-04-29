from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user

router = APIRouter()

@router.get("/test-auth")
async def test_protected_route(user=Depends(get_current_user)):
    """
    A test endpoint to verify authentication is working.
    This endpoint will only work if a valid JWT token is provided.
    """
    # The user object returned by Supabase will have a 'user' property
    # containing the user details
    user_data = user.user
    
    return {
        "message": "You have successfully accessed a protected route!",
        "user_id": user_data.id,
        "email": user_data.email,
        "status": "success"
    }

@router.post("/test-auth/data")
async def test_protected_post(
    data: dict,
    user=Depends(get_current_user)
):
    """
    A test POST endpoint that requires authentication.
    Send any JSON data to see it echoed back with your user info.
    """
    # Extract user data from the Supabase response
    user_data = user.user
    
    return {
        "message": "Successfully posted to protected route!",
        "user_id": user_data.id,
        "email": user_data.email,
        "received_data": data,
        "status": "success"
    } 