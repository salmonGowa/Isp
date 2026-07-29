import React from "react";
import { createRoot } from "react-dom/client";
import Landing from "./pages/Landing";

const container = document.getElementById("landing-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <Landing />
    </React.StrictMode>
  );
}
