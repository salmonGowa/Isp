import React, { useState } from "react";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { Card, FieldLabel, FieldInput, PrimaryButton } from "../ui/primitives";
import { ApiError } from "../../lib/api";

export function LoginScreen({
  title,
  subtitle,
  emailPlaceholder,
  onSubmit,
}: {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.errors && Object.values(err.errors)[0]?.[0];
        setError(firstFieldError || err.message || "These credentials do not match our records.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <FieldLabel>Email address</FieldLabel>
          <FieldInput
            type="email"
            required
            autoFocus
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
          />

          <FieldLabel>Password</FieldLabel>
          <FieldInput
            type="password"
            required
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <PrimaryButton type="submit" disabled={submitting} className="mt-5 w-full">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : "Sign in"}
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
