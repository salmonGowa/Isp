export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "billing" | "noc" | "support" | "technician";
  last_active_at: string | null;
  created_at: string;
}

export interface SubscriberUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  plan_id: number | null;
  plan?: { id: number; name: string };
  status: "active" | "suspended" | "overdue" | "cancelled";
  service_address: string;
  zone: string;
  monthly_bill: number;
  joined_at: string;
  last_payment_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Plan {
  id: number;
  name: string;
  download_mbps: number;
  upload_mbps: number;
  price: number;
  status: "active" | "archived";
  subscribers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
}

export interface Invoice {
  id: number;
  subscriber_id: number;
  subscriber?: { id: number; name: string };
  amount: number;
  status: "due" | "paid" | "overdue";
  issued_at: string;
  due_at: string;
  paid_at: string | null;
  payments?: Payment[];
}

export interface NetworkNode {
  id: number;
  identifier: string;
  type: "OLT" | "Router" | "Tower" | "Switch";
  zone: string;
  status: "online" | "degraded" | "offline";
  uptime_pct: number;
  load_pct: number;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  subscriber_id: number;
  subscriber?: { id: number; name: string };
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved";
  assignee_id: number | null;
  assignee?: { id: number; name: string | null } | null;
  sla_due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: number;
  user_id: number;
  name: string | null;
  status: "available" | "on-job" | "off-duty";
  zone: string;
  current_job_description: string | null;
  jobs_done_today: number;
  created_at: string;
}

export interface WorkOrder {
  id: number;
  type: "install" | "repair" | "maintenance";
  target: { subscriber_id: number; name: string | null } | { lead_name: string };
  address: string;
  technician_id: number | null;
  technician?: { id: number; name: string | null } | null;
  scheduled_at: string;
  status: "scheduled" | "in-progress" | "completed";
  completed_at: string | null;
  created_at: string;
}

export interface MetricValue {
  value: number | null;
  source: "computed" | "illustrative";
  note?: string | null;
}

export interface DashboardData {
  kpis: {
    active_subscribers: MetricValue;
    mrr: MetricValue;
    active_sessions: MetricValue;
    network_uptime_pct: MetricValue;
    open_tickets: MetricValue;
    overdue_accounts: MetricValue;
  };
  revenue_trend: { month: string; revenue: number }[];
  plan_mix: { plan_id: number; plan_name: string; subscriber_count: number }[];
  subscriber_growth: { month: string; total_subscribers: number }[];
}

export interface ReportsData {
  revenue_vs_churn: { month: string; revenue: number; churned_subscribers: number | null }[];
  subscriber_growth_by_zone: { zone: string; subscriber_count: number }[];
  key_ratios: {
    arpu: MetricValue;
    monthly_churn_pct: MetricValue;
    cac: MetricValue;
    avg_install_time_hours: MetricValue;
    nps: MetricValue;
  };
}

export interface WifiNetwork {
  ssid: string;
  wifi_password: string;
  password_updated_at: string | null;
}

export interface ConnectedDevice {
  id: number;
  name: string;
  type: "tv" | "phone" | "laptop" | "router";
  ip_address: string;
  connected_since: string;
  usage_gb_cycle: number;
  is_paused: boolean;
}

export interface UsageData {
  daily: { date: string; download_gb: number; upload_gb: number }[];
  stats: { average_daily_gb: number; peak_daily_gb: number; projected_total_gb: number };
}

export interface HotspotPlan {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  status: "active" | "archived";
  sessions_count?: number;
  created_at: string;
  updated_at: string;
}

export interface HotspotSession {
  id: number;
  mac_address: string;
  plan: { id: number; name: string } | null;
  amount_paid: number;
  payment_reference: string | null;
  status: "active" | "expired" | "revoked";
  starts_at: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}
