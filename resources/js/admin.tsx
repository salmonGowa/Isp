import React from "react";
import { createRoot } from "react-dom/client";
import AdminPortal from "./pages/AdminPortal";

const container = document.getElementById("admin-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <AdminPortal />
    </React.StrictMode>
  );
}
