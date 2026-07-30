import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ChevronDown } from "lucide-react";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "./ui/ThemeToggle";

const EASE = [0.16, 1, 0.3, 1] as const;

const NAV_LINKS = [
  { href: "/#platform", label: "Platform" },
  { href: "/#showcase", label: "Product Tour" },
  { href: "/#comparison", label: "Why Us" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function Nav() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-950/90"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Latticefi</span>
            <span className="text-[10px] font-medium tracking-wider text-indigo-600 uppercase dark:text-indigo-400">ISP OS</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {NAV_LINKS.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="relative px-3.5 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <div className="relative">
            <button
              onClick={() => setLoginOpen((s) => !s)}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log in <ChevronDown size={14} className={`transition-transform duration-200 ${loginOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {loginOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <a href="/admin" className="flex flex-col rounded-xl px-3.5 py-2.5 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                    <span className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">Admin Console</span>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">For network staff & engineers</span>
                  </a>
                  <a href="/portal" className="flex flex-col rounded-xl px-3.5 py-2.5 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                    <span className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">Customer Portal</span>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">For active subscribers</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.a
            href="/#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
          >
            Get Started
          </motion.a>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden dark:border-slate-800 dark:text-slate-200"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-b border-slate-200 bg-white px-4 py-6 shadow-xl lg:hidden dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {n.label}
                </a>
              ))}
              <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[14px] font-medium text-slate-500 dark:text-slate-400">Interface Theme</span>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
              <a href="/admin" className="rounded-xl px-4 py-3 text-[14px] font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900">
                Admin Console Login
              </a>
              <a href="/portal" className="rounded-xl px-4 py-3 text-[14px] font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900">
                Customer Portal Login
              </a>
              <a href="/#pricing" className="mt-2 rounded-xl bg-indigo-600 px-4 py-3 text-center text-[14px] font-semibold text-white shadow-md shadow-indigo-600/20">
                Start Free Trial
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
