import React, { useState, useMemo } from "react";
import {
  Zap, Users, CreditCard, Router, MessageSquare, Wrench, Package, BarChart3,
  ShieldCheck, Bell, Search, ChevronRight, Plus, X, CheckCircle2, AlertTriangle,
  Activity, Signal, MapPin, Download, Play, Ban, UserPlus,
  Edit3, Trash2, ArrowUpRight, ArrowDownRight, Server, Cable, Radio,
  ClipboardList, LogOut, Home, DollarSign, FileWarning, Menu,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { useTheme, chartPalette } from "../lib/theme";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import {
  Card, CardHead, Eyebrow, Badge, Tone, PrimaryButton, GhostButton, IconButton,
  LinkButton, SearchInput, SelectInput, FieldLabel, FieldInput, FieldSelect,
  Modal, ModalActions, ProfileRow,
} from "../components/ui/primitives";

/* ============================== MOCK DATA ============================== */

const KPIS = [
  { label: "Active subscribers", value: "4,812", delta: "+2.4%", up: true, icon: Users },
  { label: "MRR", value: "$318,240", delta: "+3.1%", up: true, icon: DollarSign },
  { label: "Active sessions", value: "4,390", delta: "-0.6%", up: false, icon: Radio },
  { label: "Network uptime", value: "99.97%", delta: "+0.02%", up: true, icon: Signal },
  { label: "Open tickets", value: "38", delta: "+6", up: false, icon: MessageSquare },
  { label: "Overdue accounts", value: "97", delta: "-11", up: true, icon: FileWarning },
];

const REVENUE_TREND = [
  { m: "Feb", rev: 288000, churn: 41 }, { m: "Mar", rev: 296500, churn: 38 },
  { m: "Apr", rev: 301200, churn: 44 }, { m: "May", rev: 305800, churn: 36 },
  { m: "Jun", rev: 311400, churn: 33 }, { m: "Jul", rev: 318240, churn: 29 },
];

const SUBSCRIBER_GROWTH = [
  { m: "Feb", n: 4520 }, { m: "Mar", n: 4590 }, { m: "Apr", n: 4640 },
  { m: "May", n: 4705 }, { m: "Jun", n: 4760 }, { m: "Jul", n: 4812 },
];

const PLAN_MIX_KEYS = ["indigo", "emerald", "amber", "rose"] as const;
const PLAN_MIX = [
  { name: "Fiber 100", value: 1120 },
  { name: "Fiber 300", value: 1840 },
  { name: "Fiber 500", value: 1390 },
  { name: "Fiber 1000", value: 462 },
];

const ALERTS = [
  { id: 1, tone: "danger" as Tone, text: "OLT-Ngong-04 offline — 214 subscribers affected", time: "6 min ago" },
  { id: 2, tone: "warning" as Tone, text: "Router core-nbo-02 CPU at 88%", time: "22 min ago" },
  { id: 3, tone: "warning" as Tone, text: "RADIUS auth failures spiking in Kilimani zone", time: "41 min ago" },
  { id: 4, tone: "info" as Tone, text: "Scheduled maintenance: Westlands POP, tonight 01:00", time: "2 hr ago" },
];

const SUBSCRIBERS = [
  { id: "SUB-1042", name: "Amina Wanjiru", email: "amina.w@example.com", plan: "Fiber 500", status: "active", bill: 79.99, joined: "Feb 2025", lastPay: "Jul 14", usage: 812, zone: "Muthaiga" },
  { id: "SUB-1043", name: "Brian Otieno", email: "brian.o@example.com", plan: "Fiber 300", status: "overdue", bill: 54.99, joined: "Nov 2024", lastPay: "May 09", usage: 401, zone: "Kilimani" },
  { id: "SUB-1044", name: "Grace Mwangi", email: "grace.m@example.com", plan: "Fiber 1000", status: "active", bill: 129.99, joined: "Jan 2026", lastPay: "Jul 20", usage: 1310, zone: "Karen" },
  { id: "SUB-1045", name: "Kevin Kiptoo", email: "kevin.k@example.com", plan: "Fiber 100", status: "suspended", bill: 34.99, joined: "Aug 2023", lastPay: "Apr 02", usage: 0, zone: "Ngong" },
  { id: "SUB-1046", name: "Faith Njoki", email: "faith.n@example.com", plan: "Fiber 300", status: "active", bill: 54.99, joined: "Mar 2025", lastPay: "Jul 12", usage: 260, zone: "Westlands" },
  { id: "SUB-1047", name: "Dennis Mutua", email: "dennis.m@example.com", plan: "Fiber 500", status: "active", bill: 79.99, joined: "Dec 2025", lastPay: "Jul 08", usage: 690, zone: "Kilimani" },
  { id: "SUB-1048", name: "Sarah Achieng", email: "sarah.a@example.com", plan: "Fiber 300", status: "overdue", bill: 54.99, joined: "Jun 2024", lastPay: "Apr 30", usage: 190, zone: "Ngong" },
  { id: "SUB-1049", name: "Peter Kamau", email: "peter.k@example.com", plan: "Fiber 1000", status: "active", bill: 129.99, joined: "Sep 2025", lastPay: "Jul 19", usage: 980, zone: "Karen" },
];

const INVOICES_ADMIN = [
  { id: "INV-9931", sub: "Amina Wanjiru", amount: 79.99, status: "due", date: "Jul 14, 2026" },
  { id: "INV-9930", sub: "Brian Otieno", amount: 54.99, status: "overdue", date: "May 09, 2026" },
  { id: "INV-9929", sub: "Grace Mwangi", amount: 129.99, status: "paid", date: "Jul 20, 2026" },
  { id: "INV-9928", sub: "Kevin Kiptoo", amount: 34.99, status: "overdue", date: "Apr 02, 2026" },
  { id: "INV-9927", sub: "Sarah Achieng", amount: 54.99, status: "overdue", date: "Apr 30, 2026" },
  { id: "INV-9926", sub: "Dennis Mutua", amount: 79.99, status: "paid", date: "Jul 08, 2026" },
];

const AGING = [
  { bucket: "Current", amount: 298400 },
  { bucket: "1–30 days", amount: 14200 },
  { bucket: "31–60 days", amount: 6800 },
  { bucket: "60+ days", amount: 3100 },
];

const NODES = [
  { id: "OLT-Ngong-04", type: "OLT", zone: "Ngong", status: "offline", uptime: "—", load: 0, subs: 214 },
  { id: "core-nbo-02", type: "Router", zone: "Core", status: "degraded", uptime: "99.2%", load: 88, subs: 1840 },
  { id: "OLT-Kilimani-01", type: "OLT", zone: "Kilimani", status: "online", uptime: "99.98%", load: 61, subs: 512 },
  { id: "OLT-Karen-02", type: "OLT", zone: "Karen", status: "online", uptime: "99.99%", load: 44, subs: 388 },
  { id: "tower-westlands-1", type: "Tower", zone: "Westlands", status: "online", uptime: "99.95%", load: 52, subs: 260 },
  { id: "sw-muthaiga-3", type: "Switch", zone: "Muthaiga", status: "online", uptime: "100%", load: 38, subs: 174 },
];

const OUTAGES = [
  { id: "OUT-118", node: "OLT-Ngong-04", start: "18:42", duration: "ongoing", affected: 214, status: "active" },
  { id: "OUT-117", node: "tower-westlands-1", start: "Jul 26, 02:10", duration: "47 min", affected: 88, status: "resolved" },
  { id: "OUT-116", node: "core-nbo-02", start: "Jul 21, 14:05", duration: "12 min", affected: 1840, status: "resolved" },
];

const PLANS = [
  { id: 1, name: "Fiber 100", speed: "100/100 Mbps", price: 34.99, subs: 1120, status: "active" },
  { id: 2, name: "Fiber 300", speed: "300/300 Mbps", price: 54.99, subs: 1840, status: "active" },
  { id: 3, name: "Fiber 500", speed: "500/500 Mbps", price: 79.99, subs: 1390, status: "active" },
  { id: 4, name: "Fiber 1000", speed: "1000/1000 Mbps", price: 129.99, subs: 462, status: "active" },
  { id: 5, name: "Legacy DSL 20", speed: "20/2 Mbps", price: 24.99, subs: 31, status: "archived" },
];

const TICKETS_ADMIN = [
  { id: "TCK-4471", sub: "Amina Wanjiru", subject: "Intermittent drops in the evening", priority: "high", status: "open", assignee: "Unassigned", sla: "2h left", created: "2 hr ago" },
  { id: "TCK-4470", sub: "Brian Otieno", subject: "Billed twice this cycle", priority: "urgent", status: "open", assignee: "Unassigned", sla: "38m left", created: "40 min ago" },
  { id: "TCK-4402", sub: "Amina Wanjiru", subject: "Static IP request for home office", priority: "medium", status: "in-progress", assignee: "James O.", sla: "1d left", created: "1 day ago" },
  { id: "TCK-4398", sub: "Grace Mwangi", subject: "Router firmware update request", priority: "low", status: "in-progress", assignee: "Cynthia W.", sla: "2d left", created: "2 days ago" },
  { id: "TCK-4310", sub: "Kevin Kiptoo", subject: "Router blinking orange after storm", priority: "high", status: "resolved", assignee: "James O.", sla: "—", created: "Jun 30" },
];

const TECHNICIANS = [
  { id: 1, name: "James Oduya", status: "on-job", job: "Install — SUB-1050, Kilimani", jobsToday: 3, zone: "Kilimani" },
  { id: 2, name: "Cynthia Wambui", status: "available", job: "—", jobsToday: 2, zone: "Westlands" },
  { id: 3, name: "Moses Kariuki", status: "on-job", job: "Repair — OLT-Ngong-04", jobsToday: 4, zone: "Ngong" },
  { id: 4, name: "Ruth Chebet", status: "off-duty", job: "—", jobsToday: 0, zone: "Karen" },
];

const WORK_ORDERS = [
  { id: "WO-3301", type: "install", sub: "New: Timothy Ngugi", address: "22 Ridgeways, Kilimani", tech: "James Oduya", when: "Today, 14:00", status: "scheduled" },
  { id: "WO-3298", type: "repair", sub: "OLT-Ngong-04", address: "Ngong POP", tech: "Moses Kariuki", when: "In progress", status: "in-progress" },
  { id: "WO-3295", type: "maintenance", sub: "tower-westlands-1", address: "Westlands mast", tech: "Cynthia Wambui", when: "Tomorrow, 09:00", status: "scheduled" },
  { id: "WO-3290", type: "install", sub: "New: Lucy Wairimu", address: "8 Riverside Dr, Karen", tech: "Ruth Chebet", when: "Jul 25", status: "completed" },
];

const STAFF = [
  { id: 1, name: "Daniel Kimani", email: "d.kimani@latticefi.com", role: "Admin", active: "Just now" },
  { id: 2, name: "James Oduya", email: "j.oduya@latticefi.com", role: "Technician", active: "1 hr ago" },
  { id: 3, name: "Cynthia Wambui", email: "c.wambui@latticefi.com", role: "Technician", active: "3 hr ago" },
  { id: 4, name: "Purity Nyambura", email: "p.nyambura@latticefi.com", role: "Billing", active: "Today" },
  { id: 5, name: "Felix Marani", email: "f.marani@latticefi.com", role: "NOC", active: "Yesterday" },
];

const AUDIT_LOG = [
  { id: 1, actor: "Daniel Kimani", action: "Suspended subscriber SUB-1045", time: "12 min ago" },
  { id: 2, actor: "Purity Nyambura", action: "Issued refund on INV-9902", time: "1 hr ago" },
  { id: 3, actor: "System", action: "Auto-generated billing run for Jul cycle", time: "Today, 03:00" },
  { id: 4, actor: "Felix Marani", action: "Acknowledged alert on core-nbo-02", time: "22 min ago" },
  { id: 5, actor: "Daniel Kimani", action: "Created plan “Fiber 1000”", time: "Jul 20" },
];

const NAV = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "subscribers", label: "Subscribers", icon: Users },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "network", label: "Network", icon: Router },
  { key: "tickets", label: "Support queue", icon: MessageSquare },
  { key: "fieldops", label: "Field ops", icon: Wrench },
  { key: "plans", label: "Plans", icon: Package },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "staff", label: "Staff & access", icon: ShieldCheck },
];

/* ============================== HELPERS ============================== */

const fmtUSD = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => n.toLocaleString();

const STATUS_TONE: Record<string, Tone> = {
  active: "success", online: "success", paid: "success", completed: "success", resolved: "success", available: "success",
  scheduled: "info", "in-progress": "info",
  open: "warning", degraded: "warning", due: "warning", "on-job": "warning",
  suspended: "neutral", "off-duty": "neutral", archived: "neutral",
  overdue: "danger", offline: "danger",
};

const PRIORITY_TONE: Record<string, Tone> = {
  urgent: "danger", high: "warning", medium: "info", low: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active", online: "Online", paid: "Paid", completed: "Completed", resolved: "Resolved",
  available: "Available", scheduled: "Scheduled", "in-progress": "In progress", open: "Open",
  degraded: "Degraded", due: "Due", "on-job": "On job", suspended: "Suspended", "off-duty": "Off duty",
  archived: "Archived", overdue: "Overdue", offline: "Offline",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgent", high: "High", medium: "Medium", low: "Low",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  return <Badge tone={PRIORITY_TONE[priority] ?? "neutral"}>{PRIORITY_LABEL[priority] ?? priority}</Badge>;
}

const nodeIcon: Record<string, any> = { OLT: Server, Router: Router, Tower: Radio, Switch: Cable };

const NODE_TONE: Record<string, Tone> = { online: "success", degraded: "warning", offline: "danger" };

/* ============================== ATOMS ============================== */

function KpiCard({ k }: { k: (typeof KPIS)[number] }) {
  return (
    <Card className="!p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
          <k.icon size={15} />
        </div>
        <span
          className={`flex items-center gap-0.5 text-[11px] font-bold ${
            k.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.delta}
        </span>
      </div>
      <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{k.value}</div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{k.label}</div>
    </Card>
  );
}

function FleetPulse() {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5" aria-hidden="true">
      {NODES.map((n) => (
        <span
          key={n.id}
          title={`${n.id} — ${n.status}`}
          className={`h-3.5 w-3.5 rounded-[4px] ${
            n.status === "online"
              ? "bg-emerald-500"
              : n.status === "degraded"
              ? "bg-amber-500"
              : "animate-pulse bg-rose-500"
          }`}
        />
      ))}
    </div>
  );
}

const tooltipStyle = (p: ReturnType<typeof chartPalette>) => ({
  background: p.tooltipBg,
  borderRadius: 10,
  border: `1px solid ${p.tooltipBorder}`,
  fontSize: 12,
  color: p.tooltipText,
});

/* ============================== OVERVIEW ============================== */

function Overview({ goTo, palette }: { goTo: (k: string) => void; palette: ReturnType<typeof chartPalette> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k, i) => <KpiCard k={k} key={i} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHead
            eyebrow="Revenue — last 6 months"
            title={
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {fmtUSD(318240)}
                <span className="ml-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">MRR</span>
              </div>
            }
          />
          <div style={{ width: "100%", height: 200, marginTop: 8 }}>
            <ResponsiveContainer>
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.indigo} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={palette.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtUSD(v), "Revenue"]} />
                <Area type="monotone" dataKey="rev" stroke={palette.indigo} strokeWidth={2} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Eyebrow>Plan mix</Eyebrow>
          <div style={{ width: "100%", height: 160, marginTop: 4 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={PLAN_MIX} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={3}>
                  {PLAN_MIX.map((_, i) => <Cell key={i} fill={palette[PLAN_MIX_KEYS[i]]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number, n: string) => [fmtInt(v), n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {PLAN_MIX.map((p, i) => (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" key={p.name}>
                <span className="h-2 w-2 rounded-sm" style={{ background: palette[PLAN_MIX_KEYS[i]] }} /> {p.name}
                <span className="ml-auto font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{fmtInt(p.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHead
            eyebrow={`Fleet health — ${NODES.filter((n) => n.status !== "online").length} node(s) need attention`}
            action={
              <LinkButton className="mt-0" onClick={() => goTo("network")}>
                Open network <ChevronRight size={14} />
              </LinkButton>
            }
          />
          <FleetPulse />
          <div className="mt-2 flex gap-3.5">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"><i className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online</span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"><i className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" /> Degraded</span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"><i className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" /> Offline</span>
          </div>
          <div style={{ width: "100%", height: 140, marginTop: 14 }}>
            <ResponsiveContainer>
              <LineChart data={SUBSCRIBER_GROWTH}>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtInt(v), "Subscribers"]} />
                <Line type="monotone" dataKey="n" stroke={palette.emerald} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Subscriber growth, last 6 months</div>
        </Card>

        <Card>
          <CardHead eyebrow="Live alerts" action={<Bell size={15} className="text-slate-400" />} />
          <div className="mt-1.5 flex flex-col gap-2.5">
            {ALERTS.map((a) => (
              <div className="flex items-start gap-2.5" key={a.id}>
                <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                  a.tone === "danger" ? "bg-rose-500" : a.tone === "warning" ? "bg-amber-500" : "bg-indigo-500"
                }`} />
                <div>
                  <div className="text-[12.5px] text-slate-700 dark:text-slate-200">{a.text}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <LinkButton onClick={() => goTo("network")}>View all alerts <ChevronRight size={14} /></LinkButton>
        </Card>
      </div>
    </div>
  );
}

/* ============================== SUBSCRIBERS ============================== */

function Subscribers() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState(SUBSCRIBERS);
  const [detail, setDetail] = useState<(typeof SUBSCRIBERS)[number] | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    const matchesQ = (r.name + r.email + r.id).toLowerCase().includes(q.toLowerCase());
    const matchesStatus = status === "all" || r.status === status;
    return matchesQ && matchesStatus;
  }), [rows, q, status]);

  const toggleStatus = (id: string) => {
    setRows((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const next = r.status === "suspended" ? "active" : "suspended";
      return { ...r, status: next };
    }));
    setDetail((d) => d && d.id === id ? { ...d, status: d.status === "suspended" ? "active" : "suspended" } : d);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, email, or ID…" icon={<Search size={15} />} />
        <SelectInput value={status} onChange={setStatus} options={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "overdue", label: "Overdue" },
          { value: "suspended", label: "Suspended" },
        ]} />
        <PrimaryButton size="sm" className="ml-auto" onClick={() => setAddOpen(true)}>
          <UserPlus size={14} /> Add subscriber
        </PrimaryButton>
      </div>

      <Card className="!p-2 sm:!p-2.5">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr_1fr_0.5fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <div>Subscriber</div><div>Plan</div><div>Status</div><div>Bill</div><div>Usage</div><div>Last payment</div><div />
            </div>
            {filtered.map((r) => (
              <div
                className="grid cursor-pointer grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr_1fr_0.5fr] items-center gap-2.5 rounded-lg border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                key={r.id}
                onClick={() => setDetail(r)}
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.id} · {r.zone}</div>
                </div>
                <div className="text-slate-600 dark:text-slate-300">{r.plan}</div>
                <div><StatusBadge status={r.status} /></div>
                <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtUSD(r.bill)}</div>
                <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{r.usage} GB</div>
                <div className="text-slate-600 dark:text-slate-300">{r.lastPay}</div>
                <div onClick={(e) => e.stopPropagation()}>
                  <IconButton onClick={() => toggleStatus(r.id)} title={r.status === "suspended" ? "Reactivate" : "Suspend"}>
                    {r.status === "suspended" ? <Play size={14} /> : <Ban size={14} />}
                  </IconButton>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No subscribers match this search.</div>
            )}
          </div>
        </div>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name} widthClass="max-w-lg">
        {detail && (
          <>
            <ProfileRow label="ID" first>{detail.id}</ProfileRow>
            <ProfileRow label="Email">{detail.email}</ProfileRow>
            <ProfileRow label="Plan">{detail.plan}</ProfileRow>
            <ProfileRow label="Status"><StatusBadge status={detail.status} /></ProfileRow>
            <ProfileRow label="Monthly bill"><span className="font-mono text-xs font-semibold">{fmtUSD(detail.bill)}</span></ProfileRow>
            <ProfileRow label="Usage this cycle"><span className="font-mono text-xs font-semibold">{detail.usage} GB</span></ProfileRow>
            <ProfileRow label="Joined">{detail.joined}</ProfileRow>
            <ProfileRow label="Zone">{detail.zone}</ProfileRow>
            <ModalActions>
              <GhostButton size="sm" onClick={() => toggleStatus(detail.id)}>
                {detail.status === "suspended" ? <Play size={14} /> : <Ban size={14} />}
                {detail.status === "suspended" ? "Reactivate account" : "Suspend account"}
              </GhostButton>
              <PrimaryButton size="sm"><Edit3 size={14} /> Edit details</PrimaryButton>
            </ModalActions>
          </>
        )}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add subscriber">
        <FieldLabel>Full name</FieldLabel>
        <FieldInput placeholder="e.g. Timothy Ngugi" />
        <FieldLabel>Email</FieldLabel>
        <FieldInput placeholder="name@example.com" />
        <FieldLabel>Plan</FieldLabel>
        <FieldSelect>
          {PLANS.filter((p) => p.status === "active").map((p) => <option key={p.id}>{p.name}</option>)}
        </FieldSelect>
        <FieldLabel>Service address</FieldLabel>
        <FieldInput placeholder="Street, area" />
        <PrimaryButton className="mt-3.5 w-full" onClick={() => setAddOpen(false)}>Create subscriber</PrimaryButton>
      </Modal>
    </div>
  );
}

/* ============================== BILLING ============================== */

function BillingAdmin({ palette }: { palette: ReturnType<typeof chartPalette> }) {
  const [status, setStatus] = useState("all");
  const filtered = INVOICES_ADMIN.filter((i) => status === "all" || i.status === status);
  const totalAging = AGING.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><Eyebrow>Billed this cycle</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(318240)}</div></Card>
        <Card><Eyebrow>Collected</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(298400)}</div></Card>
        <Card><Eyebrow>Outstanding</Eyebrow><div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">{fmtUSD(24100)}</div></Card>
        <Card><Eyebrow>Failed payments</Eyebrow><div className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">14</div></Card>
      </div>

      <Card>
        <CardHead eyebrow="Aging report" action={<div className="text-[11px] text-slate-500 dark:text-slate-400">{fmtUSD(totalAging)} total receivables</div>} />
        <div style={{ width: "100%", height: 160, marginTop: 6 }}>
          <ResponsiveContainer>
            <BarChart data={AGING} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} stroke={palette.grid} />
              <XAxis type="number" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="bucket" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtUSD(v), "Amount"]} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} fill={palette.indigo} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHead
          eyebrow="Invoices"
          action={
            <div className="flex gap-2">
              <SelectInput value={status} onChange={setStatus} options={[
                { value: "all", label: "All" }, { value: "paid", label: "Paid" },
                { value: "due", label: "Due" }, { value: "overdue", label: "Overdue" },
              ]} />
              <GhostButton size="sm"><Download size={14} /> Export</GhostButton>
              <PrimaryButton size="sm"><Plus size={14} /> Run billing</PrimaryButton>
            </div>
          }
        />
        <div className="mt-2 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <div>Invoice</div><div>Subscriber</div><div>Amount</div><div>Date</div><div>Status</div>
            </div>
            {filtered.map((i) => (
              <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={i.id}>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{i.id}</div>
                <div className="text-slate-600 dark:text-slate-300">{i.sub}</div>
                <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtUSD(i.amount)}</div>
                <div className="text-slate-600 dark:text-slate-300">{i.date}</div>
                <div><StatusBadge status={i.status} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================== NETWORK ============================== */

function NetworkAdmin() {
  const [nodeDetail, setNodeDetail] = useState<(typeof NODES)[number] | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><Eyebrow>Nodes online</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{NODES.filter((n) => n.status === "online").length}/{NODES.length}</div></Card>
        <Card><Eyebrow>Active RADIUS sessions</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">4,390</div></Card>
        <Card><Eyebrow>Avg. network load</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">54%</div></Card>
        <Card><Eyebrow>Open outages</Eyebrow><div className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">{OUTAGES.filter((o) => o.status === "active").length}</div></Card>
      </div>

      <Card>
        <CardHead eyebrow="Infrastructure nodes" action={<MapPin size={15} className="text-slate-400" />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NODES.map((n) => {
            const Icon = nodeIcon[n.type] || Server;
            return (
              <button
                key={n.id}
                onClick={() => setNodeDetail(n)}
                className={`rounded-xl border bg-slate-50 p-3 text-left transition hover:border-indigo-400 dark:bg-slate-800/60 ${
                  n.status === "offline" ? "border-rose-400 dark:border-rose-600" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                  <Icon size={16} />
                  <span className={`h-2 w-2 rounded-full ${
                    n.status === "online" ? "bg-emerald-500" : n.status === "degraded" ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                </div>
                <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{n.id}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{n.type} · {n.zone}</div>
                <div className="my-2 h-[5px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${n.load}%` }} />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{n.load}% load · {n.subs} subs</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHead eyebrow="Outage log" />
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <div>Outage</div><div>Node</div><div>Started</div><div>Duration</div><div>Status</div>
            </div>
            {OUTAGES.map((o) => (
              <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={o.id}>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{o.id}</div>
                <div className="text-slate-600 dark:text-slate-300">{o.node}</div>
                <div className="text-slate-600 dark:text-slate-300">{o.start}</div>
                <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{o.duration}</div>
                <div><Badge tone={o.status === "active" ? "danger" : "success"}>{o.status === "active" ? "Active" : "Resolved"}</Badge></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal open={!!nodeDetail} onClose={() => setNodeDetail(null)} title={nodeDetail?.id}>
        {nodeDetail && (
          <>
            <ProfileRow label="Type" first>{nodeDetail.type}</ProfileRow>
            <ProfileRow label="Zone">{nodeDetail.zone}</ProfileRow>
            <ProfileRow label="Status"><Badge tone={NODE_TONE[nodeDetail.status]}>{STATUS_LABEL[nodeDetail.status] ?? nodeDetail.status}</Badge></ProfileRow>
            <ProfileRow label="Uptime"><span className="font-mono text-xs font-semibold">{nodeDetail.uptime}</span></ProfileRow>
            <ProfileRow label="Load"><span className="font-mono text-xs font-semibold">{nodeDetail.load}%</span></ProfileRow>
            <ProfileRow label="Subscribers served"><span className="font-mono text-xs font-semibold">{nodeDetail.subs}</span></ProfileRow>
            <ModalActions>
              <GhostButton size="sm"><Activity size={14} /> View live metrics</GhostButton>
              <PrimaryButton size="sm"><Wrench size={14} /> Dispatch technician</PrimaryButton>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  );
}

/* ============================== TICKETS ============================== */

function TicketsAdmin() {
  const [rows, setRows] = useState(TICKETS_ADMIN);
  const [priority, setPriority] = useState("all");
  const [detail, setDetail] = useState<(typeof TICKETS_ADMIN)[number] | null>(null);
  const filtered = rows.filter((t) => priority === "all" || t.priority === priority);

  const resolve = (id: string) => {
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, status: "resolved" } : r));
    setDetail((d) => d && d.id === id ? { ...d, status: "resolved" } : d);
  };
  const assign = (id: string) => {
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, assignee: "James O.", status: r.status === "open" ? "in-progress" : r.status } : r));
    setDetail((d) => d && d.id === id ? { ...d, assignee: "James O.", status: "in-progress" } : d);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <SelectInput value={priority} onChange={setPriority} options={[
          { value: "all", label: "All priorities" }, { value: "urgent", label: "Urgent" },
          { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
        ]} />
        <div className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">{filtered.filter((t) => t.status !== "resolved").length} open of {filtered.length}</div>
      </div>
      <Card className="!p-2 sm:!p-2.5">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <div>Ticket</div><div>Subscriber</div><div>Priority</div><div>Assignee</div><div>SLA</div><div>Status</div>
            </div>
            {filtered.map((t) => (
              <div
                className="grid cursor-pointer grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr] items-center gap-2.5 rounded-lg border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                key={t.id}
                onClick={() => setDetail(t)}
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t.subject}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.id} · {t.created}</div>
                </div>
                <div className="text-slate-600 dark:text-slate-300">{t.sub}</div>
                <div><PriorityBadge priority={t.priority} /></div>
                <div className="text-slate-600 dark:text-slate-300">{t.assignee}</div>
                <div className={`font-mono text-xs font-semibold ${t.sla.includes("m left") ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"}`}>{t.sla}</div>
                <div><StatusBadge status={t.status} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.subject} widthClass="max-w-lg">
        {detail && (
          <>
            <ProfileRow label="Ticket" first>{detail.id}</ProfileRow>
            <ProfileRow label="Subscriber">{detail.sub}</ProfileRow>
            <ProfileRow label="Priority"><PriorityBadge priority={detail.priority} /></ProfileRow>
            <ProfileRow label="Assignee">{detail.assignee}</ProfileRow>
            <ProfileRow label="SLA"><span className="font-mono text-xs font-semibold">{detail.sla}</span></ProfileRow>
            <ProfileRow label="Status"><StatusBadge status={detail.status} /></ProfileRow>
            {detail.status !== "resolved" && (
              <ModalActions>
                <GhostButton size="sm" onClick={() => assign(detail.id)}><Users size={14} /> Assign to me</GhostButton>
                <PrimaryButton size="sm" onClick={() => resolve(detail.id)}><CheckCircle2 size={14} /> Mark resolved</PrimaryButton>
              </ModalActions>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

/* ============================== FIELD OPS ============================== */

function FieldOps() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead eyebrow="Technicians" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TECHNICIANS.map((t) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60" key={t.id}>
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.zone} zone · {t.jobsToday} jobs today</div>
              <div className="mt-1.5 text-[12.5px] text-slate-600 dark:text-slate-300">{t.job}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead eyebrow="Work orders" action={<PrimaryButton size="sm"><Plus size={14} /> New work order</PrimaryButton>} />
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <div>Order</div><div>Target</div><div>Technician</div><div>When</div><div>Status</div>
            </div>
            {WORK_ORDERS.map((w) => (
              <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={w.id}>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{w.id}</div>
                  <div className="text-[11px] text-slate-500 capitalize dark:text-slate-400">{w.type}</div>
                </div>
                <div className="text-slate-600 dark:text-slate-300">{w.sub}<div className="text-[11px] text-slate-500 dark:text-slate-400">{w.address}</div></div>
                <div className="text-slate-600 dark:text-slate-300">{w.tech}</div>
                <div className="text-slate-600 dark:text-slate-300">{w.when}</div>
                <div><StatusBadge status={w.status} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================== PLANS ============================== */

function PlansAdmin() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="text-[13px] text-slate-600 dark:text-slate-300">{PLANS.filter((p) => p.status === "active").length} active plans · {fmtInt(PLANS.reduce((a, b) => a + b.subs, 0))} subscribers total</div>
        <PrimaryButton size="sm" className="ml-auto" onClick={() => setOpen(true)}><Plus size={14} /> New plan</PrimaryButton>
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {PLANS.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <CardHead
              title={<div className="text-base font-bold text-slate-900 dark:text-slate-100">{p.name}</div>}
              action={<StatusBadge status={p.status} />}
            />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.speed}</div>
            <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(p.price)}<span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/mo</span></div>
            <div className="text-[13px] text-slate-600 dark:text-slate-300">{fmtInt(p.subs)} subscribers</div>
            <ModalActions>
              <GhostButton size="sm"><Edit3 size={14} /> Edit</GhostButton>
              <IconButton><Trash2 size={14} /></IconButton>
            </ModalActions>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create plan">
        <FieldLabel>Plan name</FieldLabel>
        <FieldInput placeholder="e.g. Fiber 750" />
        <FieldLabel>Speed (down/up Mbps)</FieldLabel>
        <FieldInput placeholder="750/750" />
        <FieldLabel>Monthly price (USD)</FieldLabel>
        <FieldInput placeholder="99.99" />
        <PrimaryButton className="mt-3.5 w-full" onClick={() => setOpen(false)}>Create plan</PrimaryButton>
      </Modal>
    </div>
  );
}

/* ============================== REPORTS ============================== */

function ReportsAdmin({ palette }: { palette: ReturnType<typeof chartPalette> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <Eyebrow>Revenue vs churn</Eyebrow>
          <div style={{ width: "100%", height: 220, marginTop: 8 }}>
            <ResponsiveContainer>
              <LineChart data={REVENUE_TREND}>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle(palette)} />
                <Line yAxisId="left" type="monotone" dataKey="rev" stroke={palette.indigo} strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="churn" stroke={palette.rose} strokeWidth={2} dot={{ r: 3 }} name="Churned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <Eyebrow>Key ratios</Eyebrow>
          <ProfileRow label="ARPU" first><span className="font-mono text-sm font-semibold">$66.13</span></ProfileRow>
          <ProfileRow label="Monthly churn"><span className="font-mono text-sm font-semibold">0.61%</span></ProfileRow>
          <ProfileRow label="CAC"><span className="font-mono text-sm font-semibold">$41.20</span></ProfileRow>
          <ProfileRow label="Avg. install time"><span className="font-mono text-sm font-semibold">2.4 days</span></ProfileRow>
          <ProfileRow label="NPS"><span className="font-mono text-sm font-semibold">+48</span></ProfileRow>
        </Card>
      </div>
      <Card>
        <CardHead eyebrow="Subscriber growth by zone" action={<GhostButton size="sm"><Download size={14} /> Export CSV</GhostButton>} />
        <div style={{ width: "100%", height: 200, marginTop: 8 }}>
          <ResponsiveContainer>
            <BarChart data={[
              { zone: "Kilimani", subs: 1120 }, { zone: "Westlands", subs: 940 },
              { zone: "Karen", subs: 860 }, { zone: "Ngong", subs: 705 },
              { zone: "Muthaiga", subs: 610 }, { zone: "Other", subs: 577 },
            ]}>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis dataKey="zone" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtInt(v), "Subscribers"]} />
              <Bar dataKey="subs" radius={[4, 4, 0, 0]} fill={palette.emerald} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* ============================== STAFF & ACCESS ============================== */

function StaffAdmin() {
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead eyebrow="Staff accounts" action={<PrimaryButton size="sm" onClick={() => setInviteOpen(true)}><UserPlus size={14} /> Invite staff</PrimaryButton>} />
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_1fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <div>Name</div><div>Email</div><div>Role</div><div>Last active</div>
            </div>
            {STAFF.map((s) => (
              <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_1fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={s.id}>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</div>
                <div className="text-slate-600 dark:text-slate-300">{s.email}</div>
                <div><span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">{s.role}</span></div>
                <div className="text-slate-600 dark:text-slate-300">{s.active}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHead eyebrow="Audit log" action={<ClipboardList size={15} className="text-slate-400" />} />
        <div className="mt-1.5 flex flex-col gap-3">
          {AUDIT_LOG.map((a) => (
            <div className="flex items-start gap-2.5" key={a.id}>
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
              <div>
                <div className="text-[12.5px] text-slate-700 dark:text-slate-200"><b className="font-semibold text-slate-900 dark:text-slate-100">{a.actor}</b> {a.action}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite staff member">
        <FieldLabel>Full name</FieldLabel>
        <FieldInput placeholder="e.g. Purity Nyambura" />
        <FieldLabel>Email</FieldLabel>
        <FieldInput placeholder="name@latticefi.com" />
        <FieldLabel>Role</FieldLabel>
        <FieldSelect>
          <option>Admin</option><option>Billing</option><option>NOC</option><option>Support</option><option>Technician</option>
        </FieldSelect>
        <PrimaryButton className="mt-3.5 w-full" onClick={() => setInviteOpen(false)}>Send invite</PrimaryButton>
      </Modal>
    </div>
  );
}

/* ============================== SHELL ============================== */

function NavList({ tab, onSelect }: { tab: string; onSelect: (k: string) => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => (
        <button
          key={n.key}
          onClick={() => onSelect(n.key)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition ${
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

export default function AdminConsole() {
  const [tab, setTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const palette = useMemo(() => chartPalette(theme), [theme]);

  const goTo = (key: string) => { setTab(key); setMobileNavOpen(false); };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 flex-shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-white p-3 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={15} strokeWidth={2.5} /></div>
          <span className="text-[14.5px] font-bold">Latticefi</span>
          <span className="ml-auto text-[10px] font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">Ops</span>
        </div>
        <NavList tab={tab} onSelect={setTab} />
        <div className="mt-auto border-t border-slate-200 pt-3 dark:border-slate-800">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-100 flex lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/50" />
          <div
            className="relative flex h-full w-64 flex-col gap-5 border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={15} strokeWidth={2.5} /></div>
              <span className="text-[14.5px] font-bold">Latticefi</span>
              <IconButton className="ml-auto" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={16} /></IconButton>
            </div>
            <NavList tab={tab} onSelect={goTo} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <IconButton className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu size={16} /></IconButton>
            <div className="text-[15.5px] font-semibold">{NAV.find((n) => n.key === tab)?.label}</div>
          </div>
          <div className="relative flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <IconButton onClick={() => setNotifOpen((s) => !s)} aria-label="Notifications"><Bell size={16} /></IconButton>
            {notifOpen && (
              <div className="absolute top-11 right-0 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {ALERTS.map((a) => (
                  <div className="flex gap-2.5 border-t border-slate-100 p-3 text-xs first:border-t-0 dark:border-slate-800" key={a.id}>
                    <AlertTriangle size={14} className={a.tone === "danger" ? "text-rose-500" : a.tone === "warning" ? "text-amber-500" : "text-indigo-500"} />
                    <div><div className="text-slate-700 dark:text-slate-200">{a.text}</div><div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{a.time}</div></div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[12px] font-bold text-white">DK</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 pb-14 sm:p-6">
          {tab === "overview" && <Overview goTo={goTo} palette={palette} />}
          {tab === "subscribers" && <Subscribers />}
          {tab === "billing" && <BillingAdmin palette={palette} />}
          {tab === "network" && <NetworkAdmin />}
          {tab === "tickets" && <TicketsAdmin />}
          {tab === "fieldops" && <FieldOps />}
          {tab === "plans" && <PlansAdmin />}
          {tab === "reports" && <ReportsAdmin palette={palette} />}
          {tab === "staff" && <StaffAdmin />}
        </main>
      </div>
    </div>
  );
}
