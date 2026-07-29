import React, { useState, useMemo } from "react";
import {
  Wifi, Zap, CreditCard, MessageSquare, Bell, ChevronRight,
  Download, Upload, Activity, CheckCircle2, AlertCircle, Clock, Router,
  Smartphone, Laptop, Tv, Plus, X, Eye, EyeOff, Search, ArrowUpRight,
  Pause, Play, Gauge, FileText, ShieldCheck, User, LogOut, Home, Menu,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTheme, chartPalette } from "../lib/theme";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import {
  Card, CardHead, Eyebrow, Badge, Tone, PrimaryButton, IconButton,
  LinkButton, SearchInput, FieldLabel, FieldInput, FieldTextarea, ToggleSwitch,
  Modal, ProfileRow,
} from "../components/ui/primitives";

/* ---------------------------------- data ---------------------------------- */

const PLAN = {
  name: "Fiber 500",
  tagline: "Symmetrical fiber · Residential",
  down: 500,
  up: 500,
  price: 79.99,
  renewal: "Aug 14, 2026",
  address: "14 Muthaiga Grove, Nairobi",
};

const CONNECTION = {
  status: "online",
  uptimeDays: 14,
  download: 487,
  upload: 492,
  ping: 8,
  lastOutage: "12 days ago",
};

const USAGE_CAP_GB = 1000;
const USAGE_USED_GB = 812;

const DAILY_USAGE = [
  22, 31, 18, 40, 55, 62, 29, 34, 48, 51, 60, 33, 27, 45,
  58, 63, 41, 36, 50, 57, 62, 39, 28, 44, 49, 66, 71, 30, 19, 12,
].map((gb, i) => ({ day: i + 1, gb }));

const INVOICES = [
  { id: "INV-2607", date: "Jul 14, 2026", amount: 79.99, status: "due", dueDate: "Aug 14, 2026" },
  { id: "INV-2606", date: "Jun 14, 2026", amount: 79.99, status: "paid", dueDate: "Jul 14, 2026" },
  { id: "INV-2605", date: "May 14, 2026", amount: 79.99, status: "paid", dueDate: "Jun 14, 2026" },
  { id: "INV-2604", date: "Apr 14, 2026", amount: 74.99, status: "paid", dueDate: "May 14, 2026" },
  { id: "INV-2603", date: "Mar 14, 2026", amount: 74.99, status: "paid", dueDate: "Apr 14, 2026" },
  { id: "INV-2602", date: "Feb 14, 2026", amount: 74.99, status: "overdue-cleared", dueDate: "Mar 14, 2026" },
];

const INITIAL_TICKETS = [
  { id: "TCK-4471", subject: "Intermittent drops in the evening", status: "open", created: "Jul 26, 2026", updated: "2 hours ago" },
  { id: "TCK-4402", subject: "Static IP request for home office", status: "in-progress", created: "Jul 18, 2026", updated: "1 day ago" },
  { id: "TCK-4310", subject: "Router blinking orange after storm", status: "resolved", created: "Jun 30, 2026", updated: "Jun 30, 2026" },
];

const INITIAL_DEVICES = [
  { id: 1, name: "Living Room TV", type: "tv", ip: "192.168.1.14", since: "14 days", usedGB: 210, paused: false },
  { id: 2, name: "Amina's iPhone", type: "phone", ip: "192.168.1.22", since: "9 days", usedGB: 34, paused: false },
  { id: 3, name: "Office MacBook", type: "laptop", ip: "192.168.1.8", since: "14 days", usedGB: 128, paused: false },
  { id: 4, name: "Guest Tablet", type: "phone", ip: "192.168.1.41", since: "2 days", usedGB: 6, paused: true },
  { id: 5, name: "Living Room Router", type: "router", ip: "192.168.1.1", since: "14 days", usedGB: 0, paused: false },
];

const NAV = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "usage", label: "Usage", icon: Gauge },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "wifi", label: "Wi-Fi & devices", icon: Wifi },
  { key: "support", label: "Support", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: User },
];

/* --------------------------------- helpers --------------------------------- */

const fmtUSD = (n: number) => `$${n.toFixed(2)}`;

const STATUS_TONE: Record<string, Tone> = {
  paid: "success",
  due: "warning",
  "overdue-cleared": "neutral",
  open: "warning",
  "in-progress": "info",
  resolved: "success",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  due: "Due",
  "overdue-cleared": "Paid late",
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}

const deviceIcon: Record<string, any> = { tv: Tv, phone: Smartphone, laptop: Laptop, router: Router };

/* ---------------------------------- atoms ---------------------------------- */

function SignalPulse() {
  const bars = [6, 14, 9, 18, 11, 20, 8, 16, 12, 19, 7, 15];
  return (
    <div className="flex h-[22px] items-end gap-[3px]" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] animate-pulse rounded-sm bg-emerald-400"
          style={{ height: h, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

/* --------------------------------- sections --------------------------------- */

function Overview({
  tickets, invoices, goTo, openPay,
}: {
  tickets: typeof INITIAL_TICKETS;
  invoices: typeof INVOICES;
  goTo: (k: string) => void;
  openPay: (i: (typeof INVOICES)[number]) => void;
}) {
  const pct = Math.min(100, Math.round((USAGE_USED_GB / USAGE_CAP_GB) * 100));
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;
  const nextInvoice = invoices.find((i) => i.status === "due");

  return (
    <div className="flex flex-col gap-4">
      {/* Hero connection card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-700 p-6 text-white dark:from-slate-950 dark:via-indigo-950 dark:to-indigo-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11.5px] font-semibold tracking-wide text-white/55 uppercase">Connection status</div>
            <div className="my-1 flex items-center gap-2.5 text-xl font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.25)]" />
              All systems online
            </div>
            <div className="text-[13px] text-white/65">Uptime {CONNECTION.uptimeDays} days · last interruption {CONNECTION.lastOutage}</div>
          </div>
          <SignalPulse />
        </div>

        <div className="mt-5 grid grid-cols-2 items-center gap-4 sm:grid-cols-[auto_auto_auto_1fr]">
          <div className="flex items-center gap-2.5 text-white/90">
            <Download size={16} strokeWidth={2.25} />
            <div>
              <div className="text-xl font-semibold">{CONNECTION.download}<span className="ml-1 text-[11px] font-medium text-white/55">Mbps</span></div>
              <div className="text-[11.5px] text-white/55">Download</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-white/90">
            <Upload size={16} strokeWidth={2.25} />
            <div>
              <div className="text-xl font-semibold">{CONNECTION.upload}<span className="ml-1 text-[11px] font-medium text-white/55">Mbps</span></div>
              <div className="text-[11.5px] text-white/55">Upload</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-white/90">
            <Activity size={16} strokeWidth={2.25} />
            <div>
              <div className="text-xl font-semibold">{CONNECTION.ping}<span className="ml-1 text-[11px] font-medium text-white/55">ms</span></div>
              <div className="text-[11.5px] text-white/55">Latency</div>
            </div>
          </div>
          <button className="col-span-2 inline-flex items-center justify-center gap-1.5 justify-self-start rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:border-white/30 hover:bg-white/20 sm:col-span-1 sm:justify-self-end">
            Run speed test <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHead eyebrow="This billing cycle" action={<Gauge size={16} className="text-slate-400" />} />
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{USAGE_USED_GB} GB</span>
            <span className="text-[11.5px] text-slate-500 dark:text-slate-400">of {USAGE_CAP_GB} GB used</span>
          </div>
          <LinkButton onClick={() => goTo("usage")}>View usage detail <ChevronRight size={14} /></LinkButton>
        </Card>

        <Card>
          <CardHead eyebrow="Current plan" action={<Zap size={16} className="text-slate-400" />} />
          <div className="mt-1 text-[17px] font-semibold text-slate-900 dark:text-slate-100">{PLAN.name}</div>
          <div className="text-[13px] text-slate-500 dark:text-slate-400">{PLAN.down} / {PLAN.up} Mbps symmetrical</div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(PLAN.price)}<span className="text-[11.5px] font-normal text-slate-500 dark:text-slate-400">/mo</span></div>
          <LinkButton onClick={() => goTo("profile")}>Manage plan <ChevronRight size={14} /></LinkButton>
        </Card>

        <Card>
          <CardHead eyebrow="Next invoice" action={<CreditCard size={16} className="text-slate-400" />} />
          {nextInvoice ? (
            <>
              <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(nextInvoice.amount)}</div>
              <div className="text-[13px] text-slate-500 dark:text-slate-400">Due {nextInvoice.dueDate}</div>
              <PrimaryButton size="sm" className="mt-2.5" onClick={() => openPay(nextInvoice)}>Pay now</PrimaryButton>
            </>
          ) : (
            <div className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">You're all caught up.</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHead eyebrow="Support" action={<MessageSquare size={16} className="text-slate-400" />} />
          <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{openTickets}<span className="text-[11.5px] font-normal text-slate-500 dark:text-slate-400"> open ticket{openTickets !== 1 ? "s" : ""}</span></div>
          <LinkButton onClick={() => goTo("support")}>Go to support <ChevronRight size={14} /></LinkButton>
        </Card>
        <Card>
          <CardHead eyebrow="Service address" action={<ShieldCheck size={16} className="text-slate-400" />} />
          <div className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-300">{PLAN.address}</div>
          <div className="mt-1 text-[11.5px] text-slate-500 dark:text-slate-400">Plan renews {PLAN.renewal}</div>
        </Card>
      </div>
    </div>
  );
}

function UsageTab({ palette }: { palette: ReturnType<typeof chartPalette> }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead
          eyebrow="Daily usage — last 30 days"
          title={<div className="text-[13px] text-slate-500 dark:text-slate-400">{USAGE_USED_GB} GB of {USAGE_CAP_GB} GB used this cycle</div>}
        />
        <div style={{ width: "100%", height: 220, marginTop: 12 }}>
          <ResponsiveContainer>
            <BarChart data={DAILY_USAGE} barGap={2}>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                cursor={{ fill: palette.grid }}
                contentStyle={{ borderRadius: 10, border: `1px solid ${palette.tooltipBorder}`, fontSize: 12, background: palette.tooltipBg, color: palette.tooltipText }}
                formatter={(v: number) => [`${v} GB`, "Used"]}
                labelFormatter={(d) => `Day ${d}`}
              />
              <Bar dataKey="gb" radius={[4, 4, 0, 0]} fill={palette.indigo} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <Eyebrow>Average daily use</Eyebrow>
          <div className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">27<span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">GB</span></div>
        </Card>
        <Card>
          <Eyebrow>Peak day</Eyebrow>
          <div className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">71<span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">GB</span></div>
          <div className="text-[11.5px] text-slate-500 dark:text-slate-400">Day 27</div>
        </Card>
        <Card>
          <Eyebrow>Projected cycle total</Eyebrow>
          <div className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">940<span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">GB</span></div>
          <div className="text-[11.5px] text-slate-500 dark:text-slate-400">On track, under cap</div>
        </Card>
      </div>
    </div>
  );
}

function BillingTab({
  invoices, openPay,
}: {
  invoices: typeof INVOICES;
  openPay: (i: (typeof INVOICES)[number]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead eyebrow="Payment method" action={<LinkButton className="mt-0">Update <ChevronRight size={14} /></LinkButton>} />
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-[30px] w-[42px] items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"><CreditCard size={18} /></div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">Visa •••• 4471</div>
            <div className="text-[11.5px] text-slate-500 dark:text-slate-400">Expires 09/28 · Auto-pay on</div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead eyebrow="Invoice history" action={<FileText size={16} className="text-slate-400" />} />
        <div className="mt-1 flex flex-col">
          {invoices.map((inv) => (
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800" key={inv.id}>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.id}</div>
                <div className="text-[11.5px] text-slate-500 dark:text-slate-400">{inv.date}</div>
              </div>
              <div className="font-mono text-[15px] font-semibold text-slate-800 dark:text-slate-100">{fmtUSD(inv.amount)}</div>
              <StatusBadge status={inv.status} />
              <div className="flex items-center gap-2">
                <IconButton title="Download PDF"><Download size={16} /></IconButton>
                {inv.status === "due" && (
                  <PrimaryButton size="xs" onClick={() => openPay(inv)}>Pay</PrimaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WifiTab({
  devices, togglePause,
}: {
  devices: typeof INITIAL_DEVICES;
  togglePause: (id: number) => void;
}) {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <Eyebrow>Network name (SSID)</Eyebrow>
          <div className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-100">Amina-Home-5G</div>
          <LinkButton>Rename network <ChevronRight size={14} /></LinkButton>
        </Card>
        <Card>
          <Eyebrow>Wi-Fi password</Eyebrow>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">{showPass ? "kunguru-217!bright" : "•••••••••••••••••"}</span>
            <IconButton onClick={() => setShowPass((s) => !s)} aria-label="Toggle password visibility">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </div>
          <LinkButton>Generate new password <ChevronRight size={14} /></LinkButton>
        </Card>
      </div>

      <Card>
        <CardHead eyebrow="Connected devices" action={<div className="text-[11.5px] text-slate-500 dark:text-slate-400">{devices.filter((d) => !d.paused).length} active · {devices.length} total</div>} />
        <div className="mt-1 flex flex-col">
          {devices.map((d) => {
            const Icon = deviceIcon[d.type] || Smartphone;
            return (
              <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3.5 border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800" key={d.id}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"><Icon size={18} /></div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{d.name}</div>
                  <div className="text-[11.5px] text-slate-500 dark:text-slate-400">{d.ip} · connected {d.since}</div>
                </div>
                <div className="font-mono text-[12.5px] text-slate-500 dark:text-slate-400">{d.usedGB} GB</div>
                {d.type !== "router" && (
                  <button
                    onClick={() => togglePause(d.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold ${
                      d.paused
                        ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        : "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400"
                    }`}
                  >
                    {d.paused ? <Play size={13} /> : <Pause size={13} />}
                    {d.paused ? "Paused" : "Active"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SupportTab({
  tickets, addTicket,
}: {
  tickets: typeof INITIAL_TICKETS;
  addTicket: (subject: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [query, setQuery] = useState("");

  const faqs = [
    "Why is my speed slower in the evening?",
    "How do I reset my router?",
    "How do I change my Wi-Fi password?",
    "When is my bill due each month?",
  ];

  const submit = () => {
    if (!subject.trim()) return;
    addTicket(subject.trim());
    setSubject(""); setDesc(""); setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Eyebrow>Search help articles</Eyebrow>
        <SearchInput
          className="mt-2 w-full"
          value={query}
          onChange={setQuery}
          placeholder='Search FAQs, e.g. "router blinking"'
          icon={<Search size={16} />}
        />
        <div className="mt-2.5 flex flex-col">
          {faqs.filter((f) => f.toLowerCase().includes(query.toLowerCase())).map((f, i) => (
            <button
              key={i}
              className="flex items-center justify-between border-t border-slate-100 py-2.5 text-left text-[13px] text-slate-700 first:border-t-0 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-200 dark:hover:text-indigo-400"
            >
              {f} <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead eyebrow="Your tickets" action={<PrimaryButton size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New ticket</PrimaryButton>} />
        <div className="mt-1 flex flex-col">
          {tickets.map((t) => (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800" key={t.id}>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{t.subject}</div>
                <div className="text-[11.5px] text-slate-500 dark:text-slate-400">{t.id} · opened {t.created}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={t.status} />
                <div className="text-[11.5px] text-slate-500 dark:text-slate-400">Updated {t.updated}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New support ticket">
        <FieldLabel>Subject</FieldLabel>
        <FieldInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe the issue" />
        <FieldLabel>Details</FieldLabel>
        <FieldTextarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add any details that could help support resolve this faster" />
        <PrimaryButton className="mt-3.5 w-full" onClick={submit}>Submit ticket</PrimaryButton>
      </Modal>
    </div>
  );
}

function ProfileTab() {
  const [prefs, setPrefs] = useState([true, true, true, false]);
  const labels = ["Outage alerts", "Billing reminders", "Usage warnings", "Product updates"];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <Eyebrow>Account holder</Eyebrow>
          <ProfileRow label="Name" first>Amina Wanjiru</ProfileRow>
          <ProfileRow label="Email">amina.w@example.com</ProfileRow>
          <ProfileRow label="Phone">+254 712 345 678</ProfileRow>
          <LinkButton>Edit contact details <ChevronRight size={14} /></LinkButton>
        </Card>
        <Card>
          <Eyebrow>Plan & address</Eyebrow>
          <ProfileRow label="Plan" first>{PLAN.name}</ProfileRow>
          <ProfileRow label="Address">{PLAN.address}</ProfileRow>
          <ProfileRow label="Renews">{PLAN.renewal}</ProfileRow>
          <LinkButton>Compare available plans <ChevronRight size={14} /></LinkButton>
        </Card>
      </div>
      <Card>
        <Eyebrow>Notification preferences</Eyebrow>
        {labels.map((label, i) => (
          <ProfileRow label={label} key={label} first={i === 0}>
            <ToggleSwitch on={prefs[i]} onChange={(next) => setPrefs((p) => p.map((v, idx) => idx === i ? next : v))} />
          </ProfileRow>
        ))}
      </Card>
    </div>
  );
}

/* --------------------------------- shell --------------------------------- */

function NavList({ tab, onSelect }: { tab: string; onSelect: (k: string) => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => (
        <button
          key={n.key}
          onClick={() => onSelect(n.key)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition ${
            tab === n.key
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          }`}
        >
          <n.icon size={16} /> {n.label}
        </button>
      ))}
    </nav>
  );
}

export default function CustomerPortal() {
  const [tab, setTab] = useState("overview");
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [notifOpen, setNotifOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<(typeof INVOICES)[number] | null>(null);
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const palette = useMemo(() => chartPalette(theme), [theme]);

  const togglePause = (id: number) => setDevices((ds) => ds.map((d) => d.id === id ? { ...d, paused: !d.paused } : d));
  const addTicket = (subject: string) => {
    const id = `TCK-${4400 + tickets.length + 100}`;
    setTickets((ts) => [{ id, subject, status: "open", created: "Just now", updated: "Just now" }, ...ts]);
  };
  const confirmPay = () => {
    if (!payTarget) return;
    setPaidIds((p) => [...p, payTarget.id]);
    setPayTarget(null);
  };

  const invoicesLive = useMemo(
    () => INVOICES.map((i) => paidIds.includes(i.id) ? { ...i, status: "paid" } : i),
    [paidIds]
  );

  const notifications = [
    { icon: CheckCircle2, text: "Payment received for INV-2606", time: "12d ago", tone: "success" as Tone },
    { icon: AlertCircle, text: "Usage at 81% of cycle cap", time: "1d ago", tone: "warning" as Tone },
    { icon: Clock, text: "Ticket TCK-4402 updated", time: "1d ago", tone: "info" as Tone },
  ];

  const goTo = (key: string) => { setTab(key); setMobileNavOpen(false); };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col gap-5 border-r border-slate-200 bg-white p-3.5 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={16} strokeWidth={2.5} /></div>
          <span className="text-[15px] font-bold tracking-tight">Latticefi</span>
        </div>
        <NavList tab={tab} onSelect={setTab} />
        <div className="mt-auto border-t border-slate-200 pt-3.5 dark:border-slate-800">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-100 flex lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/50" />
          <div
            className="relative flex h-full w-64 flex-col gap-5 border-r border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={16} strokeWidth={2.5} /></div>
              <span className="text-[15px] font-bold tracking-tight">Latticefi</span>
              <IconButton className="ml-auto" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={16} /></IconButton>
            </div>
            <NavList tab={tab} onSelect={goTo} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <IconButton className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu size={16} /></IconButton>
            <div className="text-base font-semibold">{NAV.find((n) => n.key === tab)?.label}</div>
          </div>
          <div className="relative flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <IconButton onClick={() => setNotifOpen((s) => !s)} aria-label="Notifications"><Bell size={16} /></IconButton>
            {notifOpen && (
              <div className="absolute top-11 right-0 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {notifications.map((n, i) => {
                  const toneText = n.tone === "success" ? "text-emerald-500" : n.tone === "warning" ? "text-amber-500" : "text-indigo-500";
                  return (
                    <div className="flex gap-2.5 border-t border-slate-100 p-3 text-[12.5px] first:border-t-0 dark:border-slate-800" key={i}>
                      <n.icon size={15} className={toneText} />
                      <div>
                        <div className="text-slate-700 dark:text-slate-200">{n.text}</div>
                        <div className="mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400">{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[12px] font-semibold text-white">AW</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1100px] flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
          {tab === "overview" && <Overview tickets={tickets} invoices={invoicesLive} goTo={goTo} openPay={setPayTarget} />}
          {tab === "usage" && <UsageTab palette={palette} />}
          {tab === "billing" && <BillingTab invoices={invoicesLive} openPay={setPayTarget} />}
          {tab === "wifi" && <WifiTab devices={devices} togglePause={togglePause} />}
          {tab === "support" && <SupportTab tickets={tickets} addTicket={addTicket} />}
          {tab === "profile" && <ProfileTab />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white px-1.5 py-2 lg:hidden dark:border-slate-800 dark:bg-slate-900">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={`flex flex-col items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-semibold ${
              tab === n.key ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <n.icon size={18} />
            {n.label}
          </button>
        ))}
      </nav>

      {/* Pay modal */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title="Pay invoice">
        {payTarget && (
          <>
            <ProfileRow label="Invoice" first>{payTarget.id}</ProfileRow>
            <ProfileRow label="Amount"><span className="font-mono text-base font-semibold">{fmtUSD(payTarget.amount)}</span></ProfileRow>
            <ProfileRow label="Card">Visa •••• 4471</ProfileRow>
            <PrimaryButton className="mt-3.5 w-full" onClick={confirmPay}>
              Confirm payment of {fmtUSD(payTarget.amount)}
            </PrimaryButton>
          </>
        )}
      </Modal>
    </div>
  );
}
