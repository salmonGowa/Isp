import { useEffect, useState } from "react";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 18;

function computeStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const isWeekday = day >= 1 && day <= 5;
  const isBusinessHours = hour >= OPEN_HOUR && hour < CLOSE_HOUR;

  return { open: isWeekday && isBusinessHours };
}

/**
 * Live "is the NOC/support desk open right now" indicator, checked against
 * Mon–Fri 08:00–18:00 in the visitor's local clock. Re-evaluated every minute
 * so a badge left open on screen doesn't go stale.
 */
export function useOfficeStatus() {
  const [status, setStatus] = useState(computeStatus);

  useEffect(() => {
    const interval = setInterval(() => setStatus(computeStatus()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
