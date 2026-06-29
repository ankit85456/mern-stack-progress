const todoList = document.getElementById("todoList");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const searchInput = document.getElementById("search");
const submitBtn = document.getElementById("submitBtn");
const themeToggle = document.getElementById("themeToggle");

let todos = [];
let editId = null;

function initTodoApp() {
    loadTheme();
    loadTodos();
    renderTodos();

    searchInput.addEventListener("input", renderTodos);
    themeToggle.addEventListener("click", toggleTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem("todoAppTheme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
    updateThemeToggle();
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("todoAppTheme", theme);
    updateThemeToggle();
}

function updateThemeToggle() {
    themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function loadTodos() {
    const saved = localStorage.getItem("todoAppTodos");
    todos = saved ? JSON.parse(saved) : [];
}

function saveTodos() {
    localStorage.setItem("todoAppTodos", JSON.stringify(todos));
}

function handleSubmit() {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title === "" || description === "") {
        alert("Please fill all fields");
        return;
    }

    if (editId) {
        todos = todos.map(todo => {
            if (todo.id === editId) {
                return {
                    ...todo,
                    title,
                    description,
                    updatedAt: Date.now(),
                };
            }
            return todo;
        });
        editId = null;
        submitBtn.textContent = "Add Todo";
        submitBtn.classList.remove("update");
    } else {
        todos.unshift({
            id: Date.now().toString(),
            title,
            description,
            completed: false,
            createdAt: Date.now(),
        });
    }

    saveTodos();
    renderTodos();
    resetForm();
}

function resetForm() {
    titleInput.value = "";
    descriptionInput.value = "";
    titleInput.focus();
}

function renderTodos() {
    const query = searchInput.value.trim().toLowerCase();
    const filteredTodos = todos.filter(todo => {
        const titleMatch = todo.title.toLowerCase().includes(query);
        const descMatch = todo.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
    });

    todoList.innerHTML = "";

    if (filteredTodos.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.innerHTML = `<p>${todos.length === 0 ? "No todos yet. Add your first task." : "No matching todos found."}</p>`;
        todoList.appendChild(emptyState);
        return;
    }

    filteredTodos.forEach(todo => {
        todoList.appendChild(createTodoCard(todo));
    });
}

function createTodoCard(todo) {
    const card = document.createElement("div");
    card.className = "todo";
    if (todo.completed) card.classList.add("completed");

    const title = document.createElement("h3");
    title.textContent = todo.title;

    const description = document.createElement("p");
    description.textContent = todo.description;

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "action-btn complete-btn";
    completeBtn.textContent = todo.completed ? "✓ Completed" : "Mark Complete";
    completeBtn.addEventListener("click", () => toggleComplete(todo.id));

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "action-btn edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => removeTodo(todo.id));

    actions.append(completeBtn, editBtn, deleteBtn);
    card.append(title, description, actions);

    return card;
}

function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return {
                ...todo,
                completed: !todo.completed,
            };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

function startEdit(id) {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;

    titleInput.value = todo.title;
    descriptionInput.value = todo.description;
    editId = id;
    submitBtn.textContent = "Update Todo";
    submitBtn.classList.add("update");
    titleInput.focus();
}

function removeTodo(id) {
    if (!confirm("Delete this todo?")) return;

    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();

    if (editId === id) {
        resetForm();
        editId = null;
        submitBtn.textContent = "Add Todo";
        submitBtn.classList.remove("update");
    }
}

initTodoApp();