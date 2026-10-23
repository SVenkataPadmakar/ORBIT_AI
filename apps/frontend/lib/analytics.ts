/**
 * apps/frontend/lib/analytics.ts
 * Telemetry and user event tracking per Section 11 & Section 20 of .antigravity/rules.md
 */

export interface AnalyticsPayload {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export async function trackEvent(name: string, properties: Record<string, unknown> = {}): Promise<void> {
  if (typeof window === "undefined") return;

  const payload: AnalyticsPayload = {
    event: name,
    properties,
    timestamp: Date.now(),
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", JSON.stringify(payload));
    } else {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Non-blocking telemetry
  }
}
