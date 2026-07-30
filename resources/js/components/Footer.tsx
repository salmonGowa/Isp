import { Link } from "react-router";
import { Zap, Server } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Platform Overview", href: "/#platform" },
      { label: "Product Tour", href: "/#showcase" },
      { label: "Pricing Plans", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Access Portals",
    links: [
      { label: "Admin Console", href: "/admin" },
      { label: "Customer Portal", href: "/portal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Latticefi", href: "#" },
      { label: "System Status", href: "#" },
      { label: "Contact Engineering", href: "/contact", internal: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/50 px-4 py-16 sm:px-6 dark:border-slate-800/80 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <Zap size={16} strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">Latticefi</span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
              The high-performance operating system built domain-first for modern internet service providers and fiber carriers.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[12px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">{col.title}</div>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {"internal" in l && l.internal ? (
                      <Link to={l.href} className="text-[14px] font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="text-[14px] font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 sm:flex-row dark:border-slate-800/80">
          <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Latticefi Inc. All rights reserved.</span>
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
            <Server size={14} /> Domain-driven backend, multi-tenant ready from day one.
          </div>
        </div>
      </div>
    </footer>
  );
}
