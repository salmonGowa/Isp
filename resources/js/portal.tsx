import React from "react";
import { createRoot } from "react-dom/client";
import CustomerPortal from "./pages/CustomerPortal";

const container = document.getElementById("portal-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <CustomerPortal />
    </React.StrictMode>
  );
}
