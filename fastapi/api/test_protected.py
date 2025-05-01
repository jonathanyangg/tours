from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging
from .supabase_client import supabase 

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
    # The user object returned by Supabase will have a 'user' property
    # containing the user details
    return {
        "message": "You have successfully accessed a protected route!",
        "user_id": response_data.id,
        "email": response_data.email,
        "status": "success"
    }

@router.get("/user-credentials")
async def get_weaviate_credentials(response_data=Depends(get_current_user)):
    table_name = "school_weaviate_credentials"
    columns = [
        "tour_guides_weaviate_url", 
        "tour_guides_weaviate_api_key", 
        "visiting_students_weaviate_url", 
        "visiting_students_weaviate_api_key", 
        "openai_api_key"
    ]

    user_id = response_data.id
    # Create the select query with the specified columns
    supabase_data_response = supabase.table('school_weaviate_credentials').select('tour_guides_weaviate_url', 'tour_guides_weaviate_api_key', 'visiting_students_weaviate_url', 'visiting_students_weaviate_api_key', 'openai_api_key').eq('user_id', user_id).execute()

    if supabase_data_response.data:
        return {
            "status": "success",
            "data": supabase_data_response.data
        } 
    else:
        logger.error(f"No data found for user {user_id}")
        raise HTTPException(
            status_code=404,
            detail="Credentials not found for this user"
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