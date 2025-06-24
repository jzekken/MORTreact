import React, { useState, useEffect } from 'react';
import './TodoDashboard.css';

const TodoDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Not Started');
  const [priority, setPriority] = useState('Low');
  const [dueDate, setDueDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ priority: '', status: '', date: '' });

  useEffect(() => {
    updateProgress();
  }, [tasks]);

  const saveTask = () => {
    if (!title || !description || !dueDate) return alert('Please fill out all fields');

    const newTask = {
      id: editId || Date.now(),
      title,
      description,
      status,
      priority,
      dueDate,
    };

    if (editId) {
      setTasks(tasks.map(t => (t.id === editId ? newTask : t)));
      setEditId(null);
    } else {
      setTasks([...tasks, newTask]);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setStatus('Not Started');
    setPriority('Low');
    setDueDate('');
    setShowForm(false);
  };

  const editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setEditId(id);
    setShowForm(true);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateProgress = () => {
    const total = tasks.length || 1;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;

    setCircle('completed-bar', 'completed-count', (completed / total) * 100);
    setCircle('progress-bar', 'progress-count', (inProgress / total) * 100);
    setCircle('notstarted-bar', 'notstarted-count', (notStarted / total) * 100);
  };

  const setCircle = (barId, labelId, percent) => {
    const circle = document.getElementById(barId);
    const label = document.getElementById(labelId);
    if (!circle || !label) return;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    label.textContent = `${Math.round(percent)}%`;
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (!filters.priority || task.priority === filters.priority) &&
      (!filters.status || task.status === filters.status) &&
      (!filters.date || task.dueDate === filters.date)
    );
  });

  const resetFilters = () => {
    setFilters({ priority: '', status: '', date: '' });
  };

  return (
    <div className="main-container">
      {/* LEFT - To-Do App */}
      <div className="todo-app">
        <div className="header">
          <h2>To-Do</h2>
          <span>{new Date().toLocaleDateString()}</span>
          <button onClick={() => setShowForm(!showForm)}>+ Add Task</button>
        </div>

        {showForm && (
          <div className="form">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Title" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <button onClick={saveTask}>Save Task</button>
          </div>
        )}

        {/* Filters */}
        <div className="filter-section">
          <h4>Filter Tasks</h4>
          <div className="filters">
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        </div>

        {/* Task List */}
        <div id="todo-tasks">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-row ${task.status.replace(/\s+/g, '-').toLowerCase()} ${task.priority.toLowerCase()}-priority`}
            >
              <div>
                <div className="task-title">{task.title}</div>
                <div className="task-date">Due: {task.dueDate}</div>
                <div className="badges">
                  <span className={`badge status-badge ${task.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {task.status}
                  </span>
                  <span className={`badge priority-badge ${task.priority.toLowerCase()}`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              <div className="task-right">
                <button onClick={() => editTask(task.id)}>✏️</button>
                <button onClick={() => deleteTask(task.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="task-status">
          <h3>Task Status</h3>
          <div className="circular-bars">
            <div className="circle-container">
              <svg><circle cx="35" cy="35" r="30" className="bg" /><circle id="completed-bar" cx="35" cy="35" r="30" className="progress green" /></svg>
              <div className="label" id="completed-count">0%</div>
              <p>Completed</p>
            </div>
            <div className="circle-container">
              <svg><circle cx="35" cy="35" r="30" className="bg" /><circle id="progress-bar" cx="35" cy="35" r="30" className="progress blue" /></svg>
              <div className="label" id="progress-count">0%</div>
              <p>In Progress</p>
            </div>
            <div className="circle-container">
              <svg><circle cx="35" cy="35" r="30" className="bg" /><circle id="notstarted-bar" cx="35" cy="35" r="30" className="progress red" /></svg>
              <div className="label" id="notstarted-count">0%</div>
              <p>Not Started</p>
            </div>
          </div>
        </div>

        <div className="completed-tasks">
          <h3>Completed Tasks</h3>
          {tasks.filter(t => t.status === 'Completed').map(task => (
            <div key={task.id} className="task-row completed">
              <div>
                <div className="task-title">{task.title}</div>
                <div className="task-date">Due: {task.dueDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;
