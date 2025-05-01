# supabase_client.py
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(URL, KEY)