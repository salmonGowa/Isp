import { apiFetch, qs, type Collection, type Paginated } from "./api";
import type {
  DashboardData, HotspotPlan, HotspotSession, Invoice, NetworkNode, Payment, Plan, ReportsData,
  StaffUser, SubscriberUser, Technician, Ticket, WorkOrder,
} from "./types";

export const staffApi = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ data: StaffUser }>("/api/staff/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => apiFetch<void>("/api/staff/logout", { method: "POST" }),
    me: () => apiFetch<{ data: StaffUser }>("/api/staff/me"),
  },

  dashboard: {
    get: () => apiFetch<DashboardData>("/api/staff/dashboard"),
  },

  reports: {
    get: () => apiFetch<ReportsData>("/api/staff/reports"),
  },

  subscribers: {
    list: (params: Record<string, string | number | undefined> = {}) =>
      apiFetch<Paginated<SubscriberUser>>(`/api/staff/subscribers${qs(params)}`),
    create: (data: Record<string, unknown>) =>
      apiFetch<{ data: SubscriberUser }>("/api/staff/subscribers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      apiFetch<{ data: SubscriberUser }>(`/api/staff/subscribers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/api/staff/subscribers/${id}`, { method: "DELETE" }),
  },

  plans: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Collection<Plan>>(`/api/staff/plans${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: Plan }>("/api/staff/plans", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) => apiFetch<{ data: Plan }>(`/api/staff/plans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/api/staff/plans/${id}`, { method: "DELETE" }),
  },

  invoices: {
    list: (params: Record<string, string | number | undefined> = {}) => apiFetch<Paginated<Invoice>>(`/api/staff/invoices${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: Invoice }>("/api/staff/invoices", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/api/staff/invoices/${id}`, { method: "DELETE" }),
  },

  payments: {
    record: (invoiceId: number, data: { amount: number; reference?: string }) =>
      apiFetch<{ data: Payment }>(`/api/staff/invoices/${invoiceId}/payments`, { method: "POST", body: JSON.stringify(data) }),
  },

  networkNodes: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Collection<NetworkNode>>(`/api/staff/network-nodes${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: NetworkNode }>("/api/staff/network-nodes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) => apiFetch<{ data: NetworkNode }>(`/api/staff/network-nodes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/api/staff/network-nodes/${id}`, { method: "DELETE" }),
  },

  tickets: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Paginated<Ticket>>(`/api/staff/tickets${qs(params)}`),
    update: (id: number, data: Record<string, unknown>) => apiFetch<{ data: Ticket }>(`/api/staff/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  technicians: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Collection<Technician>>(`/api/staff/technicians${qs(params)}`),
  },

  workOrders: {
    list: (params: Record<string, string | number | undefined> = {}) => apiFetch<Paginated<WorkOrder>>(`/api/staff/work-orders${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: WorkOrder }>("/api/staff/work-orders", { method: "POST", body: JSON.stringify(data) }),
    dispatch: (id: number, technicianId: number) =>
      apiFetch<{ data: WorkOrder }>(`/api/staff/work-orders/${id}/dispatch`, { method: "POST", body: JSON.stringify({ technician_id: technicianId }) }),
    update: (id: number, data: Record<string, unknown>) => apiFetch<{ data: WorkOrder }>(`/api/staff/work-orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  staff: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Paginated<StaffUser>>(`/api/staff/staff${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: StaffUser }>("/api/staff/staff", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) => apiFetch<{ data: StaffUser }>(`/api/staff/staff/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/api/staff/staff/${id}`, { method: "DELETE" }),
  },

  hotspotPlans: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Collection<HotspotPlan>>(`/api/staff/hotspot-plans${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: HotspotPlan }>("/api/staff/hotspot-plans", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) => apiFetch<{ data: HotspotPlan }>(`/api/staff/hotspot-plans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch<void>(`/api/staff/hotspot-plans/${id}`, { method: "DELETE" }),
  },

  hotspotSessions: {
    list: (params: Record<string, string | undefined> = {}) => apiFetch<Collection<HotspotSession>>(`/api/staff/hotspot-sessions${qs(params)}`),
    create: (data: Record<string, unknown>) => apiFetch<{ data: HotspotSession }>("/api/staff/hotspot-sessions", { method: "POST", body: JSON.stringify(data) }),
    revoke: (id: number) => apiFetch<{ data: HotspotSession }>(`/api/staff/hotspot-sessions/${id}/revoke`, { method: "POST" }),
  },
};
