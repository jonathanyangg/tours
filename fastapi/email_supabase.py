import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import json

load_dotenv()

# Get Supabase credentials from environment variables
NEXT_PUBLIC_SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
NEXT_PUBLIC_SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")


# Function to initialize Supabase client
def init_supabase():
    url = NEXT_PUBLIC_SUPABASE_URL
    key = NEXT_PUBLIC_SUPABASE_ANON_KEY
    return create_client(url, key)

def get_user_token(email, password, supabase=None):
    if not supabase:
        supabase = init_supabase()
    
    try:
        # Sign in with email and password
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        # Return the full session object instead of just the access token
        return response.session
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return None

# Function to get school_CEEB from school_weaviate_credentials
def get_school_ceeb(session, supabase=None):
    if not supabase:
        supabase = init_supabase()
    
    try:
        # Set the auth token for the client (passing both access and refresh tokens)
        supabase.auth.set_session(session.access_token, session.refresh_token)
        
        # Get user information
        user = supabase.auth.get_user()
        user_id = user.user.id
        
        print(f"Authenticated as user ID: {user_id}")
        
        # Query school_weaviate_credentials for school_CEEB
        try:
            print("Fetching school_CEEB from school_weaviate_credentials...")
            response = supabase.table('school_weaviate_credentials').select('tour_guides_weaviate_url', 'tour_guides_weaviate_api_key', 'visiting_students_weaviate_url', 'visiting_students_weaviate_api_key', 'openai_api_key').eq('user_id', user_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                print("Some data missing")
                return None
                
        except Exception as e:
            print(f"Error fetching info: {str(e)}")
            return None
            
    except Exception as e:
        print(f"Error retrieving data: {str(e)}")
        return None

# Main execution
if __name__ == "__main__":
    print("Supabase School Fetcher")
    print("=" * 50)
    
    # Initialize Supabase with credentials
    if not NEXT_PUBLIC_SUPABASE_URL or not NEXT_PUBLIC_SUPABASE_ANON_KEY:
        print("Supabase credentials not found in environment variables.")
        supabase = init_supabase()
    else:
        print(f"Using Supabase URL: {NEXT_PUBLIC_SUPABASE_URL[:10]}...")
        supabase = init_supabase()
    
    # Get authentication credentials
    email = os.environ.get("email")
    password = os.environ.get("password")
    print(email, password)
    
    # Get user token (returns the full session)
    session = get_user_token(email, password, supabase)
    
    if session:
        print(f"Successfully authenticated. Token: {session.access_token[:10]}...")
        
        # Get school CEEB
        info = get_school_ceeb(session, supabase)
        if info:
            for key, value in info.items():
                print(f"{key}: {value}")
        else:
            print("No school info found or error occurred.")
    else:
        print("Authentication failed.") 