export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfCookiePromise: Promise<void> | null = null;

function ensureCsrfCookie(): Promise<void> {
  if (getCookie("XSRF-TOKEN")) return Promise.resolve();

  if (!csrfCookiePromise) {
    csrfCookiePromise = fetch("/sanctum/csrf-cookie", { credentials: "include" })
      .then(() => undefined)
      .finally(() => {
        csrfCookiePromise = null;
      });
  }

  return csrfCookiePromise;
}

export interface Paginated<T> {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface Collection<T> {
  data: T[];
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();

  if (method !== "GET") {
    await ensureCsrfCookie();
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (method !== "GET") {
    const token = getCookie("XSRF-TOKEN");
    if (token) headers["X-XSRF-TOKEN"] = token;
  }

  const response = await fetch(path, { ...options, method, headers, credentials: "include" });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(body?.message || response.statusText, response.status, body?.errors);
  }

  return body as T;
}

export function qs(params: Record<string, string | number | undefined | null> = {}): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
