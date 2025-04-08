from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import weaviate
from sentence_transformers import SentenceTransformer
import tempfile
import os
from typing import List
import json

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
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Read CSV with pandas
            df = pd.read_csv(temp_file.name)
            
            # Create schema if it doesn't exist
            create_schema()
            
            # Process each row
            for _, row in df.iterrows():
                # Create text representation for embedding
                text_rep = f"{row['sports']} {row['hometown']} {row['academic_interests']}"
                
                # Prepare data object
                data_object = {
                    "name": row['name'],
                    "sports": row['sports'],
                    "hometown": row['hometown'],
                    "academic_interests": row['academic_interests'],
                    "text_representation": text_rep
                }
                
                # Add to Weaviate
                client.data_object.create(
                    data_object=data_object,
                    class_name="TourGuide"
                )
            
            # Clean up
            os.unlink(temp_file.name)
            
            return JSONResponse(
                content={"message": f"Successfully processed {len(df)} tour guides"},
                status_code=200
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tour-guides")
async def get_tour_guides():
    try:
        result = (
            client.query
            .get("TourGuide", ["name", "sports", "hometown", "academic_interests"])
            .do()
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 