import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Dict, Any
import hashlib

# Initialize Qdrant client
qdrant_client = None

def initialize_vector_db():
    """Initialize the Qdrant vector database client."""
    global qdrant_client
    
    # Use in-memory storage for simplicity
    # In production, you would connect to a Qdrant server
    qdrant_client = QdrantClient(":memory:")

def get_collection_name(repo_url: str) -> str:
    """
    Generate a collection name from a repository URL.
    
    Args:
        repo_url: The repository URL.
        
    Returns:
        str: A sanitized collection name.
    """
    # Create a hash of the repo URL to ensure a valid collection name
    return f"repo_{hashlib.md5(repo_url.encode()).hexdigest()}"

def store_embeddings(repo_url: str, embeddings: List[Dict[str, Any]]):
    """
    Store embeddings in the vector database.
    
    Args:
        repo_url: The repository URL.
        embeddings: List of embeddings with metadata.
    """
    if not qdrant_client:
        initialize_vector_db()
    
    collection_name = get_collection_name(repo_url)
    
    # Create collection if it doesn't exist
    try:
        qdrant_client.get_collection(collection_name)
    except Exception:
        # Create a new collection
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=1536,  # OpenAI embedding size
                distance=models.Distance.COSINE
            )
        )
    
    # Prepare points for insertion
    points = []
    for idx, item in enumerate(embeddings):
        points.append(
            models.PointStruct(
                id=idx,
                vector=item["embedding"],
                payload={
                    "repo_url": repo_url,
                    "path": item["path"],
                    "content": item["content"],
                    "chunk_id": item.get("chunk_id", 0)
                }
            )
        )
    
    # Insert in batches if needed
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i:i+batch_size]
        qdrant_client.upsert(
            collection_name=collection_name,
            points=batch
        )

def search_vector_db(repo_url: str, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search the vector database for similar contents.
    
    Args:
        repo_url: The repository URL.
        query_embedding: The query embedding vector.
        limit: Maximum number of results to return.
        
    Returns:
        List[Dict[str, Any]]: List of search results with content and metadata.
    """
    if not qdrant_client:
        initialize_vector_db()
        
    collection_name = get_collection_name(repo_url)
    
    try:
        search_results = qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit
        )
        
        results = []
        for result in search_results:
            results.append({
                "content": result.payload["content"],
                "path": result.payload["path"],
                "similarity": result.score
            })
        
        return results
    except Exception as e:
        print(f"Error searching vector database: {e}")
        return []