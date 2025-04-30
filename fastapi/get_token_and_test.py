import requests
import json
from supabase import create_client, Client
import os
import time
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client with the same credentials
NEXT_PUBLIC_SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
NEXT_PUBLIC_SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

def get_token_and_test():
    # Get email and password from user input
    print("To test the protected endpoint, you need to sign in with a Supabase account.")
    email = os.environ.get("email")
    password = os.environ.get("password")
    
    try:
        # Sign in with Supabase
        print("\nAttempting to sign in to Supabase...")
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        
        # Extract the access token
        access_token = auth_response.session.access_token
        print("\n✅ Successfully signed in!")
        print(f"\nObtained token: {access_token[:10]}...{access_token[-10:]}")
        
        # Generate curl command
        curl_command = f'curl -X GET http://localhost:8000/api/user-credentials -H "Authorization: Bearer {access_token}"'
        print("\n----- CURL COMMAND TO COPY -----")
        print(curl_command)
        print("--------------------------------")
        
        # Ask if user wants to test automatically
        which_endpoint = input("\nWhich endpoint do you want to test? (1)test-auth (2)user-credentials): ")
        if which_endpoint == "1":
            api_url = "http://localhost:8000/api/test-auth"
        else:
            api_url = "http://localhost:8000/api/user-credentials"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        print("\nTesting the protected endpoint...")
        response = requests.get(api_url, headers=headers)
        
        print(f"\nStatus Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
       
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("Make sure your credentials are correct and that you have a registered account in Supabase.")

if __name__ == "__main__":
    get_token_and_test() 