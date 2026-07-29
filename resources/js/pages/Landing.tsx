import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Zap, Menu, X, ArrowRight, Users, CreditCard, Router, MessageSquare, Wrench,
  Package, BarChart3, ShieldCheck, Check, ChevronDown, Plus, Server,
  Sparkles, Play,
} from "lucide-react";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { ToggleSwitch } from "../components/ui/primitives";
import { NetworkTopologyArt, FleetGridArt, HomeSignalArt } from "../components/marketing/NetworkArt";

/* ============================== copy / data ============================== */

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#showcase", label: "Product" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const STATS = [
  { value: 3000, suffix: "+", label: "subscribers managed per instance" },
  { value: 99.97, suffix: "%", label: "network uptime tracked in real time", decimals: 2 },
  { value: 8, suffix: " domains", label: "billing, network, support & more, unified" },
  { value: 100, suffix: "%", label: "tenant-scoped from the first migration" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Subscriber management",
    desc: "Full lifecycle CRUD, plan assignment, service zones, and status automation — active, suspended, overdue, always in sync.",
  },
  {
    icon: CreditCard,
    title: "Billing & invoicing",
    desc: "Recurring invoice generation and manual payment recording behind a clean payment-gateway contract — plug in Stripe, mobile money, or your own rails without touching core code.",
  },
  {
    icon: Router,
    title: "Network & RADIUS",
    desc: "Track OLTs, routers, towers, and switches with live status and load. Built to provision and deprovision RADIUS access automatically on activation and suspension.",
  },
  {
    icon: MessageSquare,
    title: "Support ticketing",
    desc: "Priority queues, SLA timers, and assignment to the right technician — so nothing about a subscriber's issue falls through the cracks.",
  },
  {
    icon: Wrench,
    title: "Field operations",
    desc: "Dispatch technicians, track installs and repairs, and keep work orders moving from request to completion.",
  },
  {
    icon: Package,
    title: "Plans & pricing control",
    desc: "Create, price, and archive service tiers in minutes — no code changes, no waiting on engineering.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    desc: "Revenue, churn, and zone-by-zone growth in one view, always current, exportable when you need to report up.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-tenant ready",
    desc: "Every core table is tenant-scoped from day one. Grow from a single ISP to a white-labeled platform without a schema rewrite.",
  },
];

const INTEGRATIONS = ["Stripe", "M-Pesa", "FreeRADIUS", "Redis", "MySQL", "Reverb"];

const COMPARISON = [
  { before: "Subscriber status tracked in a spreadsheet", after: "Live status with automatic suspend/reactivate on payment" },
  { before: "Payments confirmed over phone calls", after: "Manual or gateway payments recorded straight to the invoice" },
  { before: "No idea a node is down until a customer calls", after: "Live network health with uptime and load per node" },
  { before: "One shared login for the whole team", after: "Role-scoped staff accounts and a dedicated subscriber portal" },
];

const PRICING = [
  {
    name: "Starter",
    tagline: "For WISPs getting organized",
    monthly: 49,
    annual: 39,
    cap: "Up to 500 subscribers",
    features: ["Subscriber & plan management", "Manual billing & invoicing", "Support ticketing", "Email support"],
  },
  {
    name: "Growth",
    tagline: "For fiber & wireless ISPs scaling up",
    monthly: 149,
    annual: 119,
    cap: "Up to 5,000 subscribers",
    features: ["Everything in Starter", "Network monitoring & RADIUS hooks", "Automated suspend-on-nonpayment", "Field ops & work orders", "Priority support"],
    highlight: true,
  },
  {
    name: "Scale",
    tagline: "For multi-region & white-label operators",
    monthly: 399,
    annual: 329,
    cap: "Unlimited subscribers",
    features: ["Everything in Growth", "Full multi-tenant isolation", "Custom payment gateway integration", "Dedicated onboarding & support"],
  },
];

const FAQS = [
  {
    q: "Do I need FreeRADIUS running to get started?",
    a: "No. Network provisioning sits behind a contract with a safe no-op default, so you can run Latticefi today and wire up a real FreeRADIUS deployment whenever you're ready — nothing else changes.",
  },
  {
    q: "Can I use my own payment gateway?",
    a: "Yes. Billing is built against a payment-gateway interface, not a specific provider. Manual payment recording works out of the box, and swapping in Stripe or a local mobile-money gateway is a matter of implementing one contract.",
  },
  {
    q: "Is this actually multi-tenant?",
    a: "It's tenant-ready from the first migration — every core table carries a tenant column and a scope that isolates data automatically. Today it runs single-tenant; going multi-tenant later is a config change, not a rewrite.",
  },
  {
    q: "What happens when a subscriber misses a payment?",
    a: "A scheduled job marks overdue invoices and suspends subscribers past a configurable grace period — and reactivates them automatically the moment a payment is recorded.",
  },
  {
    q: "Can my team and my customers use the same login?",
    a: "No — staff and subscribers are deliberately separate accounts on separate guards, so a support agent's access never overlaps with a customer's self-service session.",
  },
];

/* ============================== motion helpers ============================== */

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children, delay = 0, className = "", y = 24,
}: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function StatValue({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 60 });
  const [display, setDisplay] = useState((0).toFixed(decimals));

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(v.toFixed(decimals)));
    return unsubscribe;
  }, [spring, decimals]);

  return (
    <motion.span
      className="tabular-nums"
      onViewportEnter={() => motionValue.set(value)}
      viewport={{ once: true }}
    >
      {display}{suffix}
    </motion.span>
  );
}

/* ============================== nav ============================== */

function Nav() {
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
      className={`sticky top-0 z-50 transition-colors ${
        scrolled
          ? "border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Zap size={17} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">Latticefi</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative px-3 py-2 text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {n.label}
              <span className="absolute inset-x-3 -bottom-px h-px scale-x-0 bg-indigo-500 transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <div className="relative">
            <button
              onClick={() => setLoginOpen((s) => !s)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13.5px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log in <ChevronDown size={14} className={`transition-transform ${loginOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {loginOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <a href="/admin" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Admin console</span>
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400">For staff & operations</span>
                  </a>
                  <a href="/portal" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Customer portal</span>
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400">For your subscribers</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            Get started
          </motion.a>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 lg:hidden dark:text-slate-200"
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
            className="overflow-hidden border-t border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {n.label}
                </a>
              ))}
              <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center justify-between px-3">
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Theme</span>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
              <a href="/admin" className="mt-2 rounded-lg px-3 py-2.5 text-[14px] font-semibold text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
                Admin console login
              </a>
              <a href="/portal" className="rounded-lg px-3 py-2.5 text-[14px] font-semibold text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
                Customer portal login
              </a>
              <a href="#pricing" className="mt-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-[14px] font-semibold text-white">
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ============================== hero ============================== */

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32">
      {/* background: dot grid + animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle,theme(colors.slate.300)_1px,transparent_1px)] [background-size:28px_28px] opacity-40 dark:[background-image:radial-gradient(circle,theme(colors.slate.700)_1px,transparent_1px)] dark:opacity-20" />
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/20"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/15"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[12.5px] font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
        >
          <Sparkles size={13} /> Built domain-first for ISPs that are outgrowing spreadsheets
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
          className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100"
        >
          Run your entire ISP<br className="hidden sm:block" /> from one platform.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400"
        >
          Latticefi unifies subscriber management, billing, network monitoring, and support
          into one fast, multi-tenant-ready platform — built so operations teams stop
          juggling spreadsheets, phone calls, and five different tools.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[14.5px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:w-auto"
          >
            Start free trial <ArrowRight size={16} />
          </motion.a>
          <motion.a
            href="/admin"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[14.5px] font-semibold text-slate-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-indigo-500"
          >
            <Play size={15} /> View live demo
          </motion.a>
        </motion.div>
      </div>

      {/* banner: animated network topology map — nodes, links, live "traffic" */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        className="relative mx-auto mt-16 max-w-4xl"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <NetworkTopologyArt />
        </motion.div>
        <div className="pointer-events-none absolute -inset-x-8 -bottom-8 h-24 bg-gradient-to-t from-white to-transparent dark:from-slate-950" />
      </motion.div>
    </section>
  );
}

/* ============================== stats ============================== */

function Stats() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 dark:border-slate-800 dark:bg-slate-900/40">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4"
      >
        {STATS.map((s) => (
          <motion.div variants={staggerItem} key={s.label} className="text-center">
            <div className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">
              <StatValue value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <Reveal delay={0.2} className="mx-auto mt-12 max-w-4xl text-center">
        <div className="text-[12px] font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">Designed to integrate with</div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {INTEGRATIONS.map((name) => (
            <span
              key={name}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============================== features ============================== */

function Features() {
  return (
    <section id="platform" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-[12.5px] font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">Platform</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Everything your ops team needs, actually connected
          </h2>
          <p className="mt-4 text-[15px] text-slate-600 dark:text-slate-400">
            No more swivel-chairing between a billing tool, a spreadsheet, and a group chat.
            One domain-driven backend, eight modules, one source of truth.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400"
              >
                <f.icon size={19} />
              </motion.div>
              <h3 className="mt-4 text-[15px] font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================== product showcase ============================== */

function Showcase() {
  const [tab, setTab] = useState<"admin" | "portal">("admin");

  const panels = {
    admin: {
      title: "Command center for your operations team",
      desc: "Subscribers, billing, network health, and the support queue in one dashboard — built for the people keeping the network up at 2am.",
      points: ["Live fleet health & alerts", "Full subscriber & invoice CRUD", "Role-scoped staff accounts"],
      Art: FleetGridArt,
    },
    portal: {
      title: "Self-service your customers actually enjoy",
      desc: "Connection status, usage, billing, and support — without a single phone call to your front desk.",
      points: ["Real-time connection & usage stats", "Pay invoices & manage Wi-Fi devices", "Submit and track support tickets"],
      Art: HomeSignalArt,
    },
  } as const;

  const active = panels[tab];

  return (
    <section id="showcase" className="bg-slate-50 px-4 py-24 sm:px-6 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-[12.5px] font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">Two apps, one platform</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Built for your team and your subscribers
          </h2>
        </Reveal>

        <div className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {(["admin", "portal"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="relative rounded-full px-5 py-2 text-[13.5px] font-semibold transition-colors"
            >
              {tab === key && (
                <motion.span
                  layoutId="showcase-tab"
                  className="absolute inset-0 rounded-full bg-indigo-600"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${tab === key ? "text-white" : "text-slate-600 dark:text-slate-300"}`}>
                {key === "admin" ? "Admin console" : "Customer portal"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + "-text"}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="order-2 lg:order-1"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{active.title}</h3>
              <p className="mt-3 text-[14.5px] text-slate-600 dark:text-slate-400">{active.desc}</p>
              <ul className="mt-6 flex flex-col gap-3">
                {active.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab + "-img"}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="order-1 lg:order-2"
            >
              <active.Art />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ============================== before/after ============================== */

function BeforeAfter() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-[12.5px] font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">Why teams switch</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            From duct tape to a real system of record
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 flex flex-col gap-3"
        >
          {COMPARISON.map((row) => (
            <motion.div
              variants={staggerItem}
              key={row.before}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-1.5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  <X size={13} strokeWidth={2.5} />
                </span>
                <span className="text-[13.5px] text-slate-500 dark:text-slate-400">{row.before}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-200">{row.after}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================== pricing ============================== */

function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="bg-slate-50 px-4 py-24 sm:px-6 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-[12.5px] font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">Pricing</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Simple pricing that scales with your network
          </h2>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`text-[13.5px] font-medium ${!annual ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>Monthly</span>
            <ToggleSwitch on={annual} onChange={setAnnual} />
            <span className={`text-[13.5px] font-medium ${annual ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
              Annual <span className="text-emerald-600 dark:text-emerald-400">(save ~20%)</span>
            </span>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {PRICING.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                tier.highlight
                  ? "border-indigo-300 bg-white shadow-xl shadow-indigo-500/10 dark:border-indigo-500/40 dark:bg-slate-900"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{tier.name}</h3>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{tier.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">${annual ? tier.annual : tier.monthly}</span>
                <span className="text-[13px] text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <div className="mt-1 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">{tier.cap}</div>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-700 dark:text-slate-300">
                    <Check size={15} className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`mt-7 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[13.5px] font-semibold transition ${
                  tier.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-slate-200 text-slate-800 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-100"
                }`}
              >
                Get started
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================== faq ============================== */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-1 dark:border-slate-800">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="pr-4 text-[14.5px] font-semibold text-slate-900 dark:text-slate-100">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        >
          <Plus size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-4 pr-8 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <div className="text-[12.5px] font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">FAQ</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Questions, answered</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== final cta ============================== */

function FinalCta() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-700 px-8 py-16 text-center dark:from-slate-950 dark:via-indigo-950 dark:to-indigo-800">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to modernize your ISP operations?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/70">
          Spin up your instance, seed it with your plans and subscribers, and see your whole
          network in one dashboard by this afternoon.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-[14.5px] font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 sm:w-auto"
          >
            Start free trial <ArrowRight size={16} />
          </motion.a>
          <motion.a
            href="/admin"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:bg-white/20 sm:w-auto"
          >
            <Play size={15} /> View live demo
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================== footer ============================== */

function Footer() {
  const columns = [
    { title: "Product", links: [{ label: "Platform", href: "#platform" }, { label: "Product tour", href: "#showcase" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }] },
    { title: "Access", links: [{ label: "Admin console", href: "/admin" }, { label: "Customer portal", href: "/portal" }] },
    { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
  ];

  return (
    <footer className="border-t border-slate-200 px-4 py-14 sm:px-6 dark:border-slate-800">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Zap size={15} strokeWidth={2.5} />
              </div>
              <span className="text-[14px] font-bold text-slate-900 dark:text-slate-100">Latticefi</span>
            </div>
            <p className="mt-3 text-[12.5px] text-slate-500 dark:text-slate-400">
              The operating platform for modern internet service providers.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-[11.5px] font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">{col.title}</div>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[13px] text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Latticefi. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
            <Server size={13} /> Built domain-first, tenant-ready from day one.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================== shell ============================== */

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <Showcase />
      <BeforeAfter />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
