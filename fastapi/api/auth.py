from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import os

# Initialize Supabase client
NEXT_PUBLIC_SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
NEXT_PUBLIC_SUPABASE_ANON_KEY = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

# Create a global supabase client instance
supabase = create_client(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

# Set up the HTTP bearer scheme for token extraction
bearer_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """
    Verify the JWT token using Supabase's get_user method.
    This ensures the token is valid and returns the user information.
    """
    token = credentials.credentials
    try:
        # Use Supabase client to verify the token and get user info
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or user not found"
            )
        
        # Create a session object to simulate the same structure as sign_in
        # This helps maintain consistent behavior with email_supabase.py
        class Session:
            def __init__(self, access_token):
                self.access_token = access_token
                # We don't have refresh token from JWT auth, use access token as a fallback
                self.refresh_token = access_token
        
        user.session = Session(token)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )