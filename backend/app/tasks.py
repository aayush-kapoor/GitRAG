from typing import Dict, Any
import time

class TaskManager:
    """
    Manages background tasks for repository processing.
    
    This class provides methods to create, update, and retrieve tasks.
    In a production environment, this would be replaced with a more
    robust task queue like Celery or a database-backed solution.
    """
    
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        
    def create_task(self, task_id: str, repo_url: str):
        """Create a new task."""
        self.tasks[task_id] = {
            "id": task_id,
            "repo_url": repo_url,
            "status": "created",
            "progress": 0,
            "message": "Task created",
            "created_at": time.time(),
            "updated_at": time.time(),
            "last_progress_update": time.time()  # Track last progress update
        }
        
    def update_task(self, task_id: str, status: str = None, progress: int = None, 
                  message: str = None, error: str = None):
        """Update an existing task."""
        if task_id not in self.tasks:
            return False
            
        current_time = time.time()
        task = self.tasks[task_id]
        
        if status:
            task["status"] = status
            
        if progress is not None:
            # Ensure progress is between 0 and 100
            progress = max(0, min(100, progress))
            task["progress"] = progress
            task["last_progress_update"] = current_time
            
        if message:
            task["message"] = message
            
        if error:
            task["error"] = error
            
        task["updated_at"] = current_time
        return True
        
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get a task by ID."""
        return self.tasks.get(task_id)
        
    def list_tasks(self) -> Dict[str, Dict[str, Any]]:
        """List all tasks."""
        return self.tasks
        
    def delete_task(self, task_id: str) -> bool:
        """Delete a task by ID."""
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False
        
    def cleanup_old_tasks(self, max_age: int = 86400):
        """Clean up tasks older than max_age seconds."""
        current_time = time.time()
        to_delete = []
        
        for task_id, task in self.tasks.items():
            if current_time - task["created_at"] > max_age:
                to_delete.append(task_id)
                
        for task_id in to_delete:
            self.delete_task(task_id)
            
        return len(to_delete)