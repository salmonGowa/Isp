import React from "react";
import { motion } from "framer-motion";
import {
  Zap, Radio, Server, Router as RouterIcon, Cable, Home, Wifi, Gauge,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ============================== hero: full network topology ==============================
   A self-contained, animated "network map" — connection lines draw themselves in,
   small packets travel the links, and the core node pulses. Built entirely from
   SVG + HTML so there's no external image/licensing dependency, and it's genuinely
   representative of what the platform actually monitors (nodes, status, load). */

const VIEW_W = 800;
const VIEW_H = 500;

const HUB = { x: 400, y: 250 };

const NODES = [
  { id: "tower", x: 150, y: 110, label: "Tower — Ngong", icon: Radio, status: "online" as const },
  { id: "olt", x: 650, y: 90, label: "OLT — Kilimani", icon: Server, status: "online" as const },
  { id: "core", x: 90, y: 330, label: "Core Router", icon: RouterIcon, status: "online" as const },
  { id: "switch", x: 710, y: 340, label: "Switch — Muthaiga", icon: Cable, status: "degraded" as const },
  { id: "home1", x: 270, y: 430, label: "Subscriber", icon: Home, status: "online" as const },
  { id: "home2", x: 540, y: 430, label: "Subscriber", icon: Home, status: "online" as const },
];

const PACKET_LINKS = [NODES[1], NODES[3], NODES[4]];

const STATUS_DOT: Record<string, string> = {
  online: "bg-emerald-500",
  degraded: "bg-amber-500",
};

function pct(x: number, y: number) {
  return { left: `${(x / VIEW_W) * 100}%`, top: `${(y / VIEW_H) * 100}%` };
}

export function NetworkTopologyArt() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-4 shadow-2xl shadow-slate-900/10 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 dark:shadow-black/40">
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="netLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {NODES.map((n, i) => (
          <motion.line
            key={n.id}
            x1={HUB.x}
            y1={HUB.y}
            x2={n.x}
            y2={n.y}
            stroke="url(#netLine)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: i * 0.12, ease: EASE }}
          />
        ))}

        {PACKET_LINKS.map((n, i) => (
          <motion.circle
            key={`packet-${n.id}`}
            r={4}
            fill={n.status === "degraded" ? "#f59e0b" : "#34d399"}
            initial={{ cx: HUB.x, cy: HUB.y, opacity: 0 }}
            animate={{ cx: [HUB.x, n.x, HUB.x], cy: [HUB.y, n.y, HUB.y], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, delay: 1 + i * 0.9, repeat: Infinity, repeatDelay: 0.4, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* satellite node badges */}
      {NODES.map((n, i) => (
        <motion.div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={pct(n.x, n.y)}
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.08, y: -2 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: EASE }}
        >
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT[n.status]}`} />
            <n.icon size={12} className="flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10.5px] font-semibold whitespace-nowrap text-slate-700 dark:text-slate-200">{n.label}</span>
          </div>
        </motion.div>
      ))}

      {/* core hub */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(HUB.x, HUB.y)}>
        <div className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
          <motion.span
            className="absolute inset-0 rounded-2xl border-2 border-indigo-400/60"
            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-0 rounded-2xl border-2 border-indigo-400/60"
            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
          />
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
            <Zap size={22} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== showcase: fleet grid (admin tab) ============================== */

const FLEET_NODES = [
  { id: "n1", label: "OLT-Ngong-04", status: "offline" as const, load: 0 },
  { id: "n2", label: "core-nbo-02", status: "degraded" as const, load: 88 },
  { id: "n3", label: "OLT-Kilimani-01", status: "online" as const, load: 61 },
  { id: "n4", label: "OLT-Karen-02", status: "online" as const, load: 44 },
  { id: "n5", label: "tower-westlands-1", status: "online" as const, load: 52 },
  { id: "n6", label: "sw-muthaiga-3", status: "online" as const, load: 38 },
];

const FLEET_STATUS_BAR: Record<string, string> = {
  online: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-rose-500",
};

export function FleetGridArt() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">Fleet health</span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 4 online
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-amber-500" /> 1 degraded
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-rose-500" /> 1 offline
        </span>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {FLEET_NODES.map((n) => (
          <motion.div
            key={n.id}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -3 }}
            className={`rounded-xl border p-3 ${n.status === "offline" ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-500/10" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"}`}
          >
            <div className="flex items-center justify-between">
              <Server size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span className={`h-1.5 w-1.5 rounded-full ${FLEET_STATUS_BAR[n.status]}`} />
            </div>
            <div className="mt-2 truncate text-[10.5px] font-semibold text-slate-700 dark:text-slate-200">{n.label}</div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                initial={{ width: 0 }}
                whileInView={{ width: `${n.load}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ============================== showcase: single connection (portal tab) ============================== */

export function HomeSignalArt() {
  const bars = [8, 14, 10, 18, 12, 20, 9];
  return (
    <div className="flex flex-col items-center justify-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Radio size={20} />
          </div>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Tower</span>
        </div>

        <svg width="90" height="24" viewBox="0 0 90 24" className="overflow-visible">
          <motion.line
            x1="0" y1="12" x2="90" y2="12"
            stroke="#6366f1" strokeWidth="2" strokeDasharray="6 5"
            animate={{ strokeDashoffset: [0, -22] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <Home size={22} />
          </div>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">You</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full bg-emerald-500"
            style={{ height: h }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            <Wifi size={15} className="text-indigo-500" /> 487
          </div>
          <div className="text-[10.5px] text-slate-400 dark:text-slate-500">Mbps down</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            <Gauge size={15} className="text-emerald-500" /> 8ms
          </div>
          <div className="text-[10.5px] text-slate-400 dark:text-slate-500">Latency</div>
        </div>
      </div>
    </div>
  );
}
