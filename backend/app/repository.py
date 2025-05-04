import os
import tempfile
from git import Repo
import shutil
from typing import List, Dict, Any
import re

def clone_repository(repo_url: str) -> str:
    """
    Clone a GitHub repository to a temporary directory.
    
    Args:
        repo_url: The URL of the GitHub repository to clone.
        
    Returns:
        str: Path to the cloned repository.
        
    Raises:
        Exception: If the repository cannot be cloned.
    """
    # Extract repo name for the temp directory name
    repo_name = repo_url.rstrip('/').split('/')[-1]
    if repo_name.endswith('.git'):
        repo_name = repo_name[:-4]
    
    # Create a temporary directory
    temp_dir = os.path.join(tempfile.gettempdir(), f"reporag_{repo_name}_{os.urandom(4).hex()}")
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Clone the repository
        repo = Repo.clone_from(repo_url, temp_dir)
        return temp_dir
    except Exception as e:
        # Clean up the temporary directory if cloning fails
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        raise Exception(f"Failed to clone repository: {str(e)}")

def is_binary_file(file_path: str) -> bool:
    """
    Check if a file is binary.
    
    Args:
        file_path: Path to the file to check.
        
    Returns:
        bool: True if the file is binary, False otherwise.
    """
    # Common binary file extensions
    binary_extensions = {
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
        '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
        '.zip', '.tar', '.gz', '.rar', '.7z',
        '.exe', '.dll', '.so', '.dylib',
        '.pyc', '.pyo', '.pyd',
        '.mp3', '.mp4', '.avi', '.mov', '.flv',
        '.sqlite', '.db',
    }
    
    ext = os.path.splitext(file_path)[1].lower()
    if ext in binary_extensions:
        return True
    
    # Check if file is binary by reading its first chunk
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            return b'\0' in chunk  # Binary files typically contain null bytes
    except:
        return True  # If we can't read the file, consider it binary for safety