class Todo {
  constructor(storageKey = 'ai1_lab_b_tasks') {
    this.storageKey = storageKey;
    this.tasks = [];
    this.term = '';
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.tasks = JSON.parse(raw);
      else
        this.tasks = [
          {
            id: this._id(),
            text: 'Przykładowe zadanie',
            due: null,
            created: new Date().toISOString(),
          },
        ];
    } catch (e) {
      console.error('Load error', e);
      this.tasks = [];
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
  }

  _id() {
    return Math.random().toString(36).slice(2, 10);
  }

  addTask(text, due) {
    const t = text.trim();
    if (t.length < 3 || t.length > 255)
      throw new Error('Text must be 3–255 characters');

    if (due) {
      const d = new Date(due);
      if (isNaN(d.getTime())) throw new Error('Invalid date');
      const now = new Date();
      if (d <= now) throw new Error('Date must be in the future');
    }

    const task = {
      id: this._id(),
      text: t,
      due: due ? new Date(due).toISOString() : null,
      created: new Date().toISOString(),
    };
    this.tasks.push(task);
    this.save();
  }

  removeTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.save();
  }

  editTask(id, newText, newDue) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    const t = String(newText).trim();
    if (t.length < 3 || t.length > 255)
      throw new Error('Text must be 3–255 characters');

    if (newDue) {
      const d = new Date(newDue);
      if (isNaN(d.getTime())) throw new Error('Invalid date');
      const now = new Date();
      if (d <= now) throw new Error('Date must be in the future');
      task.due = d.toISOString();
    } else {
      task.due = null;
    }

    task.text = t;
    this.save();
  }

  setTerm(term) {
    this.term = term;
  }

  get filteredTasks() {
    const q = this.term.trim().toLowerCase();
    if (q.length < 1) return this.tasks.slice();
    return this.tasks.filter((t) => t.text.toLowerCase().includes(q));
  }

  highlight(text) {
    const q = this.term.trim();
    if (q.length < 1) return this._escape(text);

    const re = new RegExp(this._escapeForRegExp(q), 'ig');
    return this._escape(text).replace(
      re,
      (match) => `<span class="highlight">${match}</span>`
    );
  }

  _escape(str) {
    return String(str).replace(/[&<>"']/g, (s) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[s]
    );
  }

  _escapeForRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

const todo = new Todo();
const listRoot = document.getElementById('todo-list');
const infoRoot = document.getElementById('todo-info');
const searchInput = document.getElementById('search');
const addForm = document.getElementById('add-form');
const newTextInput = document.getElementById('new-text');
const newDueInput = document.getElementById('new-due');

let currentEditingId = null;

function render() {
  currentEditingId = null;

  listRoot.innerHTML = '';
  const tasks = todo.filteredTasks;

  infoRoot.innerHTML = `<div class="todo-count">Zadania: ${tasks.length} (całkowita: ${todo.tasks.length})</div>`;

  if (tasks.length === 0) {
    listRoot.innerHTML =
      '<div style="padding:10px;color:#666">Brak zadań</div>';
    return;
  }

  tasks.sort((a, b) => {
    if (a.due && b.due) return new Date(a.due) - new Date(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return new Date(a.created) - new Date(b.created);
  });

  tasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'todo-item';
    item.dataset.id = task.id;

    const main = document.createElement('div');
    main.className = 'todo-main';

    const textDiv = document.createElement('div');
    textDiv.className = 'todo-text';
    textDiv.innerHTML = todo.highlight(task.text);
    textDiv.title = 'Kliknij, aby edytować';
    textDiv.tabIndex = 0;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'todo-due';
    dateDiv.textContent = task.due
      ? new Date(task.due).toLocaleString()
      : '';

    if (task.due) {
      const dueDate = new Date(task.due);
      if (dueDate < new Date()) item.classList.add('overdue');
    }

    main.appendChild(textDiv);
    main.appendChild(dateDiv);

    const controls = document.createElement('div');
    controls.className = 'controls';

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Usuń';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Czy na pewno usunąć zadanie?')) {
        todo.removeTask(task.id);
        render();
      }
    });

    controls.appendChild(delBtn);
    item.appendChild(main);
    item.appendChild(controls);

    function beginEdit() {
      if (currentEditingId && currentEditingId !== task.id) {
        const prevId = currentEditingId;
        currentEditingId = null; 
        render();
        const newItem = document.querySelector(`[data-id="${task.id}"]`);
        if (newItem) {
          const textEl = newItem.querySelector('.todo-text');
          if (textEl) textEl.click();
        }
        return;
      }

      if (currentEditingId === task.id) return;
      currentEditingId = task.id;

      const editContainer = document.createElement('div');
      editContainer.className = 'edit-container';
      editContainer.style.display = 'flex';
      editContainer.style.gap = '8px';
      editContainer.style.alignItems = 'center';

      const inputText = document.createElement('input');
      inputText.className = 'edit-text';
      inputText.type = 'text';
      inputText.value = task.text;
      inputText.maxLength = 255;
      inputText.style.minWidth = '220px';

      const inputDate = document.createElement('input');
      inputDate.className = 'edit-date';
      inputDate.type = 'datetime-local';
      inputDate.value = task.due ? toLocalDateTime(task.due) : '';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Zapisz';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Anuluj';

      main.innerHTML = '';
      editContainer.appendChild(inputText);
      editContainer.appendChild(inputDate);
      editContainer.appendChild(saveBtn);
      editContainer.appendChild(cancelBtn);
      main.appendChild(editContainer);

      inputText.focus();
      inputText.select();

      function finish(save) {
        try {
          if (save) {
            const dueVal = inputDate.value || null;
            todo.editTask(task.id, inputText.value, dueVal);
          }
        } catch (err) {
          alert(err.message);
          return;
        }
        currentEditingId = null;
        render();
      }

      saveBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        finish(true);
      });

      cancelBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        currentEditingId = null;
        render();
      });

      inputText.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') finish(true);
        if (ev.key === 'Escape') {
          currentEditingId = null;
          render();
        }
      });

      inputDate.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') finish(true);
        if (ev.key === 'Escape') {
          currentEditingId = null;
          render();
        }
      });
    }

    [textDiv, dateDiv].forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        beginEdit();
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          beginEdit();
        }
      });
    });

    listRoot.appendChild(item);
  });
}

function toLocalDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    todo.addTask(newTextInput.value, newDueInput.value || null);
    newTextInput.value = '';
    newDueInput.value = '';
    render();
  } catch (err) {
    alert(err.message);
  }
});

searchInput.addEventListener('input', (e) => {
  todo.setTerm(e.target.value);
  render();
});

render();
