import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()

# Embedding model configuration
EMBEDDING_MODEL = "text-embedding-3-small"
embedding_client: OpenAI | None = None

def initialize_embedding_model():
    """Initialize the embedding model client."""
    global embedding_client

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")

    # Initialize OpenAI client with the API key
    embedding_client = OpenAI(api_key=api_key)

def get_embeddings(text: str) -> List[float]:
    """
    Generate embeddings for a text using OpenAI's embedding model.
    
    Args:
        text: The text to generate embeddings for.
        
    Returns:
        List[float]: The embedding vector.
    """
    global embedding_client
    if embedding_client is None:
        initialize_embedding_model()

    if not text or not isinstance(text, str):
        return []

    if len(text) > 25000:
        text = text[:25000]

    try:
        response = embedding_client.embeddings.create(
            input=[text],  # Must be a list
            model=EMBEDDING_MODEL
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return []
