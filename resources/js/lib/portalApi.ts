import { apiFetch, qs, type Paginated } from "./api";
import type {
  ConnectedDevice, Invoice, Payment, SubscriberUser, Ticket, UsageData, WifiNetwork,
} from "./types";

export const portalApi = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ data: SubscriberUser }>("/api/portal/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => apiFetch<void>("/api/portal/logout", { method: "POST" }),
    me: () => apiFetch<{ data: SubscriberUser }>("/api/portal/me"),
  },

  invoices: {
    list: (params: Record<string, string | number | undefined> = {}) => apiFetch<Paginated<Invoice>>(`/api/portal/invoices${qs(params)}`),
    pay: (invoiceId: number, reference?: string) =>
      apiFetch<{ data: Payment }>(`/api/portal/invoices/${invoiceId}/pay`, { method: "POST", body: JSON.stringify({ reference }) }),
  },

  tickets: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Paginated<Ticket>>(`/api/portal/tickets${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: Ticket }>("/api/portal/tickets", { method: "POST", body: JSON.stringify(data) }),
  },

  usage: {
    get: () => apiFetch<UsageData>("/api/portal/usage"),
  },

  wifi: {
    get: () => apiFetch<{ data: WifiNetwork }>("/api/portal/wifi"),
    regeneratePassword: () => apiFetch<{ data: WifiNetwork }>("/api/portal/wifi/regenerate-password", { method: "POST" }),
  },

  devices: {
    list: () => apiFetch<{ data: ConnectedDevice[] }>("/api/portal/devices"),
    update: (id: number, data: { is_paused: boolean }) =>
      apiFetch<{ data: ConnectedDevice }>(`/api/portal/devices/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
};
