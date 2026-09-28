# Import contextlib asynccontextmanager to manage FastAPI application lifecycle startup events
from contextlib import asynccontextmanager
# Import FastAPI application class, HTTPException for errors, status codes, and FileResponse
from fastapi import FastAPI, HTTPException, status
# Import CORSMiddleware to handle Cross-Origin Resource Sharing for API requests
from fastapi.middleware.cors import CORSMiddleware
# Import FileResponse and StaticFiles to serve HTML, CSS, and JS static frontend files
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
# Import Pydantic BaseModel and Field for data validation schemas
from pydantic import BaseModel, Field
# Import List and Optional typing helpers
from typing import List, Optional
# Import OS library to check file path existence when serving static UI assets
import os

# Import database module functions for SQLite operations
import database


# Define lifecycle lifespan context manager function for FastAPI application
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Call database initialization function to create SQLite database table if needed
    database.init_db()
    # Yield execution context to run FastAPI application endpoints
    yield


# Initialize FastAPI web application with custom title, description, version, and lifespan
app = FastAPI(
    title="Modern To-Do List API",
    description="Efficient Python FastAPI backend providing CRUD operations for managing tasks.",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS Middleware to allow requests from frontend user interfaces across network origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origin domains for local development access
    allow_credentials=True,  # Allow credentials such as cookies and authorization headers
    allow_methods=["*"],  # Allow all HTTP request methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all custom request HTTP headers
)


# Define Pydantic schema model for validating incoming task creation payloads
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Short summary title of task")
    description: Optional[str] = Field(default="", description="Detailed notes about task")
    category: Optional[str] = Field(default="Personal", description="Category tag (Work, Personal, Urgent, etc.)")
    priority: Optional[str] = Field(default="Medium", description="Priority level (Low, Medium, High)")
    due_date: Optional[str] = Field(default="", description="Optional target deadline date string")


# Define Pydantic schema model for validating task update payloads
class TodoUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Updated title of task")
    description: Optional[str] = Field(default="", description="Updated task description")
    category: Optional[str] = Field(default="Personal", description="Updated category tag")
    priority: Optional[str] = Field(default="Medium", description="Updated priority level")
    due_date: Optional[str] = Field(default="", description="Updated due date string")
    is_completed: bool = Field(default=False, description="Completion status flag")


# Define Pydantic schema model representing returned API task responses
class TodoResponse(BaseModel):
    id: int  # Unique database primary key identifier
    title: str  # Task title text
    description: str  # Task description text
    category: str  # Task category string
    priority: str  # Task priority rating
    due_date: str  # Task completion target date
    is_completed: bool  # Completion status boolean flag
    created_at: str  # Task creation ISO timestamp


# Route handler serving root URL '/' by returning main frontend index.html web page
@app.get("/", include_in_schema=False)
async def serve_index():
    # Construct relative path string pointing to static/index.html web app interface
    index_file_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    # Check if index.html file exists on system disk
    if os.path.exists(index_file_path):
        # Return index.html static webpage file response
        return FileResponse(index_file_path)
    # Return descriptive error fallback dictionary if static page file is missing
    return {"message": "Welcome to To-Do List API. Frontend files located in static/ directory."}


# API Endpoint: GET /api/todos - Retrieves list of all tasks in database
@app.get("/api/todos", response_model=List[TodoResponse], summary="Retrieve all tasks")
async def read_todos():
    # Fetch all tasks from database helper function
    todos = database.get_all_todos()
    # Return retrieved array list of task dictionaries
    return todos


# API Endpoint: POST /api/todos - Creates new task entry in database
@app.post("/api/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED, summary="Create a new task")
async def create_todo(payload: TodoCreate):
    # Pass validated request payload values into database creation function
    created_todo = database.create_todo(
        title=payload.title,
        description=payload.description or "",
        category=payload.category or "Personal",
        priority=payload.priority or "Medium",
        due_date=payload.due_date or "",
    )
    # Return newly created task dictionary response
    return created_todo


# API Endpoint: GET /api/todos/{todo_id} - Retrieves single task by unique ID
@app.get("/api/todos/{todo_id}", response_model=TodoResponse, summary="Retrieve a task by ID")
async def read_todo_by_id(todo_id: int):
    # Query database for task matching provided ID path parameter
    todo = database.get_todo_by_id(todo_id)
    # Check if task was not found in database records
    if not todo:
        # Raise HTTP 404 Not Found exception error response
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with ID {todo_id} not found.")
    # Return matching task dictionary
    return todo


# API Endpoint: PUT /api/todos/{todo_id} - Updates existing task details completely
@app.put("/api/todos/{todo_id}", response_model=TodoResponse, summary="Update task by ID")
async def update_todo(todo_id: int, payload: TodoUpdate):
    # Attempt to update existing task record in database with new values
    updated_todo = database.update_todo(
        todo_id=todo_id,
        title=payload.title,
        description=payload.description or "",
        category=payload.category or "Personal",
        priority=payload.priority or "Medium",
        due_date=payload.due_date or "",
        is_completed=payload.is_completed,
    )
    # Check if target task ID exists in database
    if not updated_todo:
        # Raise HTTP 404 exception if task record does not exist
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with ID {todo_id} not found.")
    # Return updated task dictionary response
    return updated_todo


# API Endpoint: PATCH /api/todos/{todo_id}/toggle - Quick toggles task completion status boolean
@app.patch("/api/todos/{todo_id}/toggle", response_model=TodoResponse, summary="Toggle task completion status")
async def toggle_todo_completion(todo_id: int):
    # Toggle task status integer flag in database
    toggled_todo = database.toggle_todo_completion(todo_id)
    # Check if target task ID exists in database
    if not toggled_todo:
        # Raise HTTP 404 exception if target task ID does not exist
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with ID {todo_id} not found.")
    # Return updated task dictionary with flipped completion status
    return toggled_todo


# API Endpoint: DELETE /api/todos/{todo_id} - Deletes task record matching ID
@app.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete task by ID")
async def delete_todo(todo_id: int):
    # Perform task deletion query in database helper
    success = database.delete_todo(todo_id)
    # Check if task was not found or could not be deleted
    if not success:
        # Raise HTTP 404 exception if task record to delete was missing
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with ID {todo_id} not found.")
    # Return None response for HTTP 204 No Content status code on success
    return None


# Mount static files directory to serve static assets (CSS, JS, images, icons) under static path prefix
static_folder_path = os.path.join(os.path.dirname(__file__), "static")
# Check if static directory exists on system filesystem before mounting
if os.path.exists(static_folder_path):
    # Mount static assets directory to serve CSS and JavaScript static files
    app.mount("/static", StaticFiles(directory=static_folder_path), name="static")


# Execute FastAPI application server directly when main.py script is run directly from python CLI
if __name__ == "__main__":
    # Import uvicorn server package locally to start ASGI server execution
    import uvicorn
    # Launch uvicorn web server listening on localhost port 8000 with auto-reload enabled
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
