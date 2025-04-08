from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import weaviate
from sentence_transformers import SentenceTransformer
import tempfile
import os
from typing import List
import json
import io
from .vectorization import process_and_store_tour_guides

router = APIRouter()

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Weaviate client
client = weaviate.Client(
    url="http://localhost:8080",  # Update this with your Weaviate instance URL
    additional_headers={
        "X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY", "")  # Optional: if using OpenAI embeddings
    }
)

# Create schema for tour guides if it doesn't exist
def create_schema():
    schema = {
        "class": "TourGuide",
        "description": "A tour guide with their information and vector embedding",
        "properties": [
            {"name": "name", "dataType": ["text"]},
            {"name": "sports", "dataType": ["text"]},
            {"name": "hometown", "dataType": ["text"]},
            {"name": "academic_interests", "dataType": ["text"]},
            {"name": "text_representation", "dataType": ["text"]},  # Combined text for embedding
        ],
        "vectorizer": "text2vec-contextionary",  # Using Weaviate's built-in vectorizer
    }
    
    try:
        client.schema.create_class(schema)
    except weaviate.exceptions.UnexpectedStatusCodeException:
        # Schema might already exist
        pass

@router.post("/upload-tour-guides")
async def upload_tour_guides(file: UploadFile = File(...)):
    """Upload and process a CSV file of tour guides.
    
    The CSV should have at least 3 columns:
    1. ID
    2. Gender
    3. Grade
    All remaining columns will be combined into a text representation for embedding.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read the uploaded file
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Process and store the tour guides
        result = process_and_store_tour_guides(df)
        
        return JSONResponse(
            content=result,
            status_code=200
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tour-guides")
async def get_tour_guides():
    """Retrieve all tour guides from Weaviate."""
    try:
        result = (
            client.query
            .get("TourGuide", ["id", "gender", "grade", "text_representation"])
            .do()
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 