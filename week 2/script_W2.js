let tasks = [];          // { id, text, completed }
let editingId = null;
let currentFilter = 'all';

const taskInput    = document.getElementById('taskInput');
const taskList     = document.getElementById('taskList');
const emptyState   = document.getElementById('emptyState');
const notification = document.getElementById('notification');
const editModal    = document.getElementById('editModal');
const editInput    = document.getElementById('editInput');
const totalCount   = document.getElementById('totalCount');
const doneCount    = document.getElementById('doneCount');
const pendingCount = document.getElementById('pendingCount');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

let notifTimer = null;

function showNotification(message, type = 'success') {
  clearTimeout(notifTimer);
  notification.textContent = (type === 'success' ? '✓ ' : '✕ ') + message;
  notification.className = `notification ${type}`;
  notifTimer = setTimeout(() => {
    notification.className = 'notification hidden';
  }, 3000);
}

function updateStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const pending = total - done;

  totalCount.textContent   = `${total} task${total !== 1 ? 's' : ''}`;
  doneCount.textContent    = `${done} done`;
  pendingCount.textContent = `${pending} pending`;
}

function isVisible(task) {
  if (currentFilter === 'completed') return task.completed;
  if (currentFilter === 'pending')   return !task.completed;
  return true;
}

function render() {
  taskList.innerHTML = '';

  const visibleTasks = tasks.filter(isVisible);

  if (visibleTasks.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }

  visibleTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        aria-label="Mark as ${task.completed ? 'incomplete' : 'complete'}"
        onchange="toggleTask('${task.id}')"
      />
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="icon-btn edit"   aria-label="Edit task"   onclick="openEdit('${task.id}')">✏️</button>
        <button class="icon-btn delete" aria-label="Delete task" onclick="deleteTask('${task.id}')">🗑️</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addTask() {
  const raw  = taskInput.value;
  const text = raw.trim();

  if (!text) {
    showNotification('Task cannot be empty. Please type something!', 'error');
    taskInput.focus();
    return;
  }

  if (text.length < 2) {
    showNotification('Task is too short. Add a bit more detail.', 'error');
    taskInput.focus();
    return;
  }

  const duplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    showNotification('This task already exists in your list!', 'error');
    taskInput.focus();
    return;
  }

  tasks.unshift({ id: generateId(), text, completed: false });
  taskInput.value = '';

  if (currentFilter !== 'all') {
    currentFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
  }

  render();
  showNotification('Task added successfully!', 'success');
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  render();
  showNotification(
    task.completed ? 'Task marked as complete! 🎉' : 'Task marked as pending.',
    'success'
  );
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
  showNotification('Task deleted.', 'success');
}

function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId       = id;
  editInput.value = task.text;
  editModal.classList.remove('hidden');
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);
}

function closeModal() {
  editModal.classList.add('hidden');
  editingId = null;
}

function saveEdit() {
  const text = editInput.value.trim();

  if (!text) {
    editInput.classList.add('error-shake');
    setTimeout(() => editInput.classList.remove('error-shake'), 400);
    showNotification('Task text cannot be empty!', 'error');
    return;
  }

  const duplicate = tasks.some(
    t => t.id !== editingId && t.text.toLowerCase() === text.toLowerCase()
  );
  if (duplicate) {
    showNotification('Another task with this text already exists!', 'error');
    return;
  }

  const task = tasks.find(t => t.id === editingId);
  if (task) {
    task.text = text;
    render();
    showNotification('Task updated!', 'success');
  }
  closeModal();
}

function filterTasks(btn) {
  currentFilter = btn.dataset.filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

editInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')  saveEdit();
  if (e.key === 'Escape') closeModal();
});

editModal.addEventListener('click', e => {
  if (e.target === editModal) closeModal();
});

tasks = [
  { id: generateId(), text: 'Learn JavaScript fundamentals',   completed: true  },
  { id: generateId(), text: 'Build the Week 2 Task Manager',   completed: false },
  { id: generateId(), text: 'Deploy to GitHub Pages',          completed: false },
];

render();
taskInput.focus();
