import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  X, ArrowRight, Users, CreditCard, Router, MessageSquare, Wrench,
  Package, BarChart3, ShieldCheck, Check, Plus,
  Sparkles, Play, Activity, Globe, Lock, Cpu,
} from "lucide-react";
import { ToggleSwitch } from "../components/ui/primitives";
import { NetworkTopologyArt, FleetGridArt, HomeSignalArt } from "../components/marketing/NetworkArt";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

/* ============================== copy / data ============================== */

const STATS = [
  { value: 3000, suffix: "+", label: "Subscribers managed per instance" },
  { value: 99.97, suffix: "%", label: "Real-time network uptime tracked", decimals: 2 },
  { value: 8, suffix: " domains", label: "Billing, network, support unified" },
  { value: 100, suffix: "%", label: "Tenant-scoped architecture" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Subscriber Lifecycle Engine",
    desc: "Full CRUD provisioning, dynamic plan allocation, service zone mapping, and automated status triggers — active, suspended, or overdue, perfectly synchronized.",
    badge: "Core Automation"
  },
  {
    icon: CreditCard,
    title: "Autonomous Billing & Gateways",
    desc: "Automated recurring invoice generation and instant manual or gateway payment recording. Plug straight into Stripe, M-Pesa, or custom financial rails.",
    badge: "Flexible Rails"
  },
  {
    icon: Router,
    title: "Advanced RADIUS & Network Ops",
    desc: "Monitor OLTs, core routers, towers, and switches with live metrics. Automatically trigger RADIUS authorization, deprovisioning, and bandwidth shaping.",
    badge: "Network Control"
  },
  {
    icon: MessageSquare,
    title: "SLA-Driven Support Queues",
    desc: "Multi-tier priority routing, automated SLA countdown timers, and smart technician assignments ensure zero customer issues fall through the cracks.",
    badge: "Helpdesk"
  },
  {
    icon: Wrench,
    title: "Field Technician Dispatch",
    desc: "Assign work orders instantly, track active site installations or repairs on the go, and streamline site logs straight from mobile devices.",
    badge: "Operations"
  },
  {
    icon: Package,
    title: "Instant Plan Packaging",
    desc: "Design, deploy, or archive custom bandwidth speeds, data caps, and recurring pricing tiers in seconds without writing code.",
    badge: "Agility"
  },
  {
    icon: BarChart3,
    title: "Deep Financial Telemetry",
    desc: "Comprehensive visibility into MRR, churn rates, regional expansion metrics, and collection performance built for management reporting.",
    badge: "Analytics"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Multi-Tenancy",
    desc: "Every database table is tenant-scoped natively from migration zero, enabling effortless scaling from a regional WISP to a nationwide white-label carrier.",
    badge: "Security"
  },
];

const INTEGRATIONS = ["Stripe", "M-Pesa", "FreeRADIUS", "Redis", "MySQL", "Reverb"];

const COMPARISON = [
  { before: "Subscriber status tracked across messy manual spreadsheets", after: "Live status management with auto-suspend/reactivate triggers" },
  { before: "Payments verified manually via frantic phone calls and texts", after: "Instant gateway confirmation logged straight to target invoices" },
  { before: "Blind to infrastructure outages until angry customers call", after: "Real-time node health metrics with instant failure telemetry" },
  { before: "Shared administrative logins creating security risks", after: "Granular role-scoped staff accounts and isolated client portals" },
];

const PRICING = [
  {
    name: "Starter",
    tagline: "For growing regional WISPs seeking structure",
    monthly: 49,
    annual: 39,
    cap: "Up to 500 subscribers",
    features: ["Subscriber & plan management", "Manual billing & invoicing", "Support ticketing queues", "Standard email support"],
  },
  {
    name: "Growth",
    tagline: "For ambitious fiber & wireless operators scaling fast",
    monthly: 149,
    annual: 119,
    cap: "Up to 5,000 subscribers",
    features: ["Everything in Starter", "Advanced network monitoring & RADIUS", "Automated non-payment suspension", "Field ops & work order dispatch", "Priority technical support"],
    highlight: true,
  },
  {
    name: "Scale",
    tagline: "For multi-region operations & white-label networks",
    monthly: 399,
    annual: 329,
    cap: "Unlimited subscribers",
    features: ["Everything in Growth", "Full multi-tenant data isolation", "Custom payment gateway hooks", "Dedicated migration engineer & SLA"],
  },
];

const FAQS = [
  {
    q: "Do I need FreeRADIUS up and running immediately to start?",
    a: "Not at all. Network provisioning relies on a safe abstraction contract with an operational no-op default. You can launch Latticefi today and wire up your FreeRADIUS backend whenever your infrastructure requires it.",
  },
  {
    q: "Can I integrate custom local mobile money gateways or Stripe?",
    a: "Yes. The billing engine is decoupled from specific vendors through a clean payment gateway interface. Manual tracking works instantly, and implementing new rails requires just a single contract implementation.",
  },
  {
    q: "Is the platform genuinely multi-tenant ready?",
    a: "Every core database table includes a dedicated tenant scope column from migration zero. Operating single-tenant today transitions to multi-tenant scaling through simple environment configuration.",
  },
  {
    q: "How does the system handle overdue subscriber accounts?",
    a: "Automated background jobs flag past-due accounts, initiate grace periods, and seamlessly restrict RADIUS session access until payment clearance reactivates service instantly.",
  },
  {
    q: "Are staff accounts and customer portals safely separated?",
    a: "Yes. Staff operators and client subscribers run on completely independent authentication guards, ensuring complete operational privacy and security.",
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

/* ============================== hero ============================== */

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 pb-24 sm:px-6 sm:pt-20 sm:pb-36">
      {/* Background gradients and mesh pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle,theme(colors.slate.300)_1px,transparent_1px)] [background-size:32px_32px] opacity-50 dark:[background-image:radial-gradient(circle,theme(colors.slate.800)_1px,transparent_1px)] dark:opacity-40" />
      <motion.div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-emerald-400/10 blur-[120px]"
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-[13px] font-semibold text-indigo-700 shadow-sm backdrop-blur-md dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
        >
          <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>Engineered exclusively for modern WISPs & fiber networks</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
          className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-slate-50 leading-[1.1]"
        >
          Orchestrate your entire ISP <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">
            from a single control plane.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 sm:text-xl dark:text-slate-400 font-normal leading-relaxed"
        >
          Latticefi unifies subscriber lifecycle operations, automated recurring billing, RADIUS infrastructure telemetry, and priority helpdesks into one blisteringly fast platform. Stop juggling spreadsheets and fragmented software.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-[15px] font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            Start 14-Day Free Trial <ArrowRight size={18} />
          </motion.a>
          <motion.a
            href="/admin"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md px-8 py-4 text-[15px] font-bold text-slate-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-indigo-500"
          >
            <Play size={16} className="text-indigo-600 dark:text-indigo-400" /> Explore Interactive Demo
          </motion.a>
        </motion.div>
      </div>

      {/* Network Topology Visual Banner */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        className="relative mx-auto mt-20 max-w-5xl rounded-3xl border border-slate-200/80 bg-slate-900/5 p-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/40 shadow-2xl"
      >
        <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-[12px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Node Mesh Operational
        </div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <NetworkTopologyArt />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ============================== stats ============================== */

function Stats() {
  return (
    <section className="border-y border-slate-200/80 bg-slate-50/70 px-4 py-16 sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/30">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4"
      >
        {STATS.map((s) => (
          <motion.div variants={staggerItem} key={s.label} className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <div className="text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-slate-100 tracking-tight">
              <StatValue value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="mt-2 text-[13.5px] font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <Reveal delay={0.2} className="mx-auto mt-16 max-w-4xl text-center">
        <div className="text-[12px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">Native integrations with your core stack</div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {INTEGRATIONS.map((name) => (
            <span
              key={name}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
    <section id="platform" className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[13px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
            <Cpu size={14} /> Domain-Driven Architecture
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            Everything your operations team needs, natively connected
          </h2>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
            Eliminate friction between your billing desk, field technicians, and network engineers. Eight specialized modules engineered into one single source of truth.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400 shadow-inner"
                  >
                    <f.icon size={22} />
                  </motion.div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {f.badge}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                <span>Learn platform mechanics</span>
                <ArrowRight size={14} />
              </div>
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
      title: "The Ultimate Mission Control for ISP Ops",
      desc: "Instant visibility into fleet health, active subscriber pipelines, automated invoice reconciliations, and ticket triage queues built for engineers on call.",
      points: ["Real-time node telemetry & alerts", "Complete subscriber lifecycle management", "Granular role-scoped staff permissions"],
      Art: FleetGridArt,
    },
    portal: {
      title: "A Client Portal Your Customers Will Love",
      desc: "Empower subscribers to monitor bandwidth consumption, settle invoices through integrated payment gateways, and manage Wi-Fi devices without calling support.",
      points: ["Live connection bandwidth metrics", "Frictionless invoice payments & history", "Integrated self-service support ticketing"],
      Art: HomeSignalArt,
    },
  } as const;

  const active = panels[tab];

  return (
    <section id="showcase" className="bg-slate-50/80 px-4 py-28 sm:px-6 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[13px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
            <Globe size={14} /> Dual-Experience Platform
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            Tailored apps for staff and subscribers
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 flex w-fit gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {(["admin", "portal"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="relative rounded-xl px-6 py-3 text-[14.5px] font-bold transition-colors"
            >
              {tab === key && (
                <motion.span
                  layoutId="showcase-tab"
                  className="absolute inset-0 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/25"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${tab === key ? "text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"}`}>
                {key === "admin" ? "Admin Console" : "Customer Portal"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + "-text"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="order-2 lg:order-1"
            >
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{active.title}</h3>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{active.desc}</p>
              <ul className="mt-8 flex flex-col gap-4">
                {active.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px] font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab + "-art"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="order-1 lg:order-2 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-xl dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl"
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
    <section id="comparison" className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[13px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
            <Activity size={14} /> The Evolution
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            From fragile duct-tape tools to an enterprise system of record
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 flex flex-col gap-4"
        >
          {COMPARISON.map((row) => (
            <motion.div
              variants={staggerItem}
              key={row.before}
              className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200/80 bg-white p-2 sm:grid-cols-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 shadow-sm">
                  <X size={15} strokeWidth={2.5} />
                </span>
                <span className="text-[14.5px] font-medium text-slate-500 dark:text-slate-400">{row.before}</span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-emerald-50/70 p-5 dark:bg-emerald-500/10">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                  <Check size={15} strokeWidth={3} />
                </span>
                <span className="text-[14.5px] font-bold text-slate-900 dark:text-slate-100">{row.after}</span>
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
    <section id="pricing" className="bg-slate-50/80 px-4 py-28 sm:px-6 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[13px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
            <Lock size={14} /> Transparent Scaling
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            Predictable pricing that scales alongside your network
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-[14.5px] font-bold ${!annual ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>Monthly billing</span>
            <ToggleSwitch on={annual} onChange={setAnnual} />
            <span className={`text-[14.5px] font-bold ${annual ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
              Annual billing <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold ml-1">Save ~20%</span>
            </span>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {PRICING.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                tier.highlight
                  ? "border-indigo-300 bg-white shadow-2xl shadow-indigo-500/15 dark:border-indigo-500/50 dark:bg-slate-900 ring-2 ring-indigo-600/20"
                  : "border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1 text-[11.5px] font-extrabold text-white shadow-md shadow-indigo-600/30">
                  MOST POPULAR CHOICE
                </span>
              )}
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{tier.name}</h3>
              <p className="mt-2 text-[14px] text-slate-500 dark:text-slate-400">{tier.tagline}</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-100">${annual ? tier.annual : tier.monthly}</span>
                <span className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">/month</span>
              </div>
              <div className="mt-2 inline-block rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-[13px] font-bold text-indigo-600 dark:text-indigo-400 w-fit">
                {tier.cap}
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                    <Check size={16} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`mt-10 inline-flex items-center justify-center rounded-2xl px-6 py-4 text-[14.5px] font-bold transition shadow-md ${
                  tier.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30"
                    : "border border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                Get Started with {tier.name}
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
    <div className="border-b border-slate-200/80 py-2 dark:border-slate-800/80">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left group">
        <span className="pr-4 text-base font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-sm"
        >
          <Plus size={16} />
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
            <p className="pb-5 pr-8 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[13px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
            Support Hub
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">Frequently Asked Questions</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
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
    <section className="px-4 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 px-8 py-20 text-center shadow-2xl relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.3),transparent_50%)] pointer-events-none" />
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
          Ready to modernize your ISP operations?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-indigo-100/80 font-normal">
          Spin up your instance, seed your bandwidth plans, and experience total network visibility by this afternoon.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-[15px] font-bold text-slate-900 shadow-xl transition hover:bg-slate-100"
          >
            Start 14-Day Free Trial <ArrowRight size={18} />
          </motion.a>
          <motion.a
            href="/admin"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-[15px] font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <Play size={16} /> View Interactive Demo
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-600 selection:text-white">
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