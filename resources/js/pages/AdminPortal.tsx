import React, { useEffect, useMemo, useState } from "react";
import {
  Zap, Users, CreditCard, Router, MessageSquare, Wrench, Package, BarChart3,
  ShieldCheck, Bell, Search, ChevronRight, Plus, X, CheckCircle2, AlertTriangle,
  Activity, Signal, MapPin, Download, Play, Ban, UserPlus,
  Trash2, Server, Cable, Radio, Wifi,
  ClipboardList, LogOut, Home, DollarSign, FileWarning, Menu, Loader2, RefreshCcw,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { useTheme, chartPalette } from "../lib/theme";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { LoginScreen } from "../components/auth/LoginScreen";
import { useStaffAuth } from "../lib/useAuth";
import { useApiResource } from "../lib/useApiResource";
import { staffApi } from "../lib/staffApi";
import { ApiError } from "../lib/api";
import type {
  DashboardData, Invoice, NetworkNode, Plan, ReportsData, StaffUser,
  SubscriberUser, Technician, Ticket, WorkOrder,
} from "../lib/types";
import {
  Card, CardHead, Eyebrow, Badge, Tone, PrimaryButton, GhostButton, IconButton,
  LinkButton, SearchInput, SelectInput, FieldLabel, FieldInput, FieldSelect,
  Modal, ModalActions, ProfileRow,
} from "../components/ui/primitives";

/* ============================== static mock data (no backend for these yet) ============================== */

const OUTAGES = [
  { id: "OUT-118", node: "OLT-Ngong-04", start: "18:42", duration: "ongoing", affected: 214, status: "active" },
  { id: "OUT-117", node: "tower-westlands-1", start: "Jul 26, 02:10", duration: "47 min", affected: 88, status: "resolved" },
  { id: "OUT-116", node: "core-nbo-02", start: "Jul 21, 14:05", duration: "12 min", affected: 1840, status: "resolved" },
];

const AUDIT_LOG = [
  { id: 1, actor: "Daniel Kimani", action: "Suspended subscriber SUB-1045", time: "12 min ago" },
  { id: 2, actor: "Purity Nyambura", action: "Issued refund on INV-9902", time: "1 hr ago" },
  { id: 3, actor: "System", action: "Auto-generated billing run for Jul cycle", time: "Today, 03:00" },
];

const NAV = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "subscribers", label: "Subscribers", icon: Users },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "network", label: "Network", icon: Router },
  { key: "tickets", label: "Support queue", icon: MessageSquare },
  { key: "fieldops", label: "Field ops", icon: Wrench },
  { key: "plans", label: "Plans", icon: Package },
  { key: "hotspot", label: "Hotspot", icon: Wifi },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "staff", label: "Staff & access", icon: ShieldCheck, adminOnly: true },
];

/* ============================== HELPERS ============================== */

const fmtUSD = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n: number) => n.toLocaleString();

const STATUS_TONE: Record<string, Tone> = {
  active: "success", online: "success", paid: "success", completed: "success", resolved: "success", available: "success",
  scheduled: "info", "in-progress": "info",
  open: "warning", degraded: "warning", due: "warning", "on-job": "warning",
  suspended: "neutral", "off-duty": "neutral", archived: "neutral", cancelled: "neutral", expired: "neutral",
  overdue: "danger", offline: "danger", revoked: "danger",
};

const PRIORITY_TONE: Record<string, Tone> = {
  urgent: "danger", high: "warning", medium: "info", low: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active", online: "Online", paid: "Paid", completed: "Completed", resolved: "Resolved",
  available: "Available", scheduled: "Scheduled", "in-progress": "In progress", open: "Open",
  degraded: "Degraded", due: "Due", "on-job": "On job", suspended: "Suspended", "off-duty": "Off duty",
  archived: "Archived", overdue: "Overdue", offline: "Offline", cancelled: "Cancelled",
  expired: "Expired", revoked: "Revoked",
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

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500 dark:text-slate-400">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <AlertTriangle size={20} className="text-rose-500" />
      <div className="text-sm text-slate-600 dark:text-slate-300">{message}</div>
      <GhostButton size="sm" onClick={onRetry}><RefreshCcw size={13} /> Retry</GhostButton>
    </div>
  );
}

function SimulatedTag() {
  return (
    <span
      className="ml-1.5 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400"
      title="No live data source exists for this number yet — shown for illustration only."
    >
      Simulated
    </span>
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
  const { data, loading, error, reload } = useApiResource<DashboardData>(() => staffApi.dashboard.get(), []);
  const { data: nodes } = useApiResource<{ data: NetworkNode[] }>(() => staffApi.networkNodes.list(), []);

  if (loading) return <LoadingBlock label="Loading dashboard…" />;
  if (error || !data) return <ErrorBlock message={error ?? "Couldn't load the dashboard."} onRetry={reload} />;

  const kpiCards = [
    { key: "active_subscribers", label: "Active subscribers", icon: Users, fmt: fmtInt },
    { key: "mrr", label: "MRR", icon: DollarSign, fmt: fmtUSD },
    { key: "active_sessions", label: "Active sessions", icon: Radio, fmt: fmtInt },
    { key: "network_uptime_pct", label: "Network uptime", icon: Signal, fmt: (v: number) => `${v}%` },
    { key: "open_tickets", label: "Open tickets", icon: MessageSquare, fmt: fmtInt },
    { key: "overdue_accounts", label: "Overdue accounts", icon: FileWarning, fmt: fmtInt },
  ] as const;

  const planColors = [palette.indigo, palette.emerald, palette.amber, palette.rose, palette.violet];
  const nodeList = nodes?.data ?? [];
  const alerts = [
    ...nodeList.filter((n) => n.status === "offline").map((n) => ({ tone: "danger" as Tone, text: `${n.identifier} offline — ${n.subscriber_count} subscribers affected` })),
    ...nodeList.filter((n) => n.status === "degraded").map((n) => ({ tone: "warning" as Tone, text: `${n.identifier} degraded — ${n.load_pct}% load` })),
  ];
  if (data.kpis.overdue_accounts.value && data.kpis.overdue_accounts.value > 0) {
    alerts.push({ tone: "warning" as Tone, text: `${data.kpis.overdue_accounts.value} accounts are currently overdue` });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((k) => {
          const metric = data.kpis[k.key];
          return (
            <Card className="!p-3.5" key={k.key}>
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                  <k.icon size={15} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xl font-bold text-slate-900 dark:text-slate-100">
                {metric.value !== null ? k.fmt(metric.value) : "—"}
                {metric.source === "illustrative" && <SimulatedTag />}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{k.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHead
            eyebrow="Revenue — last 6 months"
            title={<div className="text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(data.kpis.mrr.value ?? 0)}<span className="ml-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">MRR</span></div>}
          />
          <div style={{ width: "100%", height: 200, marginTop: 8 }}>
            <ResponsiveContainer>
              <AreaChart data={data.revenue_trend}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.indigo} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={palette.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtUSD(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke={palette.indigo} strokeWidth={2} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Eyebrow>Plan mix</Eyebrow>
          <div style={{ width: "100%", height: 160, marginTop: 4 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.plan_mix} dataKey="subscriber_count" nameKey="plan_name" innerRadius={42} outerRadius={64} paddingAngle={3}>
                  {data.plan_mix.map((_, i) => <Cell key={i} fill={planColors[i % planColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number, n: string) => [fmtInt(v), n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {data.plan_mix.map((p, i) => (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" key={p.plan_id}>
                <span className="h-2 w-2 rounded-sm" style={{ background: planColors[i % planColors.length] }} /> {p.plan_name}
                <span className="ml-auto font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{fmtInt(p.subscriber_count)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHead
            eyebrow={`Fleet health — ${nodeList.filter((n) => n.status !== "online").length} node(s) need attention`}
            action={<LinkButton className="mt-0" onClick={() => goTo("network")}>Open network <ChevronRight size={14} /></LinkButton>}
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {nodeList.map((n) => (
              <span key={n.id} title={`${n.identifier} — ${n.status}`} className={`h-3.5 w-3.5 rounded-[4px] ${n.status === "online" ? "bg-emerald-500" : n.status === "degraded" ? "bg-amber-500" : "animate-pulse bg-rose-500"}`} />
            ))}
          </div>
          <div style={{ width: "100%", height: 140, marginTop: 14 }}>
            <ResponsiveContainer>
              <LineChart data={data.subscriber_growth}>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtInt(v), "Subscribers"]} />
                <Line type="monotone" dataKey="total_subscribers" stroke={palette.emerald} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Subscriber growth, last 6 months</div>
        </Card>

        <Card>
          <CardHead eyebrow="Live alerts" action={<Bell size={15} className="text-slate-400" />} />
          <div className="mt-1.5 flex flex-col gap-2.5">
            {alerts.length === 0 && <div className="text-[12.5px] text-slate-500 dark:text-slate-400">No active alerts — everything looks healthy.</div>}
            {alerts.map((a, i) => (
              <div className="flex items-start gap-2.5" key={i}>
                <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${a.tone === "danger" ? "bg-rose-500" : "bg-amber-500"}`} />
                <div className="text-[12.5px] text-slate-700 dark:text-slate-200">{a.text}</div>
              </div>
            ))}
          </div>
          <LinkButton onClick={() => goTo("network")}>View network <ChevronRight size={14} /></LinkButton>
        </Card>
      </div>
    </div>
  );
}

/* ============================== SUBSCRIBERS ============================== */

function Subscribers() {
  const [qInput, setQInput] = useState("");
  const q = useDebounced(qInput);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<SubscriberUser | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, loading, error, reload } = useApiResource(
    () => staffApi.subscribers.list({ search: q || undefined, status: status === "all" ? undefined : status, page }),
    [q, status, page],
  );
  const { data: plansData } = useApiResource(() => staffApi.plans.list({ status: "active" }), []);
  const plans = plansData?.data ?? [];

  useEffect(() => setPage(1), [q, status]);

  const toggleStatus = async (subscriber: SubscriberUser) => {
    const next = subscriber.status === "suspended" ? "active" : "suspended";
    await staffApi.subscribers.update(subscriber.id, { status: next });
    setDetail((d) => (d && d.id === subscriber.id ? { ...d, status: next } : d));
    reload();
  };

  const [formData, setFormData] = useState({ name: "", email: "", password: "", plan_id: "", status: "active", service_address: "", zone: "", monthly_bill: "" });

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await staffApi.subscribers.create({
        ...formData,
        plan_id: formData.plan_id || null,
        monthly_bill: parseFloat(formData.monthly_bill || "0"),
      });
      setAddOpen(false);
      setFormData({ name: "", email: "", password: "", plan_id: "", status: "active", service_address: "", zone: "", monthly_bill: "" });
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't create the subscriber.");
    } finally {
      setSaving(false);
    }
  };

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={qInput} onChange={setQInput} placeholder="Search name, email, or ID…" icon={<Search size={15} />} />
        <SelectInput value={status} onChange={setStatus} options={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "overdue", label: "Overdue" },
          { value: "suspended", label: "Suspended" },
          { value: "cancelled", label: "Cancelled" },
        ]} />
        <PrimaryButton size="sm" className="ml-auto" onClick={() => setAddOpen(true)}>
          <UserPlus size={14} /> Add subscriber
        </PrimaryButton>
      </div>

      <Card className="!p-2 sm:!p-2.5">
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr_1fr_0.5fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <div>Subscriber</div><div>Plan</div><div>Status</div><div>Bill</div><div>Zone</div><div>Last payment</div><div />
              </div>
              {rows.map((r) => (
                <div
                  className="grid cursor-pointer grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr_1fr_0.5fr] items-center gap-2.5 rounded-lg border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  key={r.id}
                  onClick={() => setDetail(r)}
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">SUB-{r.id} · {r.zone}</div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{r.plan?.name ?? "—"}</div>
                  <div><StatusBadge status={r.status} /></div>
                  <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtUSD(r.monthly_bill)}</div>
                  <div className="text-slate-600 dark:text-slate-300">{r.zone}</div>
                  <div className="text-slate-600 dark:text-slate-300">{r.last_payment_at ? new Date(r.last_payment_at).toLocaleDateString() : "—"}</div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <IconButton onClick={() => toggleStatus(r)} title={r.status === "suspended" ? "Reactivate" : "Suspend"}>
                      {r.status === "suspended" ? <Play size={14} /> : <Ban size={14} />}
                    </IconButton>
                  </div>
                </div>
              ))}
              {rows.length === 0 && <div className="p-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No subscribers match this search.</div>}
            </div>
          </div>
        )}
        {data && data.meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-2.5 pt-2.5 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Page {data.meta.current_page} of {data.meta.last_page} · {fmtInt(data.meta.total)} subscribers</span>
            <div className="flex gap-1.5">
              <GhostButton size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</GhostButton>
              <GhostButton size="xs" disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</GhostButton>
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name} widthClass="max-w-lg">
        {detail && (
          <>
            <ProfileRow label="ID" first>SUB-{detail.id}</ProfileRow>
            <ProfileRow label="Email">{detail.email}</ProfileRow>
            <ProfileRow label="Plan">{detail.plan?.name ?? "—"}</ProfileRow>
            <ProfileRow label="Status"><StatusBadge status={detail.status} /></ProfileRow>
            <ProfileRow label="Monthly bill"><span className="font-mono text-xs font-semibold">{fmtUSD(detail.monthly_bill)}</span></ProfileRow>
            <ProfileRow label="Joined">{new Date(detail.joined_at).toLocaleDateString()}</ProfileRow>
            <ProfileRow label="Zone">{detail.zone}</ProfileRow>
            <ModalActions>
              <GhostButton size="sm" onClick={() => toggleStatus(detail)}>
                {detail.status === "suspended" ? <Play size={14} /> : <Ban size={14} />}
                {detail.status === "suspended" ? "Reactivate account" : "Suspend account"}
              </GhostButton>
            </ModalActions>
          </>
        )}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add subscriber">
        <form onSubmit={submitAdd}>
          {formError && <div className="mb-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{formError}</div>}
          <FieldLabel>Full name</FieldLabel>
          <FieldInput required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Timothy Ngugi" />
          <FieldLabel>Email</FieldLabel>
          <FieldInput required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" />
          <FieldLabel>Password</FieldLabel>
          <FieldInput required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Temporary password" />
          <FieldLabel>Plan</FieldLabel>
          <FieldSelect value={formData.plan_id} onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}>
            <option value="">No plan</option>
            {plans.map((p: Plan) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </FieldSelect>
          <FieldLabel>Service address</FieldLabel>
          <FieldInput required value={formData.service_address} onChange={(e) => setFormData({ ...formData, service_address: e.target.value })} placeholder="Street, area" />
          <FieldLabel>Zone</FieldLabel>
          <FieldInput required value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })} placeholder="e.g. Karen" />
          <FieldLabel>Monthly bill (USD)</FieldLabel>
          <FieldInput required type="number" step="0.01" value={formData.monthly_bill} onChange={(e) => setFormData({ ...formData, monthly_bill: e.target.value })} placeholder="79.99" />
          <PrimaryButton type="submit" disabled={saving} className="mt-3.5 w-full">
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Create subscriber"}
          </PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}

/* ============================== BILLING ============================== */

function BillingAdmin({ palette }: { palette: ReturnType<typeof chartPalette> }) {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payReference, setPayReference] = useState("");
  const [paying, setPaying] = useState(false);

  const { data, loading, error, reload } = useApiResource(
    () => staffApi.invoices.list({ status: status === "all" ? undefined : status, page }),
    [status, page],
  );

  const invoices = data?.data ?? [];
  const totalBilled = invoices.reduce((a, b) => a + b.amount, 0);
  const collected = invoices.filter((i) => i.status === "paid").reduce((a, b) => a + b.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((a, b) => a + b.amount, 0);

  const aging = useMemo(() => {
    const now = Date.now();
    const buckets = { current: 0, "1–30 days": 0, "31–60 days": 0, "60+ days": 0 };
    invoices.filter((i) => i.status !== "paid").forEach((i) => {
      const daysOverdue = Math.floor((now - new Date(i.due_at).getTime()) / 86400000);
      if (daysOverdue <= 0) buckets.current += i.amount;
      else if (daysOverdue <= 30) buckets["1–30 days"] += i.amount;
      else if (daysOverdue <= 60) buckets["31–60 days"] += i.amount;
      else buckets["60+ days"] += i.amount;
    });
    return Object.entries(buckets).map(([bucket, amount]) => ({ bucket, amount }));
  }, [invoices]);

  const openPay = (invoice: Invoice) => {
    setPayTarget(invoice);
    setPayAmount(String(invoice.amount));
    setPayReference("");
  };

  const submitPayment = async () => {
    if (!payTarget) return;
    setPaying(true);
    try {
      await staffApi.payments.record(payTarget.id, { amount: parseFloat(payAmount), reference: payReference || undefined });
      setPayTarget(null);
      reload();
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><Eyebrow>Billed (this page)</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(totalBilled)}</div></Card>
        <Card><Eyebrow>Collected</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(collected)}</div></Card>
        <Card><Eyebrow>Outstanding</Eyebrow><div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">{fmtUSD(outstanding)}</div></Card>
        <Card><Eyebrow>Total invoices</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtInt(data?.meta.total ?? 0)}</div></Card>
      </div>

      <Card>
        <CardHead eyebrow="Aging report" action={<div className="text-[11px] text-slate-500 dark:text-slate-400">from invoices on this page</div>} />
        <div style={{ width: "100%", height: 160, marginTop: 6 }}>
          <ResponsiveContainer>
            <BarChart data={aging} layout="vertical" margin={{ left: 12 }}>
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
            <SelectInput value={status} onChange={setStatus} options={[
              { value: "all", label: "All" }, { value: "paid", label: "Paid" },
              { value: "due", label: "Due" }, { value: "overdue", label: "Overdue" },
            ]} />
          }
        />
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="mt-2 overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <div>Invoice</div><div>Subscriber</div><div>Amount</div><div>Date</div><div>Status</div>
              </div>
              {invoices.map((i) => (
                <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={i.id}>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">INV-{i.id}</div>
                  <div className="text-slate-600 dark:text-slate-300">{i.subscriber?.name ?? "—"}</div>
                  <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtUSD(i.amount)}</div>
                  <div className="text-slate-600 dark:text-slate-300">{new Date(i.issued_at).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={i.status} />
                    {i.status !== "paid" && <IconButton title="Record payment" onClick={() => openPay(i)}><CreditCard size={13} /></IconButton>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data && data.meta.last_page > 1 && (
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-2.5 pt-2.5 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Page {data.meta.current_page} of {data.meta.last_page}</span>
            <div className="flex gap-1.5">
              <GhostButton size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</GhostButton>
              <GhostButton size="xs" disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</GhostButton>
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={payTarget ? `Record payment — INV-${payTarget.id}` : ""}>
        <FieldLabel>Amount (USD)</FieldLabel>
        <FieldInput type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
        <FieldLabel>Reference (optional)</FieldLabel>
        <FieldInput value={payReference} onChange={(e) => setPayReference(e.target.value)} placeholder="M-Pesa code, bank ref…" />
        <PrimaryButton className="mt-3.5 w-full" disabled={paying} onClick={submitPayment}>
          {paying ? <Loader2 size={14} className="animate-spin" /> : "Confirm payment"}
        </PrimaryButton>
      </Modal>
    </div>
  );
}

/* ============================== NETWORK ============================== */

function NetworkAdmin() {
  const [nodeDetail, setNodeDetail] = useState<NetworkNode | null>(null);
  const { data, loading, error, reload } = useApiResource(() => staffApi.networkNodes.list(), []);
  const nodes = data?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><Eyebrow>Nodes online</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{nodes.filter((n) => n.status === "online").length}/{nodes.length}</div></Card>
        <Card><Eyebrow>Avg. network load</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{nodes.length ? Math.round(nodes.reduce((a, n) => a + n.load_pct, 0) / nodes.length) : 0}%</div></Card>
        <Card><Eyebrow>Avg. uptime</Eyebrow><div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{nodes.length ? (nodes.reduce((a, n) => a + n.uptime_pct, 0) / nodes.length).toFixed(2) : "0"}%</div></Card>
        <Card><Eyebrow>Open outages</Eyebrow><div className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">{OUTAGES.filter((o) => o.status === "active").length}</div></Card>
      </div>

      <Card>
        <CardHead eyebrow="Infrastructure nodes" action={<MapPin size={15} className="text-slate-400" />} />
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {nodes.map((n) => {
              const Icon = nodeIcon[n.type] || Server;
              return (
                <button
                  key={n.id}
                  onClick={() => setNodeDetail(n)}
                  className={`rounded-xl border bg-slate-50 p-3 text-left transition hover:border-indigo-400 dark:bg-slate-800/60 ${n.status === "offline" ? "border-rose-400 dark:border-rose-600" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <div className="mb-1.5 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                    <Icon size={16} />
                    <span className={`h-2 w-2 rounded-full ${n.status === "online" ? "bg-emerald-500" : n.status === "degraded" ? "bg-amber-500" : "bg-rose-500"}`} />
                  </div>
                  <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{n.identifier}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{n.type} · {n.zone}</div>
                  <div className="my-2 h-[5px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${n.load_pct}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{n.load_pct}% load · {n.subscriber_count} subs</div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHead eyebrow="Outage log" action={<span className="text-[11px] text-slate-400">preview — not yet backed by data</span>} />
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

      <Modal open={!!nodeDetail} onClose={() => setNodeDetail(null)} title={nodeDetail?.identifier}>
        {nodeDetail && (
          <>
            <ProfileRow label="Type" first>{nodeDetail.type}</ProfileRow>
            <ProfileRow label="Zone">{nodeDetail.zone}</ProfileRow>
            <ProfileRow label="Status"><Badge tone={NODE_TONE[nodeDetail.status]}>{STATUS_LABEL[nodeDetail.status] ?? nodeDetail.status}</Badge></ProfileRow>
            <ProfileRow label="Uptime"><span className="font-mono text-xs font-semibold">{nodeDetail.uptime_pct}%</span></ProfileRow>
            <ProfileRow label="Load"><span className="font-mono text-xs font-semibold">{nodeDetail.load_pct}%</span></ProfileRow>
            <ProfileRow label="Subscribers served"><span className="font-mono text-xs font-semibold">{nodeDetail.subscriber_count}</span></ProfileRow>
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
  const [priority, setPriority] = useState("all");
  const [detail, setDetail] = useState<Ticket | null>(null);
  const { data, loading, error, reload } = useApiResource(
    () => staffApi.tickets.list({ priority: priority === "all" ? undefined : priority }),
    [priority],
  );
  const rows = data?.data ?? [];

  const resolve = async (id: number) => {
    await staffApi.tickets.update(id, { status: "resolved" });
    setDetail((d) => (d && d.id === id ? { ...d, status: "resolved" } : d));
    reload();
  };
  const assign = async (id: number) => {
    await staffApi.tickets.update(id, { status: "in-progress" });
    setDetail((d) => (d && d.id === id ? { ...d, status: "in-progress" } : d));
    reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <SelectInput value={priority} onChange={setPriority} options={[
          { value: "all", label: "All priorities" }, { value: "urgent", label: "Urgent" },
          { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
        ]} />
        <div className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">{rows.filter((t) => t.status !== "resolved").length} open of {rows.length}</div>
      </div>
      <Card className="!p-2 sm:!p-2.5">
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <div>Ticket</div><div>Subscriber</div><div>Priority</div><div>Assignee</div><div>SLA</div><div>Status</div>
              </div>
              {rows.map((t) => (
                <div
                  className="grid cursor-pointer grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr] items-center gap-2.5 rounded-lg border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  key={t.id}
                  onClick={() => setDetail(t)}
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{t.subject}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">TCK-{t.id}</div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{t.subscriber?.name ?? "—"}</div>
                  <div><PriorityBadge priority={t.priority} /></div>
                  <div className="text-slate-600 dark:text-slate-300">{t.assignee?.name ?? "Unassigned"}</div>
                  <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{t.sla_due_at ? new Date(t.sla_due_at).toLocaleDateString() : "—"}</div>
                  <div><StatusBadge status={t.status} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.subject} widthClass="max-w-lg">
        {detail && (
          <>
            <ProfileRow label="Ticket" first>TCK-{detail.id}</ProfileRow>
            <ProfileRow label="Subscriber">{detail.subscriber?.name ?? "—"}</ProfileRow>
            <ProfileRow label="Priority"><PriorityBadge priority={detail.priority} /></ProfileRow>
            <ProfileRow label="Assignee">{detail.assignee?.name ?? "Unassigned"}</ProfileRow>
            <ProfileRow label="Description">{detail.description}</ProfileRow>
            <ProfileRow label="Status"><StatusBadge status={detail.status} /></ProfileRow>
            {detail.status !== "resolved" && (
              <ModalActions>
                <GhostButton size="sm" onClick={() => assign(detail.id)}><Users size={14} /> Mark in progress</GhostButton>
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
  const { data: techData, loading: techLoading, error: techError, reload: reloadTechs } = useApiResource(() => staffApi.technicians.list(), []);
  const { data: woData, loading: woLoading, error: woError, reload: reloadOrders } = useApiResource(() => staffApi.workOrders.list({ per_page: 20 }), []);
  const [dispatchTarget, setDispatchTarget] = useState<WorkOrder | null>(null);
  const [technicianId, setTechnicianId] = useState("");
  const [dispatching, setDispatching] = useState(false);

  const technicians = techData?.data ?? [];
  const workOrders = woData?.data ?? [];

  const submitDispatch = async () => {
    if (!dispatchTarget || !technicianId) return;
    setDispatching(true);
    try {
      await staffApi.workOrders.dispatch(dispatchTarget.id, parseInt(technicianId, 10));
      setDispatchTarget(null);
      setTechnicianId("");
      reloadOrders();
      reloadTechs();
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead eyebrow="Technicians" />
        {techLoading && <LoadingBlock />}
        {techError && !techLoading && <ErrorBlock message={techError} onRetry={reloadTechs} />}
        {!techLoading && !techError && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {technicians.map((t: Technician) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60" key={t.id}>
                <div className="flex items-center justify-between">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                    {(t.name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.zone} zone · {t.jobs_done_today} jobs today</div>
                <div className="mt-1.5 text-[12.5px] text-slate-600 dark:text-slate-300">{t.current_job_description ?? "—"}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHead eyebrow="Work orders" />
        {woLoading && <LoadingBlock />}
        {woError && !woLoading && <ErrorBlock message={woError} onRetry={reloadOrders} />}
        {!woLoading && !woError && (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <div>Order</div><div>Target</div><div>Technician</div><div>When</div><div>Status</div>
              </div>
              {workOrders.map((w: WorkOrder) => (
                <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_0.9fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={w.id}>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">WO-{w.id}</div>
                    <div className="text-[11px] text-slate-500 capitalize dark:text-slate-400">{w.type}</div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {"subscriber_id" in w.target ? w.target.name : w.target.lead_name}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{w.address}</div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{w.technician?.name ?? "Unassigned"}</div>
                  <div className="text-slate-600 dark:text-slate-300">{new Date(w.scheduled_at).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={w.status} />
                    {w.status === "scheduled" && !w.technician_id && (
                      <IconButton title="Dispatch" onClick={() => setDispatchTarget(w)}><Wrench size={13} /></IconButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!dispatchTarget} onClose={() => setDispatchTarget(null)} title={dispatchTarget ? `Dispatch — WO-${dispatchTarget.id}` : ""}>
        <FieldLabel>Technician</FieldLabel>
        <FieldSelect value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
          <option value="">Select a technician</option>
          {technicians.filter((t: Technician) => t.status === "available").map((t: Technician) => (
            <option key={t.id} value={t.id}>{t.name} ({t.zone})</option>
          ))}
        </FieldSelect>
        <PrimaryButton className="mt-3.5 w-full" disabled={!technicianId || dispatching} onClick={submitDispatch}>
          {dispatching ? <Loader2 size={14} className="animate-spin" /> : "Dispatch"}
        </PrimaryButton>
      </Modal>
    </div>
  );
}

/* ============================== PLANS ============================== */

function PlansAdmin() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", download_mbps: "", upload_mbps: "", price: "" });
  const { data, loading, error, reload } = useApiResource(() => staffApi.plans.list(), []);
  const plans = data?.data ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await staffApi.plans.create({
        name: formData.name,
        download_mbps: parseInt(formData.download_mbps, 10),
        upload_mbps: parseInt(formData.upload_mbps, 10),
        price: parseFloat(formData.price),
      });
      setOpen(false);
      setFormData({ name: "", download_mbps: "", upload_mbps: "", price: "" });
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't create the plan.");
    } finally {
      setSaving(false);
    }
  };

  const archive = async (id: number) => {
    await staffApi.plans.update(id, { status: "archived" });
    reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        {loading ? (
          <div className="text-[13px] text-slate-500 dark:text-slate-400">Loading…</div>
        ) : (
          <div className="text-[13px] text-slate-600 dark:text-slate-300">{plans.filter((p) => p.status === "active").length} active plans · {fmtInt(plans.reduce((a, b) => a + (b.subscribers_count ?? 0), 0))} subscribers total</div>
        )}
        <PrimaryButton size="sm" className="ml-auto" onClick={() => setOpen(true)}><Plus size={14} /> New plan</PrimaryButton>
      </div>
      {error && !loading && <Card><ErrorBlock message={error} onRetry={reload} /></Card>}
      {!error && (
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHead
                title={<div className="text-base font-bold text-slate-900 dark:text-slate-100">{p.name}</div>}
                action={<StatusBadge status={p.status} />}
              />
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.download_mbps}/{p.upload_mbps} Mbps</div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(p.price)}<span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/mo</span></div>
              <div className="text-[13px] text-slate-600 dark:text-slate-300">{fmtInt(p.subscribers_count ?? 0)} subscribers</div>
              {p.status === "active" && (
                <ModalActions>
                  <GhostButton size="sm" onClick={() => archive(p.id)}><Trash2 size={14} /> Archive</GhostButton>
                </ModalActions>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create plan">
        <form onSubmit={submit}>
          {formError && <div className="mb-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{formError}</div>}
          <FieldLabel>Plan name</FieldLabel>
          <FieldInput required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Fiber 750" />
          <FieldLabel>Download (Mbps)</FieldLabel>
          <FieldInput required type="number" value={formData.download_mbps} onChange={(e) => setFormData({ ...formData, download_mbps: e.target.value })} placeholder="750" />
          <FieldLabel>Upload (Mbps)</FieldLabel>
          <FieldInput required type="number" value={formData.upload_mbps} onChange={(e) => setFormData({ ...formData, upload_mbps: e.target.value })} placeholder="750" />
          <FieldLabel>Monthly price (USD)</FieldLabel>
          <FieldInput required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="99.99" />
          <PrimaryButton type="submit" disabled={saving} className="mt-3.5 w-full">
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Create plan"}
          </PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}

function HotspotAdmin() {
  const { data: plansData, loading: plansLoading, error: plansError, reload: reloadPlans } = useApiResource(() => staffApi.hotspotPlans.list(), []);
  const { data: sessionsData, loading: sessionsLoading, error: sessionsError, reload: reloadSessions } = useApiResource(() => staffApi.hotspotSessions.list(), []);
  const plans = plansData?.data ?? [];
  const sessions = sessionsData?.data ?? [];

  const [planOpen, setPlanOpen] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [planFormError, setPlanFormError] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState({ name: "", duration_minutes: "", price: "" });

  const [grantOpen, setGrantOpen] = useState(false);
  const [grantSaving, setGrantSaving] = useState(false);
  const [grantFormError, setGrantFormError] = useState<string | null>(null);
  const [grantFormData, setGrantFormData] = useState({ mac_address: "", hotspot_plan_id: "", payment_reference: "" });

  const submitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanFormError(null);
    setPlanSaving(true);
    try {
      await staffApi.hotspotPlans.create({
        name: planFormData.name,
        duration_minutes: parseInt(planFormData.duration_minutes, 10),
        price: parseFloat(planFormData.price),
      });
      setPlanOpen(false);
      setPlanFormData({ name: "", duration_minutes: "", price: "" });
      reloadPlans();
    } catch (err) {
      setPlanFormError(err instanceof ApiError ? err.message : "Couldn't create the pass.");
    } finally {
      setPlanSaving(false);
    }
  };

  const archivePlan = async (id: number) => {
    await staffApi.hotspotPlans.update(id, { status: "archived" });
    reloadPlans();
  };

  const submitGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantFormError(null);
    setGrantSaving(true);
    try {
      await staffApi.hotspotSessions.create({
        mac_address: grantFormData.mac_address,
        hotspot_plan_id: parseInt(grantFormData.hotspot_plan_id, 10),
        payment_reference: grantFormData.payment_reference || undefined,
      });
      setGrantOpen(false);
      setGrantFormData({ mac_address: "", hotspot_plan_id: "", payment_reference: "" });
      reloadSessions();
    } catch (err) {
      setGrantFormError(err instanceof ApiError ? err.message : "Couldn't grant the session.");
    } finally {
      setGrantSaving(false);
    }
  };

  const revoke = async (id: number) => {
    await staffApi.hotspotSessions.revoke(id);
    reloadSessions();
  };

  const activeCount = sessions.filter((s) => s.status === "active").length;
  const todayRevenue = sessions
    .filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.amount_paid, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <Eyebrow>Active devices</Eyebrow>
          <div className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-100">{sessionsLoading ? "—" : fmtInt(activeCount)}</div>
        </Card>
        <Card>
          <Eyebrow>Revenue today</Eyebrow>
          <div className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-100">{sessionsLoading ? "—" : fmtUSD(todayRevenue)}</div>
        </Card>
        <Card>
          <Eyebrow>Total passes sold</Eyebrow>
          <div className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-100">{sessionsLoading ? "—" : fmtInt(sessions.length)}</div>
        </Card>
      </div>

      <Card>
        <CardHead
          eyebrow="Passes"
          action={<PrimaryButton size="sm" onClick={() => setPlanOpen(true)}><Plus size={14} /> New pass</PrimaryButton>}
        />
        {plansError && !plansLoading && <ErrorBlock message={plansError} onRetry={reloadPlans} />}
        {plansLoading && <LoadingBlock />}
        {!plansLoading && !plansError && (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {plans.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardHead
                  title={<div className="text-base font-bold text-slate-900 dark:text-slate-100">{p.name}</div>}
                  action={<StatusBadge status={p.status} />}
                />
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.duration_minutes} min</div>
                <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(p.price)}</div>
                <div className="text-[13px] text-slate-600 dark:text-slate-300">{fmtInt(p.sessions_count ?? 0)} sold</div>
                {p.status === "active" && (
                  <ModalActions>
                    <GhostButton size="sm" onClick={() => archivePlan(p.id)}><Trash2 size={14} /> Archive</GhostButton>
                  </ModalActions>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHead
          eyebrow="Active sessions"
          action={<GhostButton size="sm" onClick={() => setGrantOpen(true)}><UserPlus size={14} /> Grant session</GhostButton>}
        />
        {sessionsError && !sessionsLoading && <ErrorBlock message={sessionsError} onRetry={reloadSessions} />}
        {sessionsLoading && <LoadingBlock />}
        {!sessionsLoading && !sessionsError && (
          <div className="mt-2 overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.2fr_1fr_0.9fr_1.1fr_0.9fr_0.7fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <div>MAC address</div><div>Pass</div><div>Amount</div><div>Expires</div><div>Status</div><div></div>
              </div>
              {sessions.slice(0, 50).map((s) => (
                <div className="grid grid-cols-[1.2fr_1fr_0.9fr_1.1fr_0.9fr_0.7fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={s.id}>
                  <div className="font-mono text-slate-800 dark:text-slate-100">{s.mac_address}</div>
                  <div className="text-slate-600 dark:text-slate-300">{s.plan?.name ?? "—"}</div>
                  <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtUSD(s.amount_paid)}</div>
                  <div className="text-slate-600 dark:text-slate-300">{new Date(s.expires_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  <StatusBadge status={s.status} />
                  <div>
                    {s.status === "active" && <GhostButton size="xs" onClick={() => revoke(s.id)}><Ban size={12} /> Revoke</GhostButton>}
                  </div>
                </div>
              ))}
              {sessions.length === 0 && <div className="p-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No sessions yet.</div>}
            </div>
          </div>
        )}
      </Card>

      <Modal open={planOpen} onClose={() => setPlanOpen(false)} title="Create hotspot pass">
        <form onSubmit={submitPlan}>
          {planFormError && <div className="mb-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{planFormError}</div>}
          <FieldLabel>Pass name</FieldLabel>
          <FieldInput required value={planFormData.name} onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })} placeholder="e.g. 6 Hours" />
          <FieldLabel>Duration (minutes)</FieldLabel>
          <FieldInput required type="number" value={planFormData.duration_minutes} onChange={(e) => setPlanFormData({ ...planFormData, duration_minutes: e.target.value })} placeholder="360" />
          <FieldLabel>Price (USD)</FieldLabel>
          <FieldInput required type="number" step="0.01" value={planFormData.price} onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })} placeholder="2.00" />
          <PrimaryButton type="submit" disabled={planSaving} className="mt-3.5 w-full">
            {planSaving ? <Loader2 size={14} className="animate-spin" /> : "Create pass"}
          </PrimaryButton>
        </form>
      </Modal>

      <Modal open={grantOpen} onClose={() => setGrantOpen(false)} title="Grant a session manually">
        <form onSubmit={submitGrant}>
          {grantFormError && <div className="mb-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{grantFormError}</div>}
          <FieldLabel>Device MAC address</FieldLabel>
          <FieldInput required value={grantFormData.mac_address} onChange={(e) => setGrantFormData({ ...grantFormData, mac_address: e.target.value })} placeholder="AA:BB:CC:DD:EE:FF" />
          <FieldLabel>Pass</FieldLabel>
          <FieldSelect required value={grantFormData.hotspot_plan_id} onChange={(e) => setGrantFormData({ ...grantFormData, hotspot_plan_id: e.target.value })}>
            <option value="">Select a pass…</option>
            {plans.filter((p) => p.status === "active").map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {fmtUSD(p.price)}</option>
            ))}
          </FieldSelect>
          <FieldLabel>Reference (optional)</FieldLabel>
          <FieldInput value={grantFormData.payment_reference} onChange={(e) => setGrantFormData({ ...grantFormData, payment_reference: e.target.value })} placeholder="Comp, walk-in, etc." />
          <PrimaryButton type="submit" disabled={grantSaving} className="mt-3.5 w-full">
            {grantSaving ? <Loader2 size={14} className="animate-spin" /> : "Grant session"}
          </PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}

/* ============================== REPORTS ============================== */

function ReportsAdmin({ palette }: { palette: ReturnType<typeof chartPalette> }) {
  const { data, loading, error, reload } = useApiResource<ReportsData>(() => staffApi.reports.get(), []);

  if (loading) return <LoadingBlock label="Loading reports…" />;
  if (error || !data) return <ErrorBlock message={error ?? "Couldn't load reports."} onRetry={reload} />;

  const ratios = [
    { key: "arpu", label: "ARPU", fmt: (v: number) => `$${v.toFixed(2)}` },
    { key: "monthly_churn_pct", label: "Monthly churn", fmt: (v: number) => `${v}%` },
    { key: "cac", label: "CAC", fmt: (v: number) => `$${v.toFixed(2)}` },
    { key: "avg_install_time_hours", label: "Avg. install time", fmt: (v: number) => `${v}h` },
    { key: "nps", label: "NPS", fmt: (v: number) => `+${v}` },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <Eyebrow>Revenue trend</Eyebrow>
          <div style={{ width: "100%", height: 220, marginTop: 8 }}>
            <ResponsiveContainer>
              <LineChart data={data.revenue_vs_churn}>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle(palette)} />
                <Line type="monotone" dataKey="revenue" stroke={palette.indigo} strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <Eyebrow>Key ratios</Eyebrow>
          {ratios.map((r, i) => {
            const metric = data.key_ratios[r.key];
            return (
              <ProfileRow label={r.label} key={r.key} first={i === 0}>
                <span className="flex items-center font-mono text-sm font-semibold">
                  {metric.value !== null ? r.fmt(metric.value) : "—"}
                  {metric.source === "illustrative" && <SimulatedTag />}
                </span>
              </ProfileRow>
            );
          })}
        </Card>
      </div>
      <Card>
        <CardHead eyebrow="Subscriber growth by zone" action={<GhostButton size="sm"><Download size={14} /> Export CSV</GhostButton>} />
        <div style={{ width: "100%", height: 200, marginTop: 8 }}>
          <ResponsiveContainer>
            <BarChart data={data.subscriber_growth_by_zone}>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis dataKey="zone" tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: palette.axis }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={tooltipStyle(palette)} formatter={(v: number) => [fmtInt(v), "Subscribers"]} />
              <Bar dataKey="subscriber_count" radius={[4, 4, 0, 0]} fill={palette.emerald} />
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
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "support" });
  const { data, loading, error, reload } = useApiResource(() => staffApi.staff.list(), []);
  const rows = data?.data ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await staffApi.staff.create(formData);
      setInviteOpen(false);
      setFormData({ name: "", email: "", password: "", role: "support" });
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't create the staff account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead eyebrow="Staff accounts" action={<PrimaryButton size="sm" onClick={() => setInviteOpen(true)}><UserPlus size={14} /> Invite staff</PrimaryButton>} />
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_1fr] gap-2.5 px-2.5 py-2 text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <div>Name</div><div>Email</div><div>Role</div><div>Last active</div>
              </div>
              {rows.map((s: StaffUser) => (
                <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_1fr] items-center gap-2.5 border-t border-slate-100 px-2.5 py-2.5 text-[12.5px] dark:border-slate-800" key={s.id}>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</div>
                  <div className="text-slate-600 dark:text-slate-300">{s.email}</div>
                  <div><span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">{s.role}</span></div>
                  <div className="text-slate-600 dark:text-slate-300">{s.last_active_at ? new Date(s.last_active_at).toLocaleDateString() : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        <form onSubmit={submit}>
          {formError && <div className="mb-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{formError}</div>}
          <FieldLabel>Full name</FieldLabel>
          <FieldInput required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Purity Nyambura" />
          <FieldLabel>Email</FieldLabel>
          <FieldInput required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@latticefi.com" />
          <FieldLabel>Temporary password</FieldLabel>
          <FieldInput required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <FieldLabel>Role</FieldLabel>
          <FieldSelect value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="admin">Admin</option><option value="billing">Billing</option><option value="noc">NOC</option><option value="support">Support</option><option value="technician">Technician</option>
          </FieldSelect>
          <PrimaryButton type="submit" disabled={saving} className="mt-3.5 w-full">
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Send invite"}
          </PrimaryButton>
        </form>
      </Modal>
    </div>
  );
}

/* ============================== SHELL ============================== */

function NavList({ tab, onSelect, role }: { tab: string; onSelect: (k: string) => void; role?: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.filter((n) => !n.adminOnly || role === "admin").map((n) => (
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

function AdminConsole({ user, logout }: { user: StaffUser; logout: () => Promise<void> }) {
  const [tab, setTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const palette = useMemo(() => chartPalette(theme), [theme]);

  const goTo = (key: string) => { setTab(key); setMobileNavOpen(false); };
  const initials = (user?.name ?? "??").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-56 flex-shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-white p-3 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={15} strokeWidth={2.5} /></div>
          <span className="text-[14.5px] font-bold">Latticefi</span>
          <span className="ml-auto text-[10px] font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">Ops</span>
        </div>
        <NavList tab={tab} onSelect={setTab} role={user?.role} />
        <div className="mt-auto border-t border-slate-200 pt-3 dark:border-slate-800">
          <button onClick={() => logout()} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-100 flex lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="relative flex h-full w-64 flex-col gap-5 border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={15} strokeWidth={2.5} /></div>
              <span className="text-[14.5px] font-bold">Latticefi</span>
              <IconButton className="ml-auto" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={16} /></IconButton>
            </div>
            <NavList tab={tab} onSelect={goTo} role={user?.role} />
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
              <div className="absolute top-11 right-0 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Check the Overview tab's Live Alerts panel for current issues.
              </div>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[12px] font-bold text-white">{initials}</div>
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
          {tab === "hotspot" && <HotspotAdmin />}
          {tab === "reports" && <ReportsAdmin palette={palette} />}
          {tab === "staff" && user?.role === "admin" && <StaffAdmin />}
        </main>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const { status, user, login, logout } = useStaffAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={22} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === "guest" || !user) {
    return (
      <LoginScreen
        title="Admin Console"
        subtitle="Sign in with your staff account"
        emailPlaceholder="you@latticefi.com"
        onSubmit={login}
      />
    );
  }

  return <AdminConsole user={user} logout={logout} />;
}
