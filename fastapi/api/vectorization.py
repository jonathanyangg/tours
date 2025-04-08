import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import weaviate
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Weaviate client
client = weaviate.Client(
    url="http://localhost:8080",  # Update this with your Weaviate instance URL
)

def create_schema():
    """Create the Weaviate schema for tour guides if it doesn't exist."""
    schema = {
        "class": "TourGuide",
        "description": "A tour guide with their information and vector embedding",
        "properties": [
            {"name": "id", "dataType": ["text"]},
            {"name": "gender", "dataType": ["text"]},
            {"name": "grade", "dataType": ["text"]},
            {"name": "text_representation", "dataType": ["text"]},
            {"name": "embedding", "dataType": ["number[]"]},
        ],
        "vectorizer": "none",  # We'll provide our own embeddings
    }
    
    try:
        client.schema.create_class(schema)
        logger.info("Created TourGuide schema in Weaviate")
    except weaviate.exceptions.UnexpectedStatusCodeException:
        logger.info("TourGuide schema already exists")

def format_dataframe_columns(df: pd.DataFrame, start_pos: int = 3) -> pd.DataFrame:
    """Merge columns from start_pos to the end into a single text column.
    
    Args:
        df: DataFrame to process
        start_pos: Starting column position (0-indexed) for columns to merge
        
    Returns:
        DataFrame with added 'text_representation' column
    """
    columns_to_merge = df.columns[start_pos:]
    df['text_representation'] = df.apply(
        lambda row: ', '.join([f"{col}: {row[col]}" for col in columns_to_merge if pd.notna(row[col])]),
        axis=1
    )
    return df

def generate_embeddings(texts: List[str], batch_size: int = 20) -> List[List[float]]:
    """Generate embeddings for a list of texts using sentence-transformers.
    
    Args:
        texts: List of text strings to get embeddings for
        batch_size: Number of texts to process in each batch
        
    Returns:
        List of embedding vectors
    """
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        try:
            # Clean and validate the batch
            cleaned_batch = []
            for text in batch:
                if pd.isna(text):
                    text = ""
                text = str(text).strip()
                if not text:
                    text = "no information provided"
                cleaned_batch.append(text)
            
            logger.info(f"Processing batch {i//batch_size + 1} of {len(texts)//batch_size + 1}")
            
            # Generate embeddings using sentence-transformers
            batch_embeddings = model.encode(cleaned_batch, show_progress_bar=False)
            all_embeddings.extend(batch_embeddings.tolist())
            
        except Exception as e:
            logger.error(f"Error in batch {i//batch_size + 1}: {e}")
            raise
    
    return all_embeddings

def process_and_store_tour_guides(df: pd.DataFrame) -> Dict:
    """Process tour guide data and store in Weaviate.
    
    Args:
        df: DataFrame containing tour guide information
        
    Returns:
        Dictionary with processing statistics
    """
    try:
        # Create schema if it doesn't exist
        create_schema()
        
        # Format the text representation
        df = format_dataframe_columns(df)
        
        # Generate embeddings
        logger.info("Generating embeddings for tour guides...")
        embeddings = generate_embeddings(df['text_representation'].tolist())
        
        # Store in Weaviate
        logger.info("Storing tour guides in Weaviate...")
        for idx, row in df.iterrows():
            data_object = {
                "id": str(row.iloc[0]),  # First column
                "gender": str(row.iloc[1]),  # Second column
                "grade": str(row.iloc[2]),  # Third column
                "text_representation": row['text_representation'],
                "embedding": embeddings[idx]
            }
            
            client.data_object.create(
                data_object=data_object,
                class_name="TourGuide"
            )
        
        return {
            "status": "success",
            "message": f"Successfully processed and stored {len(df)} tour guides",
            "count": len(df)
        }
        
    except Exception as e:
        logger.error(f"Error processing tour guides: {e}")
        raise 