from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

load_dotenv()

NEXT_PUBLIC_SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
NEXT_PUBLIC_SUPABASE_ANON_KEY = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

supabase = create_client(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

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

@router.get("/user-credentials")
async def get_weaviate_credentials(user=Depends(get_current_user)):
    """
    Endpoint that fetches Weaviate credentials for the authenticated user.
    Uses the JWT token for authentication and returns the specific columns.
    """
    table_name = "school_weaviate_credentials"
    columns = [
        "tour_guides_weaviate_url", 
        "tour_guides_weaviate_api_key", 
        "visiting_students_weaviate_url", 
        "visiting_students_weaviate_api_key", 
        "openai_api_key"
    ]
    logger.info(f"user: {user.user}")
    # Call the get_user_data function directly with the user and specific parameters
    user_id = user.user.id
    logger.info(f"user: {user_id}")
    
    # Set the session with the user's access token
    # This ensures the Supabase client has the proper authorization
    if hasattr(user, 'session'):
        try:
            supabase.auth.set_session(user.session.access_token, user.session.refresh_token)
            logger.info("Session set successfully with access token")
        except Exception as e:
            logger.error(f"Error setting session: {e}")
    
    # Create the select query with the specified columns
    query = supabase.table(table_name).select(','.join(columns)).eq('user_id', user_id)
    
    # Execute the query
    try:
        response = query.execute()
        
        if response.data and len(response.data) > 0:
            return {
                "status": "success",
                "data": response.data
            } 
        else:
            logger.error(f"No data found for user {user_id}")
            raise HTTPException(
                status_code=404,
                detail="Credentials not found for this user"
            )
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching credentials: {str(e)}"
        )
    
@router.get("/db-schema")
async def get_db_schema():
    """
    Endpoint to check database schema information.
    This helps diagnose table and column name issues.
    """
    try:
        # Get information about tables in the public schema
        tables_query = """
        SELECT 
            tablename 
        FROM 
            pg_catalog.pg_tables 
        WHERE 
            schemaname = 'public'
        """
        
        # Query all available tables
        available_tables = []
        try:
            # Since select_rows_rpc might not exist, let's try checking tables directly
            schema_tables = supabase.from_("information_schema.tables")
            schema_tables = schema_tables.select("table_name")
            schema_tables = schema_tables.eq("table_schema", "public")
            tables_result = schema_tables.execute()
            
            if hasattr(tables_result, 'data'):
                available_tables = [table.get('table_name') for table in tables_result.data]
            
            logger.info(f"Available tables: {available_tables}")
        except Exception as e:
            logger.error(f"Error getting tables: {e}")
        
        # Check specifically for our target table
        target_table = "school_weaviate_credentials"
        table_exists = target_table in available_tables
        
        # If the table exists, try to get its columns
        columns = []
        if table_exists:
            try:
                # Try to get one row to see the column names
                columns_query = supabase.table(target_table).select("*").limit(1).execute()
                if hasattr(columns_query, 'data') and columns_query.data:
                    columns = list(columns_query.data[0].keys())
                logger.info(f"Table columns: {columns}")
            except Exception as e:
                logger.error(f"Error getting columns: {e}")
        
        return {
            "status": "success",
            "available_tables": available_tables,
            "target_table_exists": table_exists,
            "target_table": target_table,
            "columns": columns
        }
    
    except Exception as e:
        logger.error(f"Error checking database schema: {e}")
        return {
            "status": "error",
            "message": str(e)
        }