import React from "react";
import { X } from "lucide-react";

/* ============================== shared visual tokens ==============================
   Every color used across the portals maps to one of these five tones so badges,
   dots, and accents stay consistent between light and dark mode. */

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_TEXT: Record<Tone, string> = {
  success: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-rose-700 dark:text-rose-400",
  info: "text-indigo-700 dark:text-indigo-400",
  neutral: "text-slate-600 dark:text-slate-400",
};

const TONE_BG: Record<Tone, string> = {
  success: "bg-emerald-100 dark:bg-emerald-500/15",
  warning: "bg-amber-100 dark:bg-amber-500/15",
  danger: "bg-rose-100 dark:bg-rose-500/15",
  info: "bg-indigo-100 dark:bg-indigo-500/15",
  neutral: "bg-slate-100 dark:bg-slate-500/15",
};

const TONE_DOT: Record<Tone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-indigo-500",
  neutral: "bg-slate-400",
};

export function toneClasses(tone: Tone) {
  return { text: TONE_TEXT[tone], bg: TONE_BG[tone], dot: TONE_DOT[tone] };
}

/* ============================== layout atoms ============================== */

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-2.5">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {eyebrow}
          </div>
        )}
        {title && <div className="mt-0.5">{title}</div>}
      </div>
      {action}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {children}
    </div>
  );
}

/* ============================== badge / status dot ============================== */

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = toneClasses(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.bg} ${t.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}

export function Dot({ tone, className = "" }: { tone: Tone; className?: string }) {
  return <span className={`inline-block rounded-full ${TONE_DOT[tone]} ${className}`} />;
}

/* ============================== buttons ============================== */

const sizeClasses = {
  base: "px-3.5 py-2 text-[13px]",
  sm: "px-2.5 py-1.5 text-xs",
  xs: "px-2 py-1 text-[11px]",
};

export function PrimaryButton({
  children,
  className = "",
  size = "base",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: keyof typeof sizeClasses }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 font-semibold text-white transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  size = "base",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: keyof typeof sizeClasses }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ============================== form controls ============================== */

export function SearchInput({
  value,
  onChange,
  placeholder,
  icon,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex-none dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[13px] text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mt-3 mb-1.5 block text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
      {children}
    </label>
  );
}

export function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
    />
  );
}

export function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
    />
  );
}

export function FieldSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
    >
      {children}
    </select>
  );
}

export function ToggleSwitch({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={`relative h-[22px] w-[38px] rounded-full border transition-colors ${
        on
          ? "border-indigo-600 bg-indigo-600"
          : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

/* ============================== modal ============================== */

export function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <IconButton onClick={onClose} aria-label="Close">
            <X size={17} />
          </IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap gap-2">{children}</div>;
}

export function ProfileRow({
  label,
  children,
  first = false,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 text-sm ${
        first ? "" : "border-t border-slate-100 dark:border-slate-800"
      }`}
    >
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-800 dark:text-slate-100">{children}</span>
    </div>
  );
}
