import weaviate
from weaviate.classes.init import Auth
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException
from .auth import get_token_then_APIS_cached

router = APIRouter()

logger = logging.getLogger(__name__)

class WeaviateClientWrapper:
    def __init__(self, weaviate_url: str, weaviate_api_key: str, openai_api_key: str, user_id: str):
        self.weaviate_url = weaviate_url
        self.weaviate_api_key = weaviate_api_key
        self.openai_api_key = openai_api_key
        self.user_id = user_id
        self.last_used = datetime.now()
        self.client = self._connect()

    def _connect(self):
        """Create and return a Weaviate client connection."""
        try:
            headers = {
                "X-OpenAI-Api-Key": self.openai_api_key,
            }
            client = weaviate.connect_to_weaviate_cloud(
                cluster_url=self.weaviate_url,
                auth_credentials=Auth.api_key(self.weaviate_api_key),
                headers=headers
            )
            logger.info(f"Successfully connected to Weaviate for user {self.user_id}")
            return client
        except Exception as e:
            logger.error(f"Failed to connect to Weaviate for user {self.user_id}: {e}")
            raise

    def update_last_used(self):
        """Update the last used timestamp."""
        self.last_used = datetime.now()

    def close(self):
        """Close the Weaviate client connection."""
        if self.client:
            try:
                self.client.close()
                logger.info(f"Closed Weaviate connection for user {self.user_id}")
            except Exception as e:
                logger.error(f"Error closing Weaviate connection for user {self.user_id}: {e}")

class WeaviatePool:
    def __init__(self, idle_timeout_minutes: int = 30):
        self._pool: Dict[str, WeaviateClientWrapper] = {}
        self._lock = threading.RLock()
        self.idle_timeout = timedelta(minutes=idle_timeout_minutes)
        self._cleanup_thread = None
        self._start_cleanup_thread()

    def _start_cleanup_thread(self):
        """Start the background cleanup thread."""
        self._cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self._cleanup_thread.start()
        logger.info("Started Weaviate pool cleanup thread")

    def _cleanup_worker(self):
        """Background worker that cleans expired connections every hour."""
        while True:
            time.sleep(3600)  # Wait 1 hour (3600 seconds)
            try:
                self.clean_expired_clients()
            except Exception as e:
                logger.error(f"Error in cleanup worker: {e}")

    def get_client(self, weaviate_url: str, weaviate_api_key: str, openai_api_key: str, user_id: str):
        """Get a Weaviate client from the pool or create a new one."""
        with self._lock:
            if user_id in self._pool:
                wrapper = self._pool[user_id]
                wrapper.update_last_used()
                logger.info(f"Reusing existing Weaviate client for user {user_id}")
                return wrapper.client
            else:
                wrapper = WeaviateClientWrapper(weaviate_url, weaviate_api_key, openai_api_key, user_id)
                self._pool[user_id] = wrapper
                logger.info(f"Created new Weaviate client for user {user_id}")
                return wrapper.client

    def clean_expired_clients(self):
        """Clean expired clients from the pool."""
        with self._lock:
            current_time = datetime.now()
            expired_users = []
            
            for user_id, wrapper in self._pool.items():
                if current_time - wrapper.last_used > self.idle_timeout:
                    expired_users.append(user_id)
            
            for user_id in expired_users:
                wrapper = self._pool.pop(user_id)
                wrapper.close()
                logger.info(f"Cleaned expired Weaviate client for user {user_id}")
            
            if expired_users:
                logger.info(f"Cleaned {len(expired_users)} expired connections")

    def get_pool_status(self):
        """Get current pool status for debugging."""
        with self._lock:
            return {
                "active_connections": len(self._pool),
                "users": list(self._pool.keys()),
                "last_used_times": {user_id: wrapper.last_used.isoformat() 
                                 for user_id, wrapper in self._pool.items()}
            }

    def health_check_and_restart(self):
        """Check if cleanup thread is alive and restart if needed."""
        is_alive = self._cleanup_thread and self._cleanup_thread.is_alive()
        
        if not is_alive:
            logger.warning("Cleanup thread is dead, restarting...")
            self._start_cleanup_thread()
            return {"status": "restarted", "thread_alive": True}
        else:
            return {"status": "healthy", "thread_alive": True}


# Global pool instance
_weaviate_pool = WeaviatePool(idle_timeout_minutes=30)

def get_weaviate_client(weaviate_url: str, weaviate_api_key: str, openai_api_key: str, user_id: str):
    return _weaviate_pool.get_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)

def get_pool_status():
    """Get current pool status for debugging."""
    return _weaviate_pool.get_pool_status()

@router.get("/health-check-cleanup-thread")
def health_check_cleanup_thread():
    """Public function to check and restart cleanup thread if needed."""
    return _weaviate_pool.health_check_and_restart()


@router.get("/test-weaviate")
async def test_weaviate_connection(api_keys=Depends(get_token_then_APIS_cached)):
    """Test the connection to Weaviate using user-specific credentials (with caching)."""
    weaviate_url = api_keys["weaviate_url"]
    weaviate_api_key = api_keys["weaviate_api_key"]
    openai_api_key = api_keys["openai_api_key"]
    user_id = api_keys["user_id"]
    try:
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        # Try to list collections
        collections = client.collections.list_all()
        return {
            "status": "success",
            "message": "Successfully connected to Weaviate",
            "collections": collections
        }
    except Exception as e:
        logger.error(f"Error connecting to Weaviate: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 