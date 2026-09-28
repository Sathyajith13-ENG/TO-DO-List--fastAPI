# Import the standard Python sqlite3 module to interact with SQLite relational database
import sqlite3
# Import datetime module to generate timestamps for task creation
from datetime import datetime
# Import Optional type hint from typing module for optional fields
from typing import Optional, List, Dict, Any

# Define constant string variable storing the path to the SQLite database file
DB_NAME = "todos.db"


def get_db_connection() -> sqlite3.Connection:
    """Establishes and returns a database connection with row factory configured."""
    # Connect to the SQLite database file (creates file if it does not exist)
    conn = sqlite3.connect(DB_NAME)
    # Configure row_factory to sqlite3.Row so query results can be accessed like dictionaries
    conn.row_factory = sqlite3.Row
    # Return the configured database connection object
    return conn


def init_db() -> None:
    """Initializes the database schema by creating the todos table if it does not exist."""
    # Obtain a connection to the SQLite database
    conn = get_db_connection()
    # Create a cursor object to execute SQL commands
    cursor = conn.cursor()
    # Execute SQL statement to create the 'todos' table with structured schema attributes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            category TEXT DEFAULT 'Personal',
            priority TEXT DEFAULT 'Medium',
            due_date TEXT DEFAULT '',
            is_completed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)
    # Commit changes to persist the table creation in the database
    conn.commit()
    # Close the database connection to release system resources
    conn.close()


def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    """Converts a sqlite3.Row database record into a standard Python dictionary."""
    # Extract row values into dictionary and convert is_completed integer (0 or 1) to boolean (False or True)
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "priority": row["priority"],
        "due_date": row["due_date"],
        "is_completed": bool(row["is_completed"]),
        "created_at": row["created_at"],
    }


def get_all_todos() -> List[Dict[str, Any]]:
    """Retrieves all tasks from database ordered by creation timestamp in descending order."""
    # Connect to database
    conn = get_db_connection()
    # Create database cursor
    cursor = conn.cursor()
    # Execute SELECT query to fetch all task records sorted by ID descending
    cursor.execute("SELECT * FROM todos ORDER BY id DESC")
    # Fetch all rows resulting from the SQL query
    rows = cursor.fetchall()
    # Close the database connection
    conn.close()
    # Convert each SQLite row object into Python dictionary using list comprehension
    return [row_to_dict(row) for row in rows]


def get_todo_by_id(todo_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a single task by its unique ID, returning None if not found."""
    # Connect to database
    conn = get_db_connection()
    # Create database cursor
    cursor = conn.cursor()
    # Execute SQL query with parameter binding to find specific task by ID
    cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
    # Fetch the first matching row from database query
    row = cursor.fetchone()
    # Close database connection
    conn.close()
    # Return dictionary if row exists, otherwise return None
    return row_to_dict(row) if row else None


def create_todo(
    title: str,
    description: str = "",
    category: str = "Personal",
    priority: str = "Medium",
    due_date: str = "",
) -> Dict[str, Any]:
    """Inserts a new task record into database and returns created task dictionary."""
    # Connect to database
    conn = get_db_connection()
    # Create database cursor
    cursor = conn.cursor()
    # Generate ISO format timestamp string representing creation time
    created_at = datetime.now().isoformat()
    # Execute SQL INSERT query with parameterized tuple to prevent SQL injection vulnerabilities
    cursor.execute(
        """
        INSERT INTO todos (title, description, category, priority, due_date, is_completed, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
    """,
        (title, description, category, priority, due_date, created_at),
    )
    # Commit transaction to save new record
    conn.commit()
    # Retrieve the auto-generated primary key ID of newly inserted row
    new_id = cursor.lastrowid
    # Close database connection
    conn.close()
    # Retrieve and return the complete record dictionary for the newly created task
    return get_todo_by_id(new_id)  # type: ignore


def update_todo(
    todo_id: int,
    title: str,
    description: str,
    category: str,
    priority: str,
    due_date: str,
    is_completed: bool,
) -> Optional[Dict[str, Any]]:
    """Updates an existing task record in database with new values."""
    # Connect to database
    conn = get_db_connection()
    # Create database cursor
    cursor = conn.cursor()
    # Execute SQL UPDATE query to modify record fields matching the specified ID
    cursor.execute(
        """
        UPDATE todos
        SET title = ?, description = ?, category = ?, priority = ?, due_date = ?, is_completed = ?
        WHERE id = ?
    """,
        (
            title,
            description,
            category,
            priority,
            due_date,
            1 if is_completed else 0,
            todo_id,
        ),
    )
    # Commit transaction to persist database updates
    conn.commit()
    # Close database connection
    conn.close()
    # Fetch and return updated task dictionary
    return get_todo_by_id(todo_id)


def toggle_todo_completion(todo_id: int) -> Optional[Dict[str, Any]]:
    """Toggles completion status of task between true and false."""
    # Check if task exists first
    existing = get_todo_by_id(todo_id)
    # Return None if task does not exist
    if not existing:
        return None
    # Calculate inverted completion boolean value
    new_status = not existing["is_completed"]
    # Connect to database
    conn = get_db_connection()
    # Create cursor
    cursor = conn.cursor()
    # Execute UPDATE query to toggle completion integer bit
    cursor.execute(
        "UPDATE todos SET is_completed = ? WHERE id = ?",
        (1 if new_status else 0, todo_id),
    )
    # Commit transaction
    conn.commit()
    # Close connection
    conn.close()
    # Return updated task dictionary
    return get_todo_by_id(todo_id)


def delete_todo(todo_id: int) -> bool:
    """Deletes task record matching provided ID, returning True if successful."""
    # Connect to database
    conn = get_db_connection()
    # Create cursor
    cursor = conn.cursor()
    # Execute SQL DELETE command for specified task ID
    cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    # Check count of rows affected by DELETE operation
    deleted_count = cursor.rowcount
    # Commit transaction to finalize deletion
    conn.commit()
    # Close connection
    conn.close()
    # Return True if at least 1 row was deleted, otherwise False
    return deleted_count > 0
