import React from "react";
import { createRoot } from "react-dom/client";
import HotspotPortal from "./pages/HotspotPortal";

const container = document.getElementById("hotspot-root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <HotspotPortal />
    </React.StrictMode>
  );
}
