import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import Landing from "./pages/Landing";
import ContactPage from "./pages/ContactPage";

/**
 * Resets scroll position when navigating to a different route. Deliberately
 * keyed on pathname only (not hash) — same-page anchor links like /#pricing
 * still need the browser's native jump-to-element behavior, which this must
 * not fight with on every render.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (pathname !== previousPathname.current && !hash) {
      window.scrollTo(0, 0);
    }
    previousPathname.current = pathname;
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}
