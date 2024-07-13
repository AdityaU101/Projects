import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Bank } from "./components/Bank.tsx";
import { Managers } from "./components/Managers.tsx";
import { Branch } from "./components/Branch.tsx";
import { Customers } from "./components/Customers.tsx";
import { Loan } from "./components/Loan.tsx";
import Payment from "./components/Payment.tsx";
import Dashboard from "./components/Dashboard.tsx";
import Approve from "./components/Approve.tsx";
import LoanSummary from "./components/LoanSummary.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "/bank",
        element: <Bank />,
      },
      {
        path: "/managers",
        element: <Managers />,
      },
      {
        path: "/branch",
        element: <Branch />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/loan",
        element: <Loan />,
      },
      {
        path: "/payment",
        element: <Payment />,
      },
      {
        path: "/approve",
        element: <Approve />,
      },
      {
        path: "/loan/:id",
        element: <LoanSummary />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
