// API Endpoint Base URL Constant - Points to FastAPI Python backend relative path
const API_BASE_URL = "/api/todos"; // Set base API URL string

// Application Global State Storage Object
const appState = {
  todos: [], // Array storing fetched task records from backend
  activeFilter: "all", // Active status filter tab ('all', 'pending', 'completed')
  categoryFilter: "all", // Active category filter ('all', 'Personal', 'Work', etc.)
  searchQuery: "", // Current active search query string
};

// Cached DOM Elements References
const elements = {
  // Header & Theme Elements
  currentDateText: document.getElementById("current-date"), // Header subtitle date display text element
  themeToggleBtn: document.getElementById("theme-toggle-btn"), // Theme toggle button
  themeIcon: document.getElementById("theme-icon"), // Theme moon/sun icon

  // Stats Counters Elements
  statTotal: document.getElementById("stat-total"), // Total task count text counter
  statPending: document.getElementById("stat-pending"), // Pending task count text counter
  statCompleted: document.getElementById("stat-completed"), // Completed task count text counter
  progressBarFill: document.getElementById("progress-bar-fill"), // Progress bar fill line width element

  // Create Task Form Elements
  todoForm: document.getElementById("todo-form"), // Main task creation form element
  titleInput: document.getElementById("task-title-input"), // Task title text input
  categorySelect: document.getElementById("task-category-select"), // Task category dropdown select
  prioritySelect: document.getElementById("task-priority-select"), // Task priority dropdown select
  dueDateInput: document.getElementById("task-due-date-input"), // Task due date input field
  descInput: document.getElementById("task-desc-input"), // Task description textarea
  addTaskBtn: document.getElementById("add-task-btn"), // Submit task creation button

  // Toolbar & Search Elements
  searchInput: document.getElementById("search-input"), // Task search text input
  clearSearchBtn: document.getElementById("clear-search-btn"), // Clear search button
  statusTabs: document.querySelectorAll(".tab-btn"), // Array of status filter tab buttons
  categoryFilterSelect: document.getElementById("category-filter-select"), // Category filter dropdown

  // List & Container Elements
  taskList: document.getElementById("task-list"), // Dynamic task list DOM container
  emptyState: document.getElementById("empty-state"), // Empty state visual container
  toastContainer: document.getElementById("toast-container"), // Toast notification popups container

  // Edit Modal Elements
  editModalOverlay: document.getElementById("edit-modal-overlay"), // Edit modal backdrop overlay
  editForm: document.getElementById("edit-task-form"), // Edit task form
  editTaskIdInput: document.getElementById("edit-task-id"), // Edit task hidden ID input
  editTitleInput: document.getElementById("edit-task-title"), // Edit task title input
  editCategorySelect: document.getElementById("edit-task-category"), // Edit task category select
  editPrioritySelect: document.getElementById("edit-task-priority"), // Edit task priority select
  editDueDateInput: document.getElementById("edit-task-due-date"), // Edit task due date input
  editDescInput: document.getElementById("edit-task-desc"), // Edit task description input
  editCompletedCheckbox: document.getElementById("edit-task-completed"), // Edit completion status checkbox
  closeModalBtn: document.getElementById("close-modal-btn"), // Modal close X button
  cancelModalBtn: document.getElementById("cancel-modal-btn"), // Modal cancel button
};

/* ==========================================
   Initialization Event Handlers & Startup
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Format and set today's formatted date string in app header
  displayCurrentDate();

  // Initialize light/dark theme preference from localStorage or default
  initTheme();

  // Attach interactive DOM event listeners to input fields, buttons, and tabs
  attachEventListeners();

  // Fetch task items list from FastAPI backend server
  fetchTodos();
});

// Format and Display Current Date Function
function displayCurrentDate() {
  // Create Date object representing current timestamp
  const now = new Date();
  // Configure date formatting options (e.g. "Monday, September 28, 2026")
  const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
  // Inject formatted date string into header subtitle text element
  elements.currentDateText.textContent = now.toLocaleDateString("en-US", options);
}

// Light / Dark Theme Setup Function
function initTheme() {
  // Check if saved theme exists in browser localStorage
  const savedTheme = localStorage.getItem("taskpulse_theme") || "dark";
  // Apply data-theme attribute to document HTML element
  document.documentElement.setAttribute("data-theme", savedTheme);
  // Update theme toggle icon based on active theme
  updateThemeIcon(savedTheme);
}

// Update Theme Icon Glyph Function
function updateThemeIcon(theme) {
  // Set sun icon if light theme, otherwise moon icon for dark theme
  if (theme === "light") {
    elements.themeIcon.className = "fa-solid fa-sun"; // Change to sun icon class
  } else {
    elements.themeIcon.className = "fa-solid fa-moon"; // Change to moon icon class
  }
}

// Attach All Event Listeners Function
function attachEventListeners() {
  // Theme Toggle Button Click Event Listener
  elements.themeToggleBtn.addEventListener("click", () => {
    // Read current theme attribute
    const currentTheme = document.documentElement.getAttribute("data-theme");
    // Calculate new flipped theme string
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    // Set updated theme attribute on root html element
    document.documentElement.setAttribute("data-theme", newTheme);
    // Save theme choice to local storage
    localStorage.setItem("taskpulse_theme", newTheme);
    // Update theme button icon
    updateThemeIcon(newTheme);
  });

  // Task Creation Form Submit Event Listener
  elements.todoForm.addEventListener("submit", handleFormSubmit);

  // Real-Time Search Input Event Listener
  elements.searchInput.addEventListener("input", (e) => {
    // Update appState search query with trimmed lowercase input value
    appState.searchQuery = e.target.value.trim().toLowerCase();
    // Toggle visibility of clear search X button if search text exists
    elements.clearSearchBtn.classList.toggle("hidden", appState.searchQuery === "");
    // Re-render task list with search filter applied
    renderTodos();
  });

  // Clear Search Input Button Event Listener
  elements.clearSearchBtn.addEventListener("click", () => {
    // Clear search input text value
    elements.searchInput.value = "";
    // Reset appState search query string
    appState.searchQuery = "";
    // Hide clear search button
    elements.clearSearchBtn.classList.add("hidden");
    // Re-render task list
    renderTodos();
  });

  // Status Filter Tabs Click Event Listeners
  elements.statusTabs.forEach((tab) => {
    // Attach click event to each status tab button
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      elements.statusTabs.forEach((t) => t.classList.remove("active"));
      // Add active class to clicked tab button
      tab.classList.add("active");
      // Update appState active filter property from data-filter attribute
      appState.activeFilter = tab.getAttribute("data-filter");
      // Re-render tasks list matching selected status filter
      renderTodos();
    });
  });

  // Category Filter Select Event Listener
  elements.categoryFilterSelect.addEventListener("change", (e) => {
    // Update appState category filter value
    appState.categoryFilter = e.target.value;
    // Re-render tasks list
    renderTodos();
  });

  // Close Modal Dialog Event Listeners
  elements.closeModalBtn.addEventListener("click", closeEditModal);
  elements.cancelModalBtn.addEventListener("click", closeEditModal);

  // Close Modal when clicking outside modal card on overlay backdrop
  elements.editModalOverlay.addEventListener("click", (e) => {
    // Check if click event target was overlay backdrop
    if (e.target === elements.editModalOverlay) {
      // Close edit modal dialog
      closeEditModal();
    }
  });

  // Edit Form Submit Event Listener
  elements.editForm.addEventListener("submit", handleEditFormSubmit);
}

/* ==========================================
   API Async Operations & HTTP Fetch Handlers
   ========================================== */

// READ: Fetch All Tasks from FastAPI Backend
async function fetchTodos() {
  try {
    // Execute GET request to FastAPI backend endpoint
    const response = await fetch(API_BASE_URL);
    // Parse JSON payload response body into JavaScript array
    const data = await response.json();
    // Update appState todos array with fetched task objects
    appState.todos = data;
    // Update stats counters and render task cards
    updateStats();
    renderTodos();
  } catch (error) {
    // Log network connection error to console
    console.error("Error fetching tasks:", error);
    // Display error toast notification message to user
    showToast("Failed to load tasks from server. Make sure Python backend is running!", "danger");
  }
}

// CREATE: Submit New Task to FastAPI Backend
async function handleFormSubmit(e) {
  // Prevent default form page reload behavior
  e.preventDefault();

  // Extract input values from form fields
  const title = elements.titleInput.value.trim();
  const category = elements.categorySelect.value;
  const priority = elements.prioritySelect.value;
  const due_date = elements.dueDateInput.value;
  const description = elements.descInput.value.trim();

  // Validate that required title input field is not empty
  if (!title) {
    showToast("Please enter a task title!", "danger");
    return;
  }

  // Construct task creation data payload object matching Pydantic TodoCreate schema
  const newTodo = {
    title,
    category,
    priority,
    due_date,
    description,
  };

  try {
    // Execute POST HTTP request sending JSON string payload to backend
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    // Check if HTTP response status is OK success (201 Created)
    if (!response.ok) {
      throw new Error(`Server returned error code ${response.status}`);
    }

    // Parse created task object returned from server
    const createdTodo = await response.json();

    // Prepend newly created task to local state array
    appState.todos.unshift(createdTodo);

    // Reset form fields back to default empty values
    elements.todoForm.reset();
    elements.prioritySelect.value = "Medium";
    elements.categorySelect.value = "Personal";

    // Update stats counters and re-render task list UI
    updateStats();
    renderTodos();

    // Show success toast notification
    showToast("Task created successfully!", "success");
  } catch (error) {
    // Log error to console
    console.error("Error creating task:", error);
    // Display error toast message
    showToast("Failed to create task. Check backend connection.", "danger");
  }
}

// UPDATE (TOGGLE): Toggle Task Completion Status
async function toggleTodoStatus(todoId) {
  try {
    // Execute PATCH request to toggle completion endpoint
    const response = await fetch(`${API_BASE_URL}/${todoId}/toggle`, {
      method: "PATCH",
    });

    // Verify response status
    if (!response.ok) {
      throw new Error("Failed to toggle completion status");
    }

    // Parse updated task item from response
    const updatedTodo = await response.json();

    // Update matching task object inside appState array
    appState.todos = appState.todos.map((item) => (item.id === todoId ? updatedTodo : item));

    // Update stats counters and re-render list
    updateStats();
    renderTodos();

    // Show notification toast message
    const msg = updatedTodo.is_completed ? "Task marked as completed! 🎉" : "Task marked as pending.";
    showToast(msg, "info");
  } catch (error) {
    // Log error and notify user
    console.error("Error toggling completion status:", error);
    showToast("Error updating task completion.", "danger");
  }
}

// UPDATE (EDIT): Submit Modified Task Details Form
async function handleEditFormSubmit(e) {
  // Prevent form page reload
  e.preventDefault();

  // Extract edited values from modal inputs
  const todoId = parseInt(elements.editTaskIdInput.value, 10);
  const title = elements.editTitleInput.value.trim();
  const category = elements.editCategorySelect.value;
  const priority = elements.editPrioritySelect.value;
  const due_date = elements.editDueDateInput.value;
  const description = elements.editDescInput.value.trim();
  const is_completed = elements.editCompletedCheckbox.checked;

  // Validate title
  if (!title) {
    showToast("Task title cannot be empty!", "danger");
    return;
  }

  // Construct payload matching TodoUpdate schema
  const updatedPayload = {
    title,
    category,
    priority,
    due_date,
    description,
    is_completed,
  };

  try {
    // Execute PUT HTTP request to update task on backend
    const response = await fetch(`${API_BASE_URL}/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPayload),
    });

    // Check response status
    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    // Parse updated task object
    const updatedTodo = await response.json();

    // Replace item in appState array
    appState.todos = appState.todos.map((item) => (item.id === todoId ? updatedTodo : item));

    // Close edit modal dialog
    closeEditModal();

    // Refresh UI stats and task cards list
    updateStats();
    renderTodos();

    // Show success toast notification
    showToast("Task updated successfully!", "success");
  } catch (error) {
    // Log error to console
    console.error("Error updating task:", error);
    showToast("Failed to update task.", "danger");
  }
}

// DELETE: Delete Task by ID from FastAPI Backend
async function deleteTodoItem(todoId) {
  // Confirm deletion action with user prompt
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    // Execute DELETE HTTP request to backend endpoint
    const response = await fetch(`${API_BASE_URL}/${todoId}`, {
      method: "DELETE",
    });

    // Check HTTP status code
    if (!response.ok) {
      throw new Error("Failed to delete task record");
    }

    // Filter out deleted task item from local appState array
    appState.todos = appState.todos.filter((item) => item.id !== todoId);

    // Update stats and re-render list
    updateStats();
    renderTodos();

    // Show notification toast
    showToast("Task deleted.", "info");
  } catch (error) {
    // Log error
    console.error("Error deleting task:", error);
    showToast("Failed to delete task.", "danger");
  }
}

/* ==========================================
   UI Rendering & Rendering Helpers
   ========================================== */

// Update Overview Statistics Metrics and Progress Bar Width
function updateStats() {
  // Calculate total count of all tasks
  const total = appState.todos.length;
  // Count completed tasks using array filter
  const completed = appState.todos.filter((t) => t.is_completed).length;
  // Calculate remaining pending tasks count
  const pending = total - completed;

  // Update counter text contents in DOM
  elements.statTotal.textContent = total;
  elements.statPending.textContent = pending;
  elements.statCompleted.textContent = completed;

  // Calculate percentage of completion
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  // Set width style percentage on glowing progress fill element
  elements.progressBarFill.style.width = `${percentage}%`;
}

// Render Filtered Task Cards List to DOM
function renderTodos() {
  // Filter tasks based on active status filter, category filter, and search text
  const filtered = appState.todos.filter((todo) => {
    // Match Status filter condition
    let matchesStatus = true;
    if (appState.activeFilter === "pending") matchesStatus = !todo.is_completed;
    if (appState.activeFilter === "completed") matchesStatus = todo.is_completed;

    // Match Category filter condition
    let matchesCategory = true;
    if (appState.categoryFilter !== "all") {
      matchesCategory = todo.category === appState.categoryFilter;
    }

    // Match Search Query condition (searches title and description)
    let matchesSearch = true;
    if (appState.searchQuery) {
      const titleMatch = todo.title.toLowerCase().includes(appState.searchQuery);
      const descMatch = (todo.description || "").toLowerCase().includes(appState.searchQuery);
      matchesSearch = titleMatch || descMatch;
    }

    // Return true only if all filter conditions pass
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Clear existing task items inside list container element
  elements.taskList.innerHTML = "";

  // Check if filtered list contains zero tasks
  if (filtered.length === 0) {
    // Display empty state placeholder graphic
    elements.emptyState.classList.remove("hidden");
    return;
  }

  // Hide empty state placeholder graphic if matching tasks exist
  elements.emptyState.classList.add("hidden");

  // Loop through filtered array and append task cards to list
  filtered.forEach((todo) => {
    // Create task card DOM element
    const cardElement = createTaskCardDOM(todo);
    // Append card element to task list container
    elements.taskList.appendChild(cardElement);
  });
}

// Create Dynamic Task Card DOM Element with Event Listeners
function createTaskCardDOM(todo) {
  // Create outer task card element box
  const card = document.createElement("div");
  // Apply task-card class and completed class if task is finished
  card.className = `task-card ${todo.is_completed ? "completed" : ""}`;
  // Set custom priority attribute for CSS left accent border color styling
  card.setAttribute("data-priority", todo.priority);

  // Category Icon Mapping Dictionary
  const categoryIcons = {
    Personal: "fa-house",
    Work: "fa-briefcase",
    Shopping: "fa-cart-shopping",
    Health: "fa-heart-pulse",
    Urgent: "fa-bolt",
  };
  const categoryIcon = categoryIcons[todo.category] || "fa-folder";

  // Format due date indicator if present
  let dueDateHTML = "";
  if (todo.due_date) {
    const todayStr = new Date().toISOString().split("T")[0];
    const isPastDue = !todo.is_completed && todo.due_date < todayStr;
    dueDateHTML = `
      <span class="badge badge-due-date ${isPastDue ? "past-due" : ""}">
        <i class="fa-solid fa-calendar"></i> ${todo.due_date} ${isPastDue ? "(Past Due)" : ""}
      </span>
    `;
  }

  // Set inner HTML content of task card element
  card.innerHTML = `
    <label class="checkbox-container" title="Toggle Completion">
      <input type="checkbox" class="task-checkbox" ${todo.is_completed ? "checked" : ""}>
      <span class="custom-checkmark"><i class="fa-solid fa-check"></i></span>
    </label>

    <div class="task-content">
      <div class="task-header-row">
        <h4 class="task-title">${escapeHTML(todo.title)}</h4>
      </div>
      ${todo.description ? `<p class="task-description">${escapeHTML(todo.description)}</p>` : ""}
      
      <div class="task-meta-row">
        <span class="badge badge-category">
          <i class="fa-solid ${categoryIcon}"></i> ${escapeHTML(todo.category)}
        </span>
        <span class="badge badge-priority-${todo.priority}">
          <i class="fa-solid fa-flag"></i> ${todo.priority}
        </span>
        ${dueDateHTML}
      </div>
    </div>

    <div class="task-actions">
      <button class="action-btn action-btn-edit" title="Edit Task" aria-label="Edit Task">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="action-btn action-btn-delete" title="Delete Task" aria-label="Delete Task">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `;

  // Attach Checkbox Toggle Event Listener
  const checkbox = card.querySelector(".task-checkbox");
  checkbox.addEventListener("change", () => {
    toggleTodoStatus(todo.id);
  });

  // Attach Edit Button Event Listener
  const editBtn = card.querySelector(".action-btn-edit");
  editBtn.addEventListener("click", () => {
    openEditModal(todo);
  });

  // Attach Delete Button Event Listener
  const deleteBtn = card.querySelector(".action-btn-delete");
  deleteBtn.addEventListener("click", () => {
    deleteTodoItem(todo.id);
  });

  // Return constructed task card DOM element
  return card;
}

// Open Edit Modal Dialog populated with Task Data
function openEditModal(todo) {
  // Fill modal hidden task ID input
  elements.editTaskIdInput.value = todo.id;
  // Fill title input
  elements.editTitleInput.value = todo.title;
  // Select category option
  elements.editCategorySelect.value = todo.category;
  // Select priority option
  elements.editPrioritySelect.value = todo.priority;
  // Set due date value
  elements.editDueDateInput.value = todo.due_date || "";
  // Set description textarea text
  elements.editDescInput.value = todo.description || "";
  // Set completion checkbox checked boolean state
  elements.editCompletedCheckbox.checked = todo.is_completed;

  // Unhide modal backdrop overlay container element
  elements.editModalOverlay.classList.remove("hidden");
}

// Close Edit Modal Dialog Function
function closeEditModal() {
  // Hide modal backdrop overlay container element
  elements.editModalOverlay.classList.add("hidden");
  // Reset modal form fields
  elements.editForm.reset();
}

// Floating Toast Notification Pop-up Function
function showToast(message, type = "info") {
  // Create toast DOM div element
  const toast = document.createElement("div");
  // Set toast class names based on notification type ('success', 'danger', 'info')
  toast.className = `toast toast-${type}`;

  // Icon type mapping
  const icons = {
    success: "fa-circle-check",
    danger: "fa-circle-exclamation",
    info: "fa-circle-info",
  };
  const iconClass = icons[type] || "fa-circle-info";

  // Set inner HTML of toast element
  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${escapeHTML(message)}</span>
  `;

  // Append toast popup to floating toast container element
  elements.toastContainer.appendChild(toast);

  // Automatically fade out and remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Sanitize HTML Strings to Prevent Cross-Site Scripting (XSS) Attacks
function escapeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
