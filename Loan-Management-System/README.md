<div align="center">

# 💰 Loan Management System

**A full-stack web application for end-to-end loan lifecycle management, covering banks, branches, customers, loans, payments, and approvals through a clean React dashboard backed by a Node.js/MySQL API.**

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)

</div>

---

## 👋 About This Project

Loan Management System is a database-backed CRUD application modeling the full lifecycle of a loan product. Built as part of a database systems course, it demonstrates relational schema design, normalized SQL queries, and a REST API serving a multi-page React frontend.

---

## ✨ Features

- **Dashboard** with aggregate stats via a `Dashboard_Stats` SQL view
- **Bank & Branch management** with create, view, and delete operations
- **Customer management** with full CRUD for borrower profiles
- **Loan management** to issue loans with amount, interest rate, term, and branch association
- **Payment tracking** to record and delete repayments against open loans
- **Loan approval workflow** with a dedicated approve/reject screen
- **Loan officer management** to assign managers to branches
- Reusable form and table components styled with Tailwind

---

## 🛠️ Tech Stack

**Frontend**  
`React 18` `TypeScript` `Vite` `Tailwind CSS` `React Router v6` `Axios`

**Backend**  
`Node.js` `Express.js` `MySQL`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+ running locally

### 1. Set Up the Database

Run the SQL scripts in `queries/` against your MySQL instance:

```bash
mysql -u root -p < queries/table-creation.txt
mysql -u root -p < queries/final.txt
```

### 2. Configure the Backend

Update the MySQL connection credentials in `server/database/`, then:

```bash
cd server
npm install
node index.js
# API runs on http://localhost:5000
```

### 3. Start the Frontend

```bash
cd client
npm install
npm run dev
# UI runs on http://localhost:5173
```

---

## 📂 Project Structure

```
Loan-Management-System/
├── server/
│   ├── index.js              # Express routes for all entities
│   └── database/
│       └── queries.js        # MySQL connection + query helpers
├── client/
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── Dashboard.tsx
│           ├── Bank.tsx / Branch.tsx
│           ├── Customers.tsx
│           ├── Loan.tsx / LoanSummary.tsx
│           ├── Payment.tsx
│           ├── Approve.tsx
│           ├── Managers.tsx
│           ├── Status.tsx
│           └── Reusable/     # Form, Table, Select, Notification
└── queries/
    ├── table-creation.txt    # DDL: schema creation
    └── final.txt             # DML: views and seed queries
```

---

## 🗃️ Database Schema

Core entities: `Bank`, `Branch`, `Customer`, `Loan`, `Loan_Officer`, `Payment`, `Loan_Customer_Mapping`

Foreign keys enforce cascading deletes throughout the hierarchy: `Bank -> Branch -> Loan`.
