import { useState } from "react";
import { Wifi, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { ApiError } from "../lib/api";
import { useApiResource } from "../lib/useApiResource";
import { hotspotApi } from "../lib/hotspotApi";
import type { HotspotSession } from "../lib/types";
import { Card, FieldLabel, FieldInput, PrimaryButton } from "../components/ui/primitives";

const fmtUSD = (n: number) => `$${n.toFixed(2)}`;

function macFromQueryString(): string {
  return new URLSearchParams(window.location.search).get("mac") ?? "";
}

function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    const first = err.errors && Object.values(err.errors)[0]?.[0];
    return first || err.message || fallback;
  }
  return fallback;
}

export default function HotspotPortal() {
  const { data, loading, error: loadError } = useApiResource(() => hotspotApi.plans.list(), []);
  const [mac, setMac] = useState(macFromQueryString);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<HotspotSession | null>(null);

  const plans = data?.data ?? [];

  const submit = async () => {
    if (!mac.trim() || !selectedPlanId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await hotspotApi.purchase({
        mac_address: mac.trim(),
        hotspot_plan_id: selectedPlanId,
        payment_reference: reference || undefined,
      });
      setSession(res.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Wifi size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {session ? "You're connected" : "Get Wi-Fi access"}
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            {session ? "Enjoy your pass — connected regardless of which hotspot location you're on." : "Choose a pass to get online"}
          </p>
        </div>

        {session ? (
          <div className="flex flex-col items-center gap-2.5 py-2 text-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{session.plan?.name}</div>
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
              <Clock size={14} />
              Connected until {new Date(session.expires_at).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
            </div>
            <PrimaryButton size="sm" className="mt-3" onClick={() => { setSession(null); setSelectedPlanId(null); setReference(""); }}>
              Buy another pass
            </PrimaryButton>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <FieldLabel>Device MAC address</FieldLabel>
            <FieldInput value={mac} onChange={(e) => setMac(e.target.value)} placeholder="AA:BB:CC:DD:EE:FF" />

            <FieldLabel>Choose a pass</FieldLabel>
            {loading && (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Loading passes…
              </div>
            )}
            {loadError && !loading && (
              <div className="p-3 text-center text-[12.5px] text-rose-600 dark:text-rose-400">{loadError}</div>
            )}
            {!loading && !loadError && (
              <div className="flex flex-col gap-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      selectedPlanId === p.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                        : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
                    }`}
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                    <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">{fmtUSD(p.price)}</span>
                  </button>
                ))}
                {plans.length === 0 && (
                  <div className="p-3 text-center text-[12.5px] text-slate-500 dark:text-slate-400">No passes available right now.</div>
                )}
              </div>
            )}

            <FieldLabel>Payment reference (optional)</FieldLabel>
            <FieldInput value={reference} onChange={(e) => setReference(e.target.value)} placeholder="M-Pesa code, receipt #…" />

            <PrimaryButton
              className="mt-4 w-full"
              disabled={submitting || !mac.trim() || !selectedPlanId}
              onClick={submit}
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : "Connect me"}
            </PrimaryButton>
          </>
        )}
      </Card>
    </div>
  );
}
