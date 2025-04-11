import os
from dotenv import load_dotenv
import weaviate
from weaviate.classes.init import Auth

# Load environment variables from .env file
load_dotenv()

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

try:
    # Connect to Weaviate Cloud
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
    )

    print(client.is_ready())
finally:
    # Always close the connection
    client.close()