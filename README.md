# TaskPulse - Modern To-Do List Application

A sleek, vibrant, modern full-stack To-Do List application built with a high-performance **Python FastAPI** backend and a responsive, glassmorphic **HTML5/CSS3/JavaScript** frontend.

---

## 🌟 Key Features

- **Full CRUD Operations**: Create, read, update, complete, and delete tasks seamlessly.
- **Modern Glassmorphism UI**: Beautiful semi-transparent card layouts, ambient glow background orbs, vibrant gradients, and smooth micro-animations.
- **Line-by-Line Code Comments**: Every single line/block of code across Python backend and Frontend files is thoroughly documented with clear explanatory comments.
- **Dynamic Stats & Progress Bar**: Real-time counter metrics for Total, Pending, and Completed tasks with an animated progress bar fill.
- **Category & Priority Tagging**: Color-coded category badges (Personal, Work, Shopping, Health, Urgent) and priority flag indicators (High 🔴, Medium 🟡, Low 🟢).
- **Search & Multi-level Filtering**: Real-time instant search input along with status tab filters (All, Pending, Completed) and category dropdown filter.
- **Theme Toggle**: One-click light and dark mode switching with persistent `localStorage` preference.
- **Modal Editing Dialog**: Centered glass modal for modifying task details without page refresh.
- **Toast Notifications**: Interactive floating toast popups for instant visual feedback on user actions.

---

## 📁 Project Structure

```text
to-do list API/
├── database.py       # SQLite database connection, table schema & CRUD helper functions (Line-by-line commented)
├── main.py           # FastAPI application, Pydantic data validation schemas & REST API routes (Line-by-line commented)
├── requirements.txt  # Project Python package dependencies with explanations
├── README.md         # Full project documentation & execution guide
└── static/           # Frontend Web Application Assets
    ├── index.html    # Modern HTML5 semantic layout structure (Line-by-line commented)
    ├── styles.css    # Colorful glassmorphic theme styling & responsive CSS (Line-by-line commented)
    └── app.js        # Client-side JavaScript DOM rendering & fetch API integration (Line-by-line commented)
```

---

## 🚀 How to Run the Application

### Prerequisites
- **Python 3.8 or higher** installed on your system.
- `pip` package manager.

### Step 1: Install Dependencies
Open your terminal / PowerShell in the project directory and install the required packages:

```bash
pip install -r requirements.txt
```

*(Alternatively: `pip install fastapi uvicorn`)*

### Step 2: Launch the FastAPI Backend Server
Run the FastAPI web server using Python or Uvicorn directly:

```bash
python main.py
```
*or*
```bash
uvicorn main:app --reload
```

The terminal will display:
```text
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### Step 3: Access the Application
Open your web browser and navigate to:

👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

- **Frontend App**: `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation**: `http://127.0.0.1:8000/docs`

---

## 💡 How the Application Works

1. **Backend Execution**:
   - `main.py` initializes the FastAPI server and mounts the `static/` directory to serve static UI files directly.
   - On application startup, `database.init_db()` runs automatically, creating a lightweight `todos.db` SQLite database file with the `todos` table schema if it does not already exist.
   - FastAPI endpoints (`GET /api/todos`, `POST /api/todos`, `PUT /api/todos/{id}`, `PATCH /api/todos/{id}/toggle`, `DELETE /api/todos/{id}`) receive HTTP requests, validate input schemas with **Pydantic**, and execute SQL queries safely via `database.py`.

2. **Frontend Execution**:
   - `index.html` loads the glassmorphic structure, Google Outfit typography, and FontAwesome icons.
   - `app.js` runs on DOM completion, executing `fetch('/api/todos')` to fetch all current tasks asynchronously.
   - When a user submits a task, toggles completion, edits, or deletes an item, `app.js` sends asynchronous `fetch()` requests (`POST`, `PATCH`, `PUT`, `DELETE`) to the Python REST backend.
   - The UI updates dynamically without any page reloads, accompanied by animated toast feedback notifications.

---

## 📤 How to Push to GitHub (Step-by-Step)

Follow these step-by-step instructions to upload this project repository to GitHub:

### Step 1: Create a New Repository on GitHub
1. Log in to your account at **[github.com](https://github.com)**.
2. Click the **`+`** icon in the top-right corner and select **New repository**.
3. Enter a repository name (e.g., `todo-list-fastapi-app`).
4. Choose **Public** or **Private** visibility.
5. **Do NOT** check "Add a README file", ".gitignore", or license (since we have already created them locally).
6. Click **Create repository**.

### Step 2: Initialize Git and Commit Files Locally
Open your terminal/PowerShell in the project folder (`c:\Users\USER\OneDrive\Pictures\Documents\Desktop\PYTHON LEARNING\mini projects\to-do list API`) and run:

```bash
# Initialize local Git repository
git init

# Stage all project files
git add .

# Create initial commit
git commit -m "Initial commit: TaskPulse To-Do List Application"
```

### Step 3: Link Local Repository to GitHub
Copy the remote repository URL from GitHub and run:

```bash
# Set default branch to main
git branch -M main

# Add your GitHub repository remote origin URL
git remote add origin https://github.com/Sathyajith13-ENG/TO-DO-List--fastAPI.git
```

### Step 4: Push to GitHub
```bash
# Push local commits to remote GitHub repository
git push -u origin main
```

---

