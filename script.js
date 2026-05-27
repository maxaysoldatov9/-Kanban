const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");

const lists = {
  todo: document.querySelector("#todoList"),
  progress: document.querySelector("#progressList"),
  done: document.querySelector("#doneList"),
};

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    return;
  }

  const task = {
    id: Date.now(),
    text,
    status: "todo",
  };

  tasks.push(task);
  taskInput.value = "";

  saveTasks();
  renderTasks();
});

function renderTasks() {
  lists.todo.innerHTML = "";
  lists.progress.innerHTML = "";
  lists.done.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = document.createElement("article");
    taskElement.className = "task";

    taskElement.innerHTML = `
      <p>${task.text}</p>
      <div class="task-actions">
        ${getTaskButtons(task)}
        <button class="danger" data-action="delete" data-id="${task.id}">Удалить</button>
      </div>
    `;

    lists[task.status].appendChild(taskElement);
  });
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
    const task = tasks.find((task) => task.id === id);

    if (task) {
      task.status = action;
    }
  }

  saveTasks();
  renderTasks();
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

renderTasks();