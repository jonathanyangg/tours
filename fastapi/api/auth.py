from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import logging
from .supabase_client import get_supabase_client
from .supabase_client import get_admin_supabase_client

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
    

def get_school_api_keys(ceeb_code):
    """Get school API keys using service role client to bypass RLS"""
    try:
        with get_admin_supabase_client() as supabase:
            response = supabase.table('school_api_keys').select(
                'matching_cluster_weaviate_url',
                'matching_cluster_weaviate_api_key',
                'openai_api_key'
            ).eq('CEEB', ceeb_code).execute()
            logger.info(f"HELLO")
            logger.info(f"Response: {response.data}")
            if not response.data:
                raise ValueError(f"No API keys found for CEEB: {ceeb_code}")
                
            return response.data[0]
    except Exception as e:
        raise ValueError(f"Error getting API keys: {str(e)}")
    
    
def get_token_then_APIS(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        with get_supabase_client() as supabase:
            # Verify token and get user info
            response = supabase.auth.get_user(token)
            if not response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or user not found"
                )
            supabase.auth.set_session(token, "") 

            # Step 1: Get the CEEB code associated with this user
            user_id = response.user.id
            user_school_response = supabase.table('admin_to_school').select('school_CEEB').eq('user_id', user_id).execute()
            
            if not user_school_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not associated with any school"
                )
            #THIS IS ACTUALLY WRONG, WE HAVE SINCE MOVED EVERYTHING TO 1 CLUSTER AND NOW USE DIFFERENT COLLECTIONS. 
            ceeb_code = user_school_response.data[0]['school_CEEB']
            logger.info(f"CEEB code: {ceeb_code}")
            # Step 2: Use the CEEB code to get the school's API keys
            school_api_keys_response = supabase.table('school_api_keys').select(
                'matching_cluster_weaviate_url', 
                'matching_cluster_weaviate_api_key', 
                'openai_api_key'
            ).eq('CEEB', ceeb_code).execute()
            logger.info(f"School API keys response: {school_api_keys_response}")
            
            if not school_api_keys_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No API keys found"
                )
                
            return school_api_keys_response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )