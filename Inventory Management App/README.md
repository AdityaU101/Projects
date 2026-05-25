<div align="center">

# 📦 Inventory Management App

**A Firebase-backed inventory tracker with Google authentication, real-time Firestore sync, and CSV export. Manage items, categories, suppliers, and transactions from a clean React dashboard.**

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 👋 About This Project

Inventory Management App is a single-page React application that uses **Firebase** as its full backend: Firestore for the database, Firebase Auth for Google Sign-In, and Firebase Storage for file uploads. It gives small teams a fast way to track stock items, categorize products, manage suppliers, and log transactions without standing up a dedicated server.

---

## ✨ Features

- **Google Sign-In** via Firebase Auth with protected routes
- **Dashboard** with an overview of inventory health at a glance
- **Items** to add, update, and delete stock with category and supplier links
- **Categories** to organize items into custom groups
- **Suppliers** directory for vendor management
- **Transactions** to log stock movements (in/out)
- **CSV export** to download any data table as a `.csv` file
- **Settings** for account and app configuration
- Real-time Firestore sync so changes appear instantly across sessions

---

## 🛠️ Tech Stack

`React 18` `Vite` `React Router v6` `Firebase (Auth, Firestore, Storage)`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore, Auth (Google provider), and Storage enabled

### 1. Configure Environment

```bash
cd inventory
cp .env.example .env
```

Fill in your Firebase project credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 2. Install and Run

```bash
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 📂 Project Structure

```
Inventory Management App/
└── inventory/
    └── src/
        ├── App.jsx
        ├── firebase.js               # Firebase init & auth helpers
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Items.jsx
        │   ├── Categories.jsx
        │   ├── Suppliers.jsx
        │   ├── Transactions.jsx
        │   └── Settings.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx    # Auth guard
        └── services/
            ├── firestore.js          # Firestore CRUD helpers
            ├── storage.js            # Firebase Storage helpers
            └── csv.js                # CSV export utility
```
