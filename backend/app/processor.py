import os
import re
from typing import List, Dict, Any, Tuple, Callable
import pygments
from pygments.lexers import get_lexer_for_filename, ClassNotFound
from .repository import is_binary_file

# File extensions to process
CODE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp',
    '.cs', '.go', '.rb', '.php', '.html', '.css', '.scss', '.sass', '.less',
    '.json', '.xml', '.yaml', '.yml', '.md', '.rst', '.txt', '.sh', '.bash',
    '.zsh', '.ps1', '.pl', '.pm', '.swift', '.kt', '.kts', '.rs', '.dart',
    '.lua', '.ex', '.exs', '.erl', '.hrl', '.hs', '.sql', '.r'
}

def process_repository(repo_path: str, progress_callback: Callable[[int], None] = None) -> List[Dict[str, Any]]:
    """
    Process all files in a repository and prepare them for embedding.
    
    Args:
        repo_path: Path to the cloned repository.
        progress_callback: Optional callback function to report progress.
        
    Returns:
        List[Dict[str, Any]]: List of processed files with metadata.
    """
    processed_files = []
    total_files = 0
    processed_count = 0
    
    # First, count total eligible files
    for root, _, files in os.walk(repo_path):
        if any(part.startswith('.') for part in root.split(os.sep)) or \
           any(ignore_dir in root.split(os.sep) for ignore_dir in ['node_modules', 'venv', '__pycache__', 'build', 'dist']):
            continue
            
        for file in files:
            if file.startswith('.'):
                continue
                
            file_path = os.path.join(root, file)
            if is_binary_file(file_path):
                continue
                
            ext = os.path.splitext(file)[1].lower()
            if ext in CODE_EXTENSIONS:
                total_files += 1
    
    # Process files
    for root, _, files in os.walk(repo_path):
        if any(part.startswith('.') for part in root.split(os.sep)) or \
           any(ignore_dir in root.split(os.sep) for ignore_dir in ['node_modules', 'venv', '__pycache__', 'build', 'dist']):
            continue
        
        for file in files:
            if file.startswith('.'):
                continue
                
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, repo_path)
            
            if is_binary_file(file_path):
                continue
                
            # Skip files with extensions we don't want to process
            ext = os.path.splitext(file)[1].lower()
            if ext not in CODE_EXTENSIONS:
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Break the file into chunks respecting code boundaries
                chunks = chunk_file(content, relative_path)
                
                for idx, chunk in enumerate(chunks):
                    processed_files.append({
                        "path": f"{relative_path}",
                        "chunk_id": idx,
                        "content": chunk,
                        "extension": ext
                    })
                
                processed_count += 1
                if progress_callback and total_files > 0:
                    progress = int((processed_count / total_files) * 100)
                    progress_callback(progress)
                    
            except Exception as e:
                # Skip files that can't be read properly
                continue
    
    return processed_files

def chunk_file(content: str, file_path: str, max_chunk_size: int = 1000) -> List[str]:
    """
    Chunk a file into smaller pieces, trying to respect code structure.
    
    Args:
        content: The file content.
        file_path: Path to the file (used to determine the language).
        max_chunk_size: Maximum chunk size in characters.
        
    Returns:
        List[str]: List of chunked content.
    """
    # For very small files, return as a single chunk
    if len(content) <= max_chunk_size:
        return [content]
    
    # Try to use Pygments to detect code boundaries
    try:
        lexer = get_lexer_for_filename(file_path)
        extension = os.path.splitext(file_path)[1].lower()
        
        # Different chunking strategies based on file type
        if extension in ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cs', '.go', '.rb', '.php']:
            return chunk_by_functions(content, max_chunk_size)
        elif extension in ['.md', '.rst', '.txt']:
            return chunk_by_sections(content, max_chunk_size)
        else:
            return chunk_by_size(content, max_chunk_size)
            
    except ClassNotFound:
        # If lexer not found, use a simple size-based chunking
        return chunk_by_size(content, max_chunk_size)
        
def chunk_by_functions(content: str, max_chunk_size: int) -> List[str]:
    """
    Chunk code by function/class boundaries.
    """
    # Simple regex to find function/class definitions
    # This is not perfect but a good approximation
    pattern = r'(def\s+\w+|class\s+\w+|function\s+\w+|\w+\s*=\s*function|\w+\s*=\s*\(.*\)\s*=>)'
    
    matches = list(re.finditer(pattern, content))
    chunks = []
    
    if not matches:
        return chunk_by_size(content, max_chunk_size)
    
    # Process each function/class
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i+1].start() if i < len(matches) - 1 else len(content)
        
        chunk = content[start:end]
        
        # If chunk is too large, break it down further
        if len(chunk) > max_chunk_size:
            sub_chunks = chunk_by_size(chunk, max_chunk_size)
            chunks.extend(sub_chunks)
        else:
            chunks.append(chunk)
    
    # Add any content before the first function/class
    if matches and matches[0].start() > 0:
        first_chunk = content[:matches[0].start()]
        if len(first_chunk.strip()) > 0:
            chunks.insert(0, first_chunk)
    
    return chunks

def chunk_by_sections(content: str, max_chunk_size: int) -> List[str]:
    """
    Chunk markdown/text by sections.
    """
    # Split by headers or empty lines
    lines = content.split('\n')
    chunks = []
    current_chunk = []
    current_size = 0
    
    for line in lines:
        # Start a new chunk for headers or after max size is reached
        if (line.startswith('#') or len(line.strip()) == 0 and current_size > max_chunk_size/2) and current_chunk:
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_size = 0
        
        current_chunk.append(line)
        current_size += len(line) + 1
        
        if current_size >= max_chunk_size:
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_size = 0
    
    # Add the last chunk if not empty
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    
    return chunks

def chunk_by_size(content: str, max_chunk_size: int) -> List[str]:
    """
    Chunk by size, trying to break at line boundaries.
    """
    chunks = []
    lines = content.split('\n')
    current_chunk = []
    current_size = 0
    
    for line in lines:
        line_size = len(line) + 1
        
        if current_size + line_size > max_chunk_size and current_chunk:
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_size = 0
        
        current_chunk.append(line)
        current_size += line_size
    
    # Add the last chunk if not empty
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    
    return chunks