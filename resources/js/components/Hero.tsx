import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Wifi, ArrowRight } from "lucide-react";

const STATS = [
  { value: "4,812+", label: "Active Subscribers" },
  { value: "99.97%", label: "Network Uptime" },
  { value: "160+", label: "Coverage Zones" },
  { value: "24/7", label: "NOC Monitoring" },
];

export default function Hero() {
  const [address, setAddress] = useState("");
  const [devices, setDevices] = useState(3);
  const [date, setDate] = useState("");
  const [flexible, setFlexible] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 65,
        damping: 16,
        mass: 0.8,
      },
    },
  };

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-950 selection:bg-indigo-500/30">
      {/* Background: dot grid + soft gradient glow, matching the rest of the site */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute inset-0 [background-image:radial-gradient(circle,theme(colors.slate.700)_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
        <motion.div
          className="absolute top-1/4 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/25 via-violet-600/15 to-emerald-500/10 blur-[130px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-28 pb-14"
      >
        <div className="mb-10 space-y-4 text-center">
          <motion.h1
            variants={itemVariants}
            className="text-4xl leading-[1.1] font-black tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-7xl"
          >
            Check coverage.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text font-black tracking-tighter text-transparent">
              Get connected
            </span>
            <br />
            in days, not weeks.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-xl text-sm leading-relaxed font-medium tracking-tight text-slate-300/90 sm:text-base"
          >
            Enter your address to see live plan availability, indicative install dates, and
            transparent pricing for your zone — powered by the same network data our NOC
            watches in real time.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur-md sm:p-7 dark:bg-slate-900/95"
        >
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <label className="mb-1.5 block text-[11px] font-black tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Service address
              </label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Muthaiga Grove, Nairobi"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pr-4 pl-9 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-black tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Preferred install date
              </label>
              <div className="relative">
                <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pr-3 pl-9 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-black tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Devices to connect
              </label>
              <div className="flex h-[46px] items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-800/50">
                <div className="flex shrink-0 items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Wifi className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{devices}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDevices(Math.max(1, devices - 1))}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-slate-200/60 font-black text-slate-700 transition-all hover:bg-indigo-600 hover:text-white dark:bg-slate-700/60 dark:text-slate-300"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevices(devices + 1)}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-slate-200/60 font-black text-slate-700 transition-all hover:bg-indigo-600 hover:text-white dark:bg-slate-700/60 dark:text-slate-300"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-2.5 select-none">
            <button
              type="button"
              onClick={() => setFlexible(!flexible)}
              className={`relative h-4 w-8 cursor-pointer rounded-full transition-colors ${flexible ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-xs transition-transform ${flexible ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              My install date is flexible
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full cursor-pointer rounded-xl bg-indigo-600 py-4 text-xs font-black tracking-wider text-white uppercase shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
          >
            Check availability {address ? `at ${address}` : "in your area"}
            <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md">
              <div className="font-mono text-xl font-black tracking-tight text-indigo-400 md:text-2xl">{s.value}</div>
              <div className="mt-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1 select-none">
        <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
