from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import logging
from .supabase_client import get_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Set up the HTTP bearer scheme for token extraction
bearer_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    #CITATION: https://supabase.com/docs/reference/python/auth-getuser
    token = credentials.credentials
    try:
        with get_supabase_client() as supabase:
            # Use Supabase client to verify the token and get user info
            response = supabase.auth.get_user(token)
            if not response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or user not found"
                )
            supabase.auth.set_session(token, "") 
            return response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )
    
def get_token_then_APIS(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        with get_supabase_client() as supabase:
            # Use Supabase client to verify the token and get user info
            response = supabase.auth.get_user(token)
            if not response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or user not found"
                )
            supabase.auth.set_session(token, "") 

            response_user = response.user
            user_id = response_user.id
            supabase_data_response = supabase.table('school_weaviate_credentials').select('tour_guides_weaviate_url', 'tour_guides_weaviate_api_key', 'visiting_students_weaviate_url', 'visiting_students_weaviate_api_key', 'openai_api_key').eq('user_id', user_id).execute()
            return supabase_data_response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )

    