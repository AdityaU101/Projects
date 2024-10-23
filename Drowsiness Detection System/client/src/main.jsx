import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import DrowsinessAnalysis from "./components/DrowsinessAnalysis";
import DrowsinessDetector from "./components/DrowsinessDetector";
import Search from "./components/Search";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Search />,
      },
      {
        path: "/watch",
        element: <DrowsinessDetector />,
      },
      {
        path: "/analysis",
        element: <DrowsinessAnalysis />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
