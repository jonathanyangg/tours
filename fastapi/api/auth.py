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
        self.stats = {'hits': 0, 'misses': 0}
        self.stats_reset_time = datetime.now()
        self.stats_reset_interval_days = 7  # Reset every week
    
    def _check_and_reset_stats(self):
        """Check if stats should be reset (weekly) and reset if needed."""
        with self._lock:
            days_since_reset = (datetime.now() - self.stats_reset_time).days
            if days_since_reset >= self.stats_reset_interval_days:
                old_stats = self.stats.copy()
                self.stats = {'hits': 0, 'misses': 0}
                self.stats_reset_time = datetime.now()
                logger.info(f"Weekly stats reset: Previous week had {old_stats['hits']} hits, {old_stats['misses']} misses, {self._calculate_hit_rate(old_stats['hits'], old_stats['misses']):.1f}% hit rate")
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> float:
        """Calculate hit rate from given hits and misses."""
        total = hits + misses
        if total == 0:
            return 0.0
        return (hits / total) * 100
    
    def get(self, user_id: str) -> Optional[dict]:
        """Get cached credentials for a user."""
        self._check_and_reset_stats()  # Check for weekly reset
        
        with self._lock:
            if user_id in self._cache:
                entry = self._cache[user_id]
                if datetime.now() < entry['expires_at']:
                    self.stats['hits'] += 1
                    logger.info(f"Cache hit for user {user_id[:8]}... (hit rate: {self.get_hit_rate():.1f}%)")
                    return entry['credentials']
                else:
                    # Expired entry - remove it
                    del self._cache[user_id]
                    logger.info(f"Cache expired for user {user_id[:8]}...")
            
            self.stats['misses'] += 1
            logger.info(f"Cache miss for user {user_id[:8]}... (hit rate: {self.get_hit_rate():.1f}%)")
            return None
    
    def set(self, user_id: str, credentials: dict, ttl_minutes: Optional[int] = None):
        """Cache credentials for a user with TTL."""
        self._check_and_reset_stats()  # Check for weekly reset
        
        ttl = ttl_minutes or self.default_ttl
        with self._lock:
            self._cache[user_id] = {
                'credentials': credentials,
                'expires_at': datetime.now() + timedelta(minutes=ttl)
            }
            logger.info(f"Cached credentials for user {user_id[:8]}... (TTL: {ttl}min, cache size: {len(self._cache)})")
    
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
    
    def get_hit_rate(self) -> float:
        """Calculate cache hit rate percentage."""
        return self._calculate_hit_rate(self.stats['hits'], self.stats['misses'])
    
    def get_stats(self) -> dict:
        """Get cache statistics with time since last reset."""
        self._check_and_reset_stats()  # Check for weekly reset
        
        with self._lock:
            days_since_reset = (datetime.now() - self.stats_reset_time).days
            hours_since_reset = (datetime.now() - self.stats_reset_time).total_seconds() / 3600
            
            return {
                'hits': self.stats['hits'],
                'misses': self.stats['misses'],
                'hit_rate': self.get_hit_rate(),
                'cache_size': len(self._cache),
                'days_since_reset': days_since_reset,
                'hours_since_reset': round(hours_since_reset, 1),
                'next_reset_in_days': self.stats_reset_interval_days - days_since_reset
            }
    
    def force_reset_stats(self):
        """Manually reset statistics (for testing or manual reset)."""
        with self._lock:
            old_stats = self.stats.copy()
            self.stats = {'hits': 0, 'misses': 0}
            self.stats_reset_time = datetime.now()
            logger.info(f"Manual stats reset: Previous period had {old_stats['hits']} hits, {old_stats['misses']} misses, {self._calculate_hit_rate(old_stats['hits'], old_stats['misses']):.1f}% hit rate")


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
    
    
def get_token_then_APIS(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """Original authentication function - kept for backward compatibility during rollout."""
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
            api_keys_response = supabase.table('admin_to_school').select(
                'weaviate_url', 
                'weaviate_api_key', 
                'openai_api_key').eq('user_id', user_id).execute()
            
            if not api_keys_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No API keys found"
                )
            return api_keys_response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )


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