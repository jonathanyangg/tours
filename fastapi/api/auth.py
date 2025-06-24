from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import logging
import threading
from datetime import datetime, timedelta
from typing import Optional, Dict
from .supabase_client import get_supabase_client
from .supabase_client import get_admin_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Set up the HTTP bearer scheme for token extraction
bearer_scheme = HTTPBearer()


class AuthCache:
    """Thread-safe cache for API credentials with TTL expiration."""
    
    def __init__(self, default_ttl_minutes: int = 60):
        self._cache: Dict[str, Dict] = {}
        self._lock = threading.RLock()
        self.default_ttl = default_ttl_minutes
    
    def get(self, user_id: str) -> Optional[dict]:
        """Get cached credentials for a user."""
        with self._lock:
            if user_id in self._cache:
                entry = self._cache[user_id]
                if datetime.now() < entry['expires_at']:
                    return entry['credentials']
                else:
                    # Expired entry - remove it
                    del self._cache[user_id]
            
            return None
    
    def set(self, user_id: str, credentials: dict, ttl_minutes: Optional[int] = None):
        """Cache credentials for a user with TTL."""
        ttl = ttl_minutes or self.default_ttl
        with self._lock:
            self._cache[user_id] = {
                'credentials': credentials,
                'expires_at': datetime.now() + timedelta(minutes=ttl)
            }
    
    def clear_expired(self):
        """Remove expired entries from cache."""
        with self._lock:
            now = datetime.now()
            expired_keys = [
                user_id for user_id, entry in self._cache.items()
                if now >= entry['expires_at']
            ]
            for key in expired_keys:
                del self._cache[key]
            if expired_keys:
                logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")


# Global cache instance
auth_cache = AuthCache(default_ttl_minutes=60)


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
                'weaviate_url',
                'weaviate_api_key',
                'openai_api_key'
            ).eq('CEEB', ceeb_code).execute()
            logger.info(f"HELLO")
            logger.info(f"Response: {response.data}")
            if not response.data:
                raise ValueError(f"No API keys found for CEEB: {ceeb_code}")
                
            return response.data[0]
    except Exception as e:
        raise ValueError(f"Error getting API keys: {str(e)}")
    

def get_token_then_APIS_cached(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """Cached version of authentication function - improves performance by caching API credentials."""
    token = credentials.credentials
    try:
        with get_supabase_client() as supabase:
            # Step 1: Always verify token (required for security)
            response = supabase.auth.get_user(token)
            if not response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or user not found"
                )
            supabase.auth.set_session(token, "") 

            user_id = response.user.id
            
            # Step 2: Check cache first
            cached_credentials = auth_cache.get(user_id)
            if cached_credentials:
                return cached_credentials
            
            # Step 3: Cache miss - fetch from database
            api_keys_response = supabase.table('admin_to_school').select(
                'weaviate_url', 
                'weaviate_api_key', 
                'openai_api_key'
            ).eq('user_id', user_id).execute()
            
            if not api_keys_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No API keys found"
                )
            
            credentials_data = api_keys_response.data[0]
            
            # Step 4: Cache the result
            auth_cache.set(user_id, credentials_data)
            
            return credentials_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )