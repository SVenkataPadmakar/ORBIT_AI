/**
 * apps/frontend/lib/mocks/data/admin.mock.ts
 * Administrative metrics, registered users, and system health status.
 */
import type { AdminOverview, AdminUser } from "@/types/api";

export const MOCK_ADMIN_OVERVIEW: AdminOverview = {
  users: [
    { label: "Active Founders", value: 38, trend_percent: 18.5 },
    { label: "Total Registrations", value: 142, trend_percent: 24.2 },
    { label: "Weekly Retention", value: "94.2%", trend_percent: 2.1 },
  ],
  revenue: [
    { label: "MRR", value: "$18,962", trend_percent: 22.4 },
    { label: "ARR Run-Rate", value: "$227,544", trend_percent: 22.4 },
    { label: "Average ACV", value: "$5,988", trend_percent: 5.0 },
  ],
  agents: [
    { label: "Autonomous Pipeline Runs", value: 418, trend_percent: 32.1 },
    { label: "Consensus Score Avg", value: "93.4%", trend_percent: 1.8 },
    { label: "Debate Rounds Resolved", value: 1254, trend_percent: 14.7 },
  ],
  system: [
    { label: "Uptime (Mock Layer)", value: "99.99%", trend_percent: 0.0 },
    { label: "Client Latency", value: "18ms", trend_percent: -42.0 },
    { label: "Memory Vault Health", value: "Optimal", trend_percent: null },
  ],
  api_usage: [
    { label: "Gemini Pro Calls", value: "18,420", trend_percent: 15.6 },
    { label: "Tokens Processed", value: "4.8M", trend_percent: 12.3 },
    { label: "Cache Hit Rate", value: "91.2%", trend_percent: 4.5 },
  ],
};

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-orbit-founder-001",
    email: "founder@orbit.dev",
    full_name: "Alex Vance (Founder)",
    role: "founder",
    is_active: true,
    created_at: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "usr-pilot-002",
    email: "sarah.chen@relayhealth.com",
    full_name: "Dr. Sarah Chen",
    role: "client_lead",
    is_active: true,
    created_at: "2026-10-05T10:30:00.000Z",
  },
  {
    id: "usr-investor-003",
    email: "partner@sequoia-demo.vc",
    full_name: "Marcus Aurelius (Venture Partner)",
    role: "investor",
    is_active: true,
    created_at: "2026-10-12T14:00:00.000Z",
  },
];
