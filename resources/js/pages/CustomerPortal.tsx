import React, { useEffect, useState, useMemo } from "react";
import {
  Wifi, Zap, CreditCard, MessageSquare, Bell, ChevronRight,
  Download, Upload, Activity, CheckCircle2, Clock, Router,
  Smartphone, Laptop, Tv, Plus, X, Eye, EyeOff, Search, ArrowUpRight,
  Pause, Play, Gauge, FileText, ShieldCheck, User, LogOut, Home, Menu,
  Loader2, RefreshCcw, AlertTriangle, RotateCw, Pencil, Repeat, Ban, Trash2, AlertCircle,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTheme, chartPalette } from "../lib/theme";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { LoginScreen } from "../components/auth/LoginScreen";
import { ApiError } from "../lib/api";
import { useSubscriberAuth } from "../lib/useAuth";
import { useApiResource } from "../lib/useApiResource";
import { portalApi } from "../lib/portalApi";
import type { ConnectedDevice, Invoice, SubscriberUser, Ticket, UsageData, WifiNetwork } from "../lib/types";
import {
  Card, CardHead, Eyebrow, Badge, Tone, PrimaryButton, GhostButton, IconButton,
  LinkButton, SearchInput, FieldLabel, FieldInput, FieldTextarea, ToggleSwitch,
  Modal, ModalActions, ProfileRow,
} from "../components/ui/primitives";

/* --------------------------------- static (no live telemetry exists for these) --------------------------------- */

const CONNECTION = {
  uptimeDays: 14,
  download: 487,
  upload: 492,
  ping: 8,
  lastOutage: "12 days ago",
};

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
  overdue: "danger",
  open: "warning",
  "in-progress": "info",
  resolved: "success",
  cancelled: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  due: "Due",
  overdue: "Overdue",
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}

const deviceIcon: Record<string, any> = { tv: Tv, phone: Smartphone, laptop: Laptop, router: Router };

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

function SimulatedNote({ text }: { text: string }) {
  return <div className="mt-1 text-[10.5px] font-medium text-white/50">{text}</div>;
}

function FormError({ message }: { message: string }) {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
      {message}
    </div>
  );
}

function DangerButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    const first = err.errors && Object.values(err.errors)[0]?.[0];
    return first || err.message || fallback;
  }
  return fallback;
}

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

function jitter(base: number, pct: number) {
  const factor = 1 + (Math.random() * 2 - 1) * pct;
  return Math.max(1, Math.round(base * factor));
}

function Overview({ user, goTo, openPay }: { user: SubscriberUser; goTo: (k: string) => void; openPay: (i: Invoice) => void }) {
  const { data: invoiceData, loading: invLoading } = useApiResource(() => portalApi.invoices.list({ per_page: "50" }), []);
  const { data: ticketData, loading: tktLoading } = useApiResource(() => portalApi.tickets.list({ per_page: "50" }), []);
  const [testing, setTesting] = useState(false);
  const [speedResult, setSpeedResult] = useState<{ download: number; upload: number; ping: number } | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  const invoices = invoiceData?.data ?? [];
  const tickets = ticketData?.data ?? [];
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;
  const nextInvoice = invoices.find((i) => i.status === "due" || i.status === "overdue");

  const connection = speedResult ?? { download: CONNECTION.download, upload: CONNECTION.upload, ping: CONNECTION.ping };

  const runSpeedTest = () => {
    setTesting(true);
    setTimeout(() => {
      setSpeedResult({
        download: jitter(CONNECTION.download, 0.08),
        upload: jitter(CONNECTION.upload, 0.08),
        ping: jitter(CONNECTION.ping, 0.3),
      });
      setLastTested(new Date());
      setTesting(false);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero connection card — simulated, no live RADIUS/CPE telemetry in this system */}
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
              <div className="text-xl font-semibold">
                {testing ? <Loader2 size={18} className="animate-spin" /> : connection.download}
                {!testing && <span className="ml-1 text-[11px] font-medium text-white/55">Mbps</span>}
              </div>
              <div className="text-[11.5px] text-white/55">Download</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-white/90">
            <Upload size={16} strokeWidth={2.25} />
            <div>
              <div className="text-xl font-semibold">
                {testing ? <Loader2 size={18} className="animate-spin" /> : connection.upload}
                {!testing && <span className="ml-1 text-[11px] font-medium text-white/55">Mbps</span>}
              </div>
              <div className="text-[11.5px] text-white/55">Upload</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-white/90">
            <Activity size={16} strokeWidth={2.25} />
            <div>
              <div className="text-xl font-semibold">
                {testing ? <Loader2 size={18} className="animate-spin" /> : connection.ping}
                {!testing && <span className="ml-1 text-[11px] font-medium text-white/55">ms</span>}
              </div>
              <div className="text-[11.5px] text-white/55">Latency</div>
            </div>
          </div>
          <button
            onClick={runSpeedTest}
            disabled={testing}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 justify-self-start rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:border-white/30 hover:bg-white/20 disabled:opacity-60 sm:col-span-1 sm:justify-self-end"
          >
            {testing ? "Testing…" : "Run speed test"} <ArrowUpRight size={14} />
          </button>
        </div>
        <SimulatedNote
          text={
            lastTested
              ? `Simulated — last tested ${lastTested.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. No live RADIUS/CPE telemetry feed exists yet.`
              : "Simulated — this system has no live RADIUS/CPE telemetry feed yet."
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHead eyebrow="This billing cycle" action={<Gauge size={16} className="text-slate-400" />} />
          <div className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">See day-by-day download &amp; upload volume.</div>
          <LinkButton onClick={() => goTo("usage")}>View usage detail <ChevronRight size={14} /></LinkButton>
        </Card>

        <Card>
          <CardHead eyebrow="Current plan" action={<Zap size={16} className="text-slate-400" />} />
          <div className="mt-1 text-[17px] font-semibold text-slate-900 dark:text-slate-100">{user.plan?.name ?? "No plan assigned"}</div>
          <div className="text-[13px] text-slate-500 dark:text-slate-400">{user.zone}</div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(user.monthly_bill)}<span className="text-[11.5px] font-normal text-slate-500 dark:text-slate-400">/mo</span></div>
          <LinkButton onClick={() => goTo("profile")}>Manage plan <ChevronRight size={14} /></LinkButton>
        </Card>

        <Card>
          <CardHead eyebrow="Next invoice" action={<CreditCard size={16} className="text-slate-400" />} />
          {invLoading ? (
            <div className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Loading…</div>
          ) : nextInvoice ? (
            <>
              <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{fmtUSD(nextInvoice.amount)}</div>
              <div className="text-[13px] text-slate-500 dark:text-slate-400">Due {new Date(nextInvoice.due_at).toLocaleDateString()}</div>
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
          <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
            {tktLoading ? "—" : openTickets}
            <span className="text-[11.5px] font-normal text-slate-500 dark:text-slate-400"> open ticket{openTickets !== 1 ? "s" : ""}</span>
          </div>
          <LinkButton onClick={() => goTo("support")}>Go to support <ChevronRight size={14} /></LinkButton>
        </Card>
        <Card>
          <CardHead eyebrow="Service address" action={<ShieldCheck size={16} className="text-slate-400" />} />
          <div className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-300">{user.service_address}</div>
          <div className="mt-1 text-[11.5px] text-slate-500 dark:text-slate-400">Subscriber since {new Date(user.joined_at).toLocaleDateString()}</div>
        </Card>
      </div>
    </div>
  );
}

function UsageTab({ palette }: { palette: ReturnType<typeof chartPalette> }) {
  const { data, loading, error, reload } = useApiResource<UsageData>(() => portalApi.usage.get(), []);

  if (loading) return <LoadingBlock label="Loading usage…" />;
  if (error || !data) return <ErrorBlock message={error ?? "Couldn't load usage data."} onRetry={reload} />;

  const chartData = data.daily.map((d, i) => ({ day: i + 1, gb: Math.round((d.download_gb + d.upload_gb) * 10) / 10, date: d.date }));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHead eyebrow="Daily usage — last 30 days" />
        <div style={{ width: "100%", height: 220, marginTop: 12 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} barGap={2}>
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
          <div className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">{data.stats.average_daily_gb}<span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">GB</span></div>
        </Card>
        <Card>
          <Eyebrow>Peak day</Eyebrow>
          <div className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">{data.stats.peak_daily_gb}<span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">GB</span></div>
        </Card>
        <Card>
          <Eyebrow>Projected cycle total</Eyebrow>
          <div className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">{data.stats.projected_total_gb}<span className="ml-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">GB</span></div>
        </Card>
      </div>
    </div>
  );
}

function BillingTab({ openPay }: { openPay: (i: Invoice) => void }) {
  const { data, loading, error, reload } = useApiResource(() => portalApi.invoices.list({ per_page: "50" }), []);
  const invoices = data?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Eyebrow>How payments work</Eyebrow>
        <div className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-300">
          Pay any due invoice below directly from your account. Payments are recorded instantly against the invoice's exact
          amount — reach out to support if you need to update your billing details.
        </div>
      </Card>

      <Card>
        <CardHead eyebrow="Invoice history" action={<FileText size={16} className="text-slate-400" />} />
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="mt-1 flex flex-col">
            {invoices.map((inv) => (
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800" key={inv.id}>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">INV-{inv.id}</div>
                  <div className="text-[11.5px] text-slate-500 dark:text-slate-400">{new Date(inv.issued_at).toLocaleDateString()}</div>
                </div>
                <div className="font-mono text-[15px] font-semibold text-slate-800 dark:text-slate-100">{fmtUSD(inv.amount)}</div>
                <StatusBadge status={inv.status} />
                <div className="flex items-center gap-2">
                  {inv.status !== "paid" && (
                    <PrimaryButton size="xs" onClick={() => openPay(inv)}>Pay</PrimaryButton>
                  )}
                </div>
              </div>
            ))}
            {invoices.length === 0 && <div className="p-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No invoices yet.</div>}
          </div>
        )}
      </Card>
    </div>
  );
}

function WifiTab() {
  const { data, loading, error, reload } = useApiResource<{ data: WifiNetwork }>(() => portalApi.wifi.get(), []);
  const { data: deviceData, loading: devLoading, error: devError, reload: reloadDevices } = useApiResource(() => portalApi.devices.list(), []);
  const [showPass, setShowPass] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [wifi, setWifi] = useState<WifiNetwork | null>(null);

  useEffect(() => { if (data) setWifi(data.data); }, [data]);

  const devices = deviceData?.data ?? [];

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const res = await portalApi.wifi.regeneratePassword();
      setWifi(res.data);
      setShowPass(true);
    } finally {
      setRegenerating(false);
    }
  };

  const togglePause = async (d: ConnectedDevice) => {
    await portalApi.devices.update(d.id, { is_paused: !d.is_paused });
    reloadDevices();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <Eyebrow>Network name (SSID)</Eyebrow>
          {loading ? <LoadingBlock /> : error || !wifi ? (
            <ErrorBlock message={error ?? "Couldn't load your Wi-Fi network."} onRetry={reload} />
          ) : (
            <div className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-100">{wifi.ssid}</div>
          )}
        </Card>
        <Card>
          <Eyebrow>Wi-Fi password</Eyebrow>
          {loading ? <LoadingBlock /> : error || !wifi ? (
            <ErrorBlock message={error ?? "Couldn't load your Wi-Fi network."} onRetry={reload} />
          ) : (
            <>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">{showPass ? wifi.wifi_password : "•".repeat(Math.max(wifi.wifi_password.length, 10))}</span>
                <IconButton onClick={() => setShowPass((s) => !s)} aria-label="Toggle password visibility">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              </div>
              <button
                onClick={regenerate}
                disabled={regenerating}
                className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />} Generate new password
              </button>
            </>
          )}
        </Card>
      </div>

      <Card>
        <CardHead eyebrow="Connected devices" action={<div className="text-[11.5px] text-slate-500 dark:text-slate-400">{devices.filter((d) => !d.is_paused).length} active · {devices.length} total</div>} />
        {devLoading && <LoadingBlock />}
        {devError && !devLoading && <ErrorBlock message={devError} onRetry={reloadDevices} />}
        {!devLoading && !devError && (
          <div className="mt-1 flex flex-col">
            {devices.map((d) => {
              const Icon = deviceIcon[d.type] || Smartphone;
              return (
                <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3.5 border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800" key={d.id}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"><Icon size={18} /></div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{d.name}</div>
                    <div className="text-[11.5px] text-slate-500 dark:text-slate-400">{d.ip_address} · connected {new Date(d.connected_since).toLocaleDateString()}</div>
                  </div>
                  <div className="font-mono text-[12.5px] text-slate-500 dark:text-slate-400">{d.usage_gb_cycle} GB</div>
                  {d.type !== "router" && (
                    <button
                      onClick={() => togglePause(d)}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold ${
                        d.is_paused
                          ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          : "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400"
                      }`}
                    >
                      {d.is_paused ? <Play size={13} /> : <Pause size={13} />}
                      {d.is_paused ? "Paused" : "Active"}
                    </button>
                  )}
                </div>
              );
            })}
            {devices.length === 0 && <div className="p-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No devices found on your network yet.</div>}
          </div>
        )}
      </Card>
    </div>
  );
}

function SupportTab() {
  const { data, loading, error, reload } = useApiResource(() => portalApi.tickets.list({ per_page: "50" }), []);
  const tickets = data?.data ?? [];
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    "Why is my speed slower in the evening?",
    "How do I reset my router?",
    "How do I change my Wi-Fi password?",
    "When is my bill due each month?",
  ];

  const submit = async () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      await portalApi.tickets.create({ subject: subject.trim(), description: desc.trim() });
      setSubject(""); setDesc(""); setOpen(false);
      reload();
    } finally {
      setSubmitting(false);
    }
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
        {loading && <LoadingBlock />}
        {error && !loading && <ErrorBlock message={error} onRetry={reload} />}
        {!loading && !error && (
          <div className="mt-1 flex flex-col">
            {tickets.map((t: Ticket) => (
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800" key={t.id}>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t.subject}</div>
                  <div className="text-[11.5px] text-slate-500 dark:text-slate-400">TCK-{t.id} · opened {new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
            {tickets.length === 0 && <div className="p-6 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No tickets yet.</div>}
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New support ticket">
        <FieldLabel>Subject</FieldLabel>
        <FieldInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe the issue" />
        <FieldLabel>Details</FieldLabel>
        <FieldTextarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add any details that could help support resolve this faster" />
        <PrimaryButton className="mt-3.5 w-full" disabled={submitting} onClick={submit}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : "Submit ticket"}
        </PrimaryButton>
      </Modal>
    </div>
  );
}

function EditProfileModal({
  user, onClose, onSaved,
}: {
  user: SubscriberUser;
  onClose: () => void;
  onSaved: (u: SubscriberUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.service_address);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await portalApi.profile.update({ name, email, phone: phone || null, service_address: address });
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit profile">
      {error && <FormError message={error} />}
      <FieldLabel>Name</FieldLabel>
      <FieldInput value={name} onChange={(e) => setName(e.target.value)} />
      <FieldLabel>Email</FieldLabel>
      <FieldInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <FieldLabel>Phone</FieldLabel>
      <FieldInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
      <FieldLabel>Service address</FieldLabel>
      <FieldInput value={address} onChange={(e) => setAddress(e.target.value)} />
      <PrimaryButton className="mt-3.5 w-full" disabled={submitting} onClick={submit}>
        {submitting ? <Loader2 size={14} className="animate-spin" /> : "Save changes"}
      </PrimaryButton>
    </Modal>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await portalApi.profile.updatePassword({ current_password: current, password: pw, password_confirmation: pwConfirm });
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Change password">
      {success ? (
        <div className="flex flex-col items-center gap-2.5 py-4 text-center">
          <CheckCircle2 size={28} className="text-emerald-500" />
          <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Password updated</div>
          <PrimaryButton size="sm" onClick={onClose}>Done</PrimaryButton>
        </div>
      ) : (
        <>
          {error && <FormError message={error} />}
          <FieldLabel>Current password</FieldLabel>
          <FieldInput type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <FieldLabel>New password</FieldLabel>
          <FieldInput type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <FieldLabel>Confirm new password</FieldLabel>
          <FieldInput type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
          <PrimaryButton className="mt-3.5 w-full" disabled={submitting} onClick={submit}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : "Update password"}
          </PrimaryButton>
        </>
      )}
    </Modal>
  );
}

function ChangePlanModal({
  user, onClose, onSaved,
}: {
  user: SubscriberUser;
  onClose: () => void;
  onSaved: (u: SubscriberUser) => void;
}) {
  const { data, loading, error: loadError, reload } = useApiResource(() => portalApi.plans.list(), []);
  const [selected, setSelected] = useState<number | null>(user.plan_id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plans = data?.data ?? [];
  const isResubscribe = user.status === "cancelled";

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await portalApi.plan.change(selected);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={isResubscribe ? "Resubscribe" : "Change plan"}>
      {error && <FormError message={error} />}
      {loading && <LoadingBlock />}
      {loadError && !loading && <ErrorBlock message={loadError} onRetry={reload} />}
      {!loading && !loadError && (
        <div className="flex flex-col gap-2">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                selected === p.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
              }`}
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                <div className="text-[11.5px] text-slate-500 dark:text-slate-400">{p.download_mbps}/{p.upload_mbps} Mbps</div>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">{fmtUSD(p.price)}/mo</div>
            </button>
          ))}
          {plans.length === 0 && <div className="p-4 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No plans available right now.</div>}
        </div>
      )}
      <div className="mt-3 text-[11.5px] text-slate-500 dark:text-slate-400">
        Takes effect on your next invoice — no partial-month proration is applied.
      </div>
      <PrimaryButton className="mt-3.5 w-full" disabled={submitting || !selected} onClick={submit}>
        {submitting ? <Loader2 size={14} className="animate-spin" /> : isResubscribe ? "Resubscribe" : "Confirm change"}
      </PrimaryButton>
    </Modal>
  );
}

function CancelServiceModal({
  onClose, onSaved,
}: {
  onClose: () => void;
  onSaved: (u: SubscriberUser) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await portalApi.plan.cancel();
      onSaved(res.data);
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Cancel service">
      {error && <FormError message={error} />}
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Cancelling stops your service right away: Wi-Fi access is deprovisioned immediately and no further invoices will be
        generated. Any invoice already issued stays payable from your Billing tab. You can resubscribe to any plan at any time.
      </div>
      <ModalActions>
        <GhostButton className="flex-1" onClick={onClose} disabled={submitting}>Keep my service</GhostButton>
        <DangerButton className="flex-1" disabled={submitting} onClick={submit}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : "Cancel service"}
        </DangerButton>
      </ModalActions>
    </Modal>
  );
}

function DeleteAccountModal({
  onClose, onDeleted,
}: {
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await portalApi.account.delete(password);
      onDeleted();
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Delete account">
      {error && <FormError message={error} />}
      <div className="text-sm text-slate-600 dark:text-slate-300">
        This removes your personal details from our system and signs you out — you won't be able to log back in under this
        account. Invoice and support history is retained for our accounting records. This can't be undone from your side.
      </div>
      <FieldLabel>Confirm your password</FieldLabel>
      <FieldInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <ModalActions>
        <GhostButton className="flex-1" onClick={onClose} disabled={submitting}>Keep my account</GhostButton>
        <DangerButton className="flex-1" disabled={submitting || !password} onClick={submit}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : "Delete account"}
        </DangerButton>
      </ModalActions>
    </Modal>
  );
}

function ProfileTab({
  user, setUser, logout,
}: {
  user: SubscriberUser;
  setUser: (u: SubscriberUser) => void;
  logout: () => Promise<void>;
}) {
  const [prefs, setPrefs] = useState([true, true, true, false]);
  const labels = ["Outage alerts", "Billing reminders", "Usage warnings", "Product updates"];
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isCancelled = user.status === "cancelled";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHead
            eyebrow="Account holder"
            action={<GhostButton size="sm" onClick={() => setEditOpen(true)}><Pencil size={13} /> Edit</GhostButton>}
          />
          <ProfileRow label="Name" first>{user.name}</ProfileRow>
          <ProfileRow label="Email">{user.email}</ProfileRow>
          <ProfileRow label="Phone">{user.phone ?? "—"}</ProfileRow>
          <LinkButton onClick={() => setPasswordOpen(true)}>Change password <ChevronRight size={14} /></LinkButton>
        </Card>
        <Card>
          <CardHead
            eyebrow="Plan & address"
            action={
              <GhostButton size="sm" onClick={() => setPlanOpen(true)}>
                <Repeat size={13} /> {isCancelled ? "Resubscribe" : "Change plan"}
              </GhostButton>
            }
          />
          <ProfileRow label="Plan" first>{isCancelled ? "No active plan" : user.plan?.name ?? "No plan assigned"}</ProfileRow>
          <ProfileRow label="Address">{user.service_address}</ProfileRow>
          <ProfileRow label="Monthly bill"><span className="font-mono text-xs font-semibold">{fmtUSD(user.monthly_bill)}</span></ProfileRow>
          {isCancelled && (
            <div className="mt-2 text-[11.5px] font-medium text-amber-600 dark:text-amber-400">Your service is cancelled.</div>
          )}
        </Card>
      </div>

      <Card>
        <Eyebrow>Notification preferences</Eyebrow>
        <div className="mt-1 mb-2 text-[11.5px] text-slate-500 dark:text-slate-400">These preferences are stored on this device only.</div>
        {labels.map((label, i) => (
          <ProfileRow label={label} key={label} first={i === 0}>
            <ToggleSwitch on={prefs[i]} onChange={(next) => setPrefs((p) => p.map((v, idx) => idx === i ? next : v))} />
          </ProfileRow>
        ))}
      </Card>

      {!isCancelled && (
        <Card>
          <Eyebrow>Manage service</Eyebrow>
          <div className="mt-1.5 mb-2 text-[13px] text-slate-600 dark:text-slate-300">
            Cancel your service if you're moving on. You can resubscribe to any plan at any time afterward.
          </div>
          <GhostButton onClick={() => setCancelOpen(true)}><Ban size={14} /> Cancel service</GhostButton>
        </Card>
      )}

      <Card className="border-rose-200 dark:border-rose-900">
        <Eyebrow>Danger zone</Eyebrow>
        <div className="mt-1.5 mb-2 text-[13px] text-slate-600 dark:text-slate-300">
          Permanently remove your personal details and sign out. Invoice and support history is retained for our records.
        </div>
        <GhostButton
          className="border-rose-200 text-rose-600 hover:border-rose-400 hover:text-rose-700 dark:border-rose-900 dark:text-rose-400"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 size={14} /> Delete account
        </GhostButton>
      </Card>

      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} onSaved={setUser} />}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}
      {planOpen && <ChangePlanModal user={user} onClose={() => setPlanOpen(false)} onSaved={setUser} />}
      {cancelOpen && (
        <CancelServiceModal onClose={() => setCancelOpen(false)} onSaved={(u) => { setUser(u); setCancelOpen(false); }} />
      )}
      {deleteOpen && (
        <DeleteAccountModal onClose={() => setDeleteOpen(false)} onDeleted={() => { setDeleteOpen(false); logout(); }} />
      )}
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

function CustomerConsole({
  user, logout, setUser,
}: {
  user: SubscriberUser;
  logout: () => Promise<void>;
  setUser: (u: SubscriberUser) => void;
}) {
  const [tab, setTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [payReference, setPayReference] = useState("");
  const [paying, setPaying] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const palette = useMemo(() => chartPalette(theme), [theme]);

  const goTo = (key: string) => { setTab(key); setMobileNavOpen(false); };

  const openPay = (invoice: Invoice) => {
    setPayTarget(invoice);
    setPayReference("");
    setPayDone(false);
  };

  const confirmPay = async () => {
    if (!payTarget) return;
    setPaying(true);
    try {
      await portalApi.invoices.pay(payTarget.id, payReference || undefined);
      setPayDone(true);
    } finally {
      setPaying(false);
    }
  };

  const notifications = [
    { icon: CheckCircle2, text: "Check Billing for your latest invoice status", time: "now", tone: "success" as Tone },
    { icon: Clock, text: "Visit Support to track open tickets", time: "now", tone: "info" as Tone },
  ];

  const initials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col gap-5 border-r border-slate-200 bg-white p-3.5 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-indigo-600 text-white"><Zap size={16} strokeWidth={2.5} /></div>
          <span className="text-[15px] font-bold tracking-tight">Latticefi</span>
        </div>
        <NavList tab={tab} onSelect={setTab} />
        <div className="mt-auto border-t border-slate-200 pt-3.5 dark:border-slate-800">
          <button onClick={() => logout()} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[12px] font-semibold text-white">{initials}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1100px] flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
          {tab === "overview" && <Overview user={user} goTo={goTo} openPay={openPay} />}
          {tab === "usage" && <UsageTab palette={palette} />}
          {tab === "billing" && <BillingTab openPay={openPay} />}
          {tab === "wifi" && <WifiTab />}
          {tab === "support" && <SupportTab />}
          {tab === "profile" && <ProfileTab user={user} setUser={setUser} logout={logout} />}
        </main>
      </div>

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

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title="Pay invoice">
        {payTarget && !payDone && (
          <>
            <ProfileRow label="Invoice" first>INV-{payTarget.id}</ProfileRow>
            <ProfileRow label="Amount"><span className="font-mono text-base font-semibold">{fmtUSD(payTarget.amount)}</span></ProfileRow>
            <FieldLabel>Reference (optional)</FieldLabel>
            <FieldInput value={payReference} onChange={(e) => setPayReference(e.target.value)} placeholder="M-Pesa code, bank ref…" />
            <PrimaryButton className="mt-3.5 w-full" disabled={paying} onClick={confirmPay}>
              {paying ? <Loader2 size={14} className="animate-spin" /> : `Confirm payment of ${fmtUSD(payTarget.amount)}`}
            </PrimaryButton>
          </>
        )}
        {payTarget && payDone && (
          <div className="flex flex-col items-center gap-2.5 py-4 text-center">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Payment recorded</div>
            <div className="text-[13px] text-slate-500 dark:text-slate-400">INV-{payTarget.id} is now marked as paid.</div>
            <PrimaryButton size="sm" onClick={() => setPayTarget(null)}>Done</PrimaryButton>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function CustomerPortal() {
  const { status, user, login, logout, setUser } = useSubscriberAuth();

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
        title="Customer Portal"
        subtitle="Sign in to manage your account"
        emailPlaceholder="you@example.com"
        onSubmit={login}
      />
    );
  }

  return <CustomerConsole user={user} logout={logout} setUser={setUser} />;
}
