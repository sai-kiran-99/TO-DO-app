let taskInput = document.getElementById("addtaskinput");
let addButton = document.getElementById("addtask");
let list = document.getElementById("list");

let taskCounter = 0;

document.addEventListener("DOMContentLoaded", function () {
  loadTasks();
  updateEmptyState();
});

function addTask() {
  console.log("Adding task...");
  let val = taskInput.value.trim();

  if (val !== "") {
    if (val.length > 300) {
      showNotification(
        "Task is too long! Please keep it under 300 characters.",
        "error"
      );
      return;
    }

    createTaskElement(val);
    taskInput.value = "";
    saveTasks();
    updateEmptyState();
    showNotification("Task added successfully!", "success");

    taskInput.style.transform = "scale(0.98)";
    setTimeout(() => {
      taskInput.style.transform = "scale(1)";
    }, 100);
  } else {
    taskInput.style.animation = "shake 0.5s ease-in-out";
    setTimeout(() => {
      taskInput.style.animation = "";
    }, 500);
    showNotification("Please enter a task!", "warning");
  }
}

function createTaskElement(taskText, isCompleted = false) {
  let li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = taskCounter++;

  li.innerHTML = `
   <div class="task-content">
     <input type="checkbox" class="task-checkbox" ${
       isCompleted ? "checked" : ""
     }>
     <span class="task-text ${isCompleted ? "completed" : ""}">${escapeHtml(
    taskText
  )}</span>
   </div>
   <div class="task-actions">
     <button class="edit-btn" title="Edit task">✏️</button>
     <button class="delete-btn" title="Delete task">🗑️</button>
   </div>
 `;

  setupTaskEventListeners(li);

  li.style.opacity = "0";
  li.style.transform = "translateX(-20px)";
  list.appendChild(li);

  requestAnimationFrame(() => {
    li.style.transition = "all 0.3s ease-out";
    li.style.opacity = "1";
    li.style.transform = "translateX(0)";
  });

  console.log("Task created:", taskText);
}

function setupTaskEventListeners(li) {
  const checkbox = li.querySelector(".task-checkbox");
  const taskText = li.querySelector(".task-text");
  const editBtn = li.querySelector(".edit-btn");
  const deleteBtn = li.querySelector(".delete-btn");

  checkbox.addEventListener("change", function () {
    taskText.classList.toggle("completed", this.checked);
    li.classList.toggle("task-completed", this.checked);
    saveTasks();

    if (this.checked) {
      showNotification("Task completed! 🎉", "success");
    }
  });

  editBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    editTask(li, taskText);
  });

  deleteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    deleteTask(li);
  });

  taskText.addEventListener("dblclick", function () {
    editTask(li, taskText);
  });
}

function editTask(li, taskTextElement) {
  const currentText = taskTextElement.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className = "edit-input";
  input.maxLength = 200;

  taskTextElement.style.display = "none";
  taskTextElement.parentNode.insertBefore(input, taskTextElement);
  input.focus();
  input.select();

  function saveEdit() {
    const newText = input.value.trim();
    if (newText !== "" && newText !== currentText) {
      taskTextElement.textContent = newText;
      saveTasks();
      showNotification("Task updated!", "success");
    }

    input.remove();
    taskTextElement.style.display = "inline";
  }

  function cancelEdit() {
    input.remove();
    taskTextElement.style.display = "inline";
  }

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      saveEdit();
    }
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      cancelEdit();
    }
  });
}

function deleteTask(li) {
  if (confirm("Are you sure you want to delete this task?")) {
    li.style.transition = "all 0.3s ease-out";
    li.style.opacity = "0";
    li.style.transform = "translateX(20px)";

    setTimeout(() => {
      li.remove();
      saveTasks();
      updateEmptyState();
      showNotification("Task deleted!", "info");
    }, 300);
  }
}

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addTask();
  }
});

taskInput.addEventListener("input", function () {
  const length = this.value.length;
  const maxLength = 200;

  let counter = document.querySelector(".char-counter");
  if (counter) counter.remove();

  if (length > maxLength * 0.8) {
    counter = document.createElement("div");
    counter.className = "char-counter";
    counter.textContent = `${length}/${maxLength}`;
    counter.style.color = length > maxLength ? "#e74c3c" : "#666";
    this.parentNode.appendChild(counter);
  }
});

function clearAllTasks() {
  if (list.children.length === 0) {
    showNotification("No tasks to clear!", "warning");
    return;
  }

  if (
    confirm("Are you sure you want to delete all tasks? This cannot be undone.")
  ) {
    Array.from(list.children).forEach((li, index) => {
      setTimeout(() => {
        li.style.transition = "all 0.3s ease-out";
        li.style.opacity = "0";
        li.style.transform = "translateX(20px)";

        setTimeout(() => {
          li.remove();
          if (index === list.children.length - 1) {
            saveTasks();
            updateEmptyState();
            showNotification("All tasks cleared!", "info");
          }
        }, 300);
      }, index * 100);
    });
  }
}

function updateEmptyState() {
  let emptyState = document.querySelector(".empty-state");

  if (list.children.length === 0) {
    if (!emptyState) {
      emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.innerHTML = `
       <div class="empty-state-icon">📝</div>
       <p>No tasks yet. Add one above to get started!</p>
     `;
      list.parentNode.appendChild(emptyState);
    }
  } else {
    if (emptyState) {
      emptyState.remove();
    }
  }
}

function showNotification(message, type = "info") {
  let existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

function saveTasks() {
  const tasks = Array.from(list.children).map((li) => ({
    text: li.querySelector(".task-text").textContent,
    completed: li.querySelector(".task-checkbox").checked,
    id: li.dataset.id
  }));

  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("todoTasks");
  if (savedTasks) {
    const tasks = JSON.parse(savedTasks);
    tasks.forEach((task) => {
      createTaskElement(task.text, task.completed);
    });
  }
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    if (document.activeElement !== taskInput) {
      taskInput.focus();
    } else {
      addTask();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
    e.preventDefault();
    clearAllTasks();
  }
});

taskInput.addEventListener("focus", function () {
  this.parentNode.classList.add("input-focused");
});

taskInput.addEventListener("blur", function () {
  this.parentNode.classList.remove("input-focused");
});

document.addEventListener("DOMContentLoaded", function () {
  let clearAllBtn = document.getElementById("clear-all");
  if (!clearAllBtn) {
    clearAllBtn = document.createElement("button");
    clearAllBtn.id = "clear-all";
    clearAllBtn.textContent = "Clear All";
    clearAllBtn.className = "clear-all-btn";
    clearAllBtn.addEventListener("click", clearAllTasks);

    const mainDiv = document.querySelector(".main1div");
    if (mainDiv) {
      mainDiv.appendChild(clearAllBtn);
    }
  }
});