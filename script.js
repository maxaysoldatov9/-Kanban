const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");

const lists = {
  todo: document.querySelector("#todoList"),
  progress: document.querySelector("#progressList"),
  done: document.querySelector("#doneList"),
};

const counters = {
  total: document.querySelector("#totalCount"),
  done: document.querySelector("#doneCount"),
  todoColumn: document.querySelector("#todoCount"),
  progressColumn: document.querySelector("#progressCount"),
  doneColumn: document.querySelector("#doneColumnCount"),
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedTaskId = null;

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    return;
  }

  tasks.push({
    id: Date.now(),
    text,
    status: "todo",
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
});

function renderTasks() {
  Object.values(lists).forEach((list) => {
    list.innerHTML = "";
  });

  tasks.forEach((task) => {
    const taskElement = document.createElement("article");
    taskElement.className = "task";
    taskElement.draggable = true;
    taskElement.dataset.id = task.id;

    taskElement.innerHTML = `
      <p>${escapeHtml(task.text)}</p>
      <div class="task-actions">
        ${getTaskButtons(task)}
        <button class="danger" data-action="delete" data-id="${task.id}">Удалить</button>
      </div>
    `;

    lists[task.status].appendChild(taskElement);
  });

  updateCounters();
}

function getTaskButtons(task) {
  if (task.status === "todo") {
    return `<button data-action="progress" data-id="${task.id}">В работу</button>`;
  }

  if (task.status === "progress") {
    return `
      <button class="secondary" data-action="todo" data-id="${task.id}">Назад</button>
      <button class="success" data-action="done" data-id="${task.id}">Готово</button>
    `;
  }

  return `<button class="secondary" data-action="progress" data-id="${task.id}">Вернуть</button>`;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "delete") {
    tasks = tasks.filter((task) => task.id !== id);
  } else {
    updateTaskStatus(id, action);
  }

  saveTasks();
  renderTasks();
});

document.addEventListener("dragstart", (event) => {
  const taskElement = event.target.closest(".task");

  if (!taskElement) {
    return;
  }

  draggedTaskId = Number(taskElement.dataset.id);
  taskElement.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(draggedTaskId));
});

document.addEventListener("dragend", (event) => {
  const taskElement = event.target.closest(".task");

  if (taskElement) {
    taskElement.classList.remove("dragging");
  }

  draggedTaskId = null;
  document.querySelectorAll(".column").forEach((column) => {
    column.classList.remove("drag-over");
  });
});

document.querySelectorAll(".column").forEach((column) => {
  column.addEventListener("dragover", (event) => {
    event.preventDefault();
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", (event) => {
    if (!column.contains(event.relatedTarget)) {
      column.classList.remove("drag-over");
    }
  });

  column.addEventListener("drop", (event) => {
    event.preventDefault();
    column.classList.remove("drag-over");

    const id = draggedTaskId || Number(event.dataTransfer.getData("text/plain"));
    const status = column.dataset.status;

    if (!id || !status) {
      return;
    }

    updateTaskStatus(id, status);
    saveTasks();
    renderTasks();
  });
});

function updateTaskStatus(id, status) {
  const task = tasks.find((currentTask) => currentTask.id === id);

  if (task) {
    task.status = status;
  }
}

function updateCounters() {
  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const progressCount = tasks.filter((task) => task.status === "progress").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  counters.total.textContent = tasks.length;
  counters.done.textContent = doneCount;
  counters.todoColumn.textContent = todoCount;
  counters.progressColumn.textContent = progressCount;
  counters.doneColumn.textContent = doneCount;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderTasks();
