# supabase_client.py
from supabase import create_client
from dotenv import load_dotenv
import os
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

@contextmanager
def get_supabase_client():
    """Context manager for Supabase client connections."""
    client = None
    try:
        client = create_client(URL, KEY)
        logger.info("Successfully created Supabase client")
        yield client
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        raise
    finally:
        if client:
            # Currently, Supabase Python client doesn't have an explicit close method
            # This is a placeholder for when/if they add one
            logger.info("Supabase client context exited")

# Create a global client for backward compatibility
# This will be deprecated in favor of the context manager