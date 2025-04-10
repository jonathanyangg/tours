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
import logging
from .vectorization import process_and_store_tour_guides, create_schema

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        # Validate the DataFrame has the required columns
        if len(df.columns) < 3:
            raise HTTPException(
                status_code=400, 
                detail="CSV must have at least 3 columns: ID, Gender, and Grade"
            )
        
        logger.info(f"Processing CSV with {len(df)} rows and {len(df.columns)} columns")
        
        # Process and store the tour guides
        result = process_and_store_tour_guides(df)
        
        return JSONResponse(
            content=result,
            status_code=200
        )
            
    except Exception as e:
        logger.error(f"Error processing tour guides: {e}")
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
        logger.error(f"Error retrieving tour guides: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Check if the Weaviate connection is working."""
    try:
        # Try to get the schema to check connection
        client.schema.get()
        return {"status": "healthy", "message": "Weaviate connection successful"}
    except Exception as e:
        logger.error(f"Weaviate connection error: {e}")
        return {"status": "unhealthy", "message": f"Weaviate connection failed: {str(e)}"} 