<div align="center">

# 📝 ToDo List App

**A clean, persistent React task manager with add, complete, and delete functionality. State is saved to `localStorage` so your tasks survive page refreshes.**

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

---

## 👋 About This Project

ToDo List is a React application demonstrating hooks-based state management (`useState`, `useEffect`) with `localStorage` persistence. Tasks are identified by `crypto.randomUUID()` so there are no ID collisions, and no backend is required. The app is structured into focused, single-responsibility components.

---

## ✨ Features

- Add tasks via a dedicated form component
- Toggle tasks complete/incomplete with a checkbox
- Delete individual tasks with a single click
- **Persistence** via `localStorage`: task list is saved and restored automatically on every load
- UUID-based task identity

---

## 🛠️ Tech Stack

`React 18` `Create React App` `JavaScript (ES6+)` `CSS3`

---

## 🚀 Getting Started

```bash
cd todo
npm install
npm start
# App runs on http://localhost:3000
```

---

## 📂 Project Structure

```
ToDo_List/
└── todo/
    └── src/
        ├── App.js          # Root state: todos array + add/toggle/delete handlers
        ├── NewTodoForm.js  # Controlled input form for adding tasks
        ├── TodoList.js     # Renders the list of TodoItem components
        ├── TodoItem.js     # Single task row: checkbox + title + delete button
        ├── App.css         # Global styles
        └── index.js        # React DOM entry point
```
