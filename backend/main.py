from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import os
from typing import Dict, List, Optional, Any

from app.repository import clone_repository
from app.processor import process_repository
from app.embeddings import get_embeddings, initialize_embedding_model
from app.vector_db import initialize_vector_db, search_vector_db, store_embeddings
from app.llm import generate_answer
from app.tasks import TaskManager

app = FastAPI(title="GitHub Repository RAG API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the task manager
task_manager = TaskManager()

class IndexRepoRequest(BaseModel):
    repo_url: str

class IndexRepoResponse(BaseModel):
    task_id: str
    status: str
    message: str

class QueryRequest(BaseModel):
    repo_url: str
    query: str

class Source(BaseModel):
    content: str
    path: str
    similarity: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]

@app.on_event("startup")
async def startup_event():
    """Initialize necessary components on startup."""
    initialize_embedding_model()
    initialize_vector_db()

@app.post("/index-repo", response_model=IndexRepoResponse)
async def index_repo(request: IndexRepoRequest, background_tasks: BackgroundTasks):
    """
    Start indexing a GitHub repository.
    
    This endpoint initiates a background task to clone the repository,
    process its files, generate embeddings, and store them in the vector database.
    """
    repo_url = request.repo_url
    task_id = str(uuid.uuid4())
    
    # Create task
    task_manager.create_task(task_id, repo_url)
    
    # Start background task
    background_tasks.add_task(
        process_repository_task,
        task_id, 
        repo_url
    )
    
    return IndexRepoResponse(
        task_id=task_id,
        status="started",
        message="Repository indexing started"
    )

@app.get("/indexing-status/{task_id}")
async def get_indexing_status(task_id: str):
    """Get the status of an indexing task."""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "status": task["status"],
        "progress": task["progress"],
        "message": task["message"],
        "error": task.get("error")
    }

@app.post("/query", response_model=QueryResponse)
async def query_repository(request: QueryRequest):
    """
    Query a repository that has been indexed.
    
    This endpoint searches the vector database for relevant file chunks,
    and uses an LLM to generate an answer based on those chunks.
    """
    repo_url = request.repo_url
    query = request.query
    
    # Check if repository exists in vector database
    repo_exists = True  # This should check if the repo exists in the DB
    if not repo_exists:
        raise HTTPException(status_code=404, detail="Repository not indexed yet")
    
    # Generate embeddings for the query
    query_embedding = get_embeddings(query)
    
    # Search vector database
    search_results = search_vector_db(repo_url, query_embedding)
    
    if not search_results:
        raise HTTPException(status_code=404, detail="No relevant information found")
    
    # Generate answer using LLM
    answer = generate_answer(query, search_results)
    
    # Format sources for response
    sources = [
        Source(
            content=result["content"],
            path=result["path"],
            similarity=result["similarity"]
        )
        for result in search_results
    ]
    
    return QueryResponse(
        answer=answer,
        sources=sources
    )

async def process_repository_task(task_id: str, repo_url: str):
    """Background task to process a repository."""
    try:
        # Update task status
        task_manager.update_task(task_id, status="indexing", progress=0, message="Cloning repository")
        
        # Clone repository
        repo_path = clone_repository(repo_url)
        task_manager.update_task(task_id, progress=10, message="Repository cloned")
        
        # Process repository files
        files = process_repository(repo_path)
        task_manager.update_task(task_id, progress=40, message=f"Processed {len(files)} files")
        
        # Generate embeddings
        embeddings = []
        for i, file in enumerate(files):
            file_embedding = get_embeddings(file["content"])
            embeddings.append({
                "path": file["path"],
                "content": file["content"],
                "embedding": file_embedding
            })
            progress = 40 + int((i / len(files)) * 40)
            task_manager.update_task(task_id, progress=progress, message=f"Generated embeddings for {i+1}/{len(files)} files")
        
        # Store embeddings in vector database
        store_embeddings(repo_url, embeddings)
        task_manager.update_task(task_id, progress=100, status="completed", message="Repository indexed successfully")
        
    except Exception as e:
        task_manager.update_task(
            task_id, 
            status="failed", 
            message="Repository indexing failed",
            error=str(e)
        )