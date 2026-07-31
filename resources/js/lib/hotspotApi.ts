import { apiFetch, type Collection } from "./api";
import type { HotspotPlan, HotspotSession } from "./types";

export const hotspotApi = {
  plans: {
    list: () => apiFetch<Collection<HotspotPlan>>("/api/hotspot/plans"),
  },
  purchase: (data: { mac_address: string; hotspot_plan_id: number; payment_reference?: string }) =>
    apiFetch<{ data: HotspotSession }>("/api/hotspot/purchase", { method: "POST", body: JSON.stringify(data) }),
};
