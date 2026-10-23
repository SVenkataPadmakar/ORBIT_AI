export type HealthPillar = {
    key: string;
    label: string;
    score: number; // 0 - 100
    status: "optimal" | "warning" | "critical";
    trend: string;
    details: string;
    actionLabel: string;
    actionId: string;
};

export type StageGateMilestone = {
    id: string;
    stage: string;
    title: string;
    status: "completed" | "in_progress" | "blocked" | "upcoming";
    progress: number; // 0 - 100
    targetDays: number;
    tasksCount: number;
    completedCount: number;
    criticalDependency?: string;
    actionLabel: string;
};

export type RiskVector = {
    id: string;
    title: string;
    category: "market" | "technical" | "financial" | "execution";
    probability: number; // 1 - 5
    impact: number;      // 1 - 5
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    mitigationPlaybook: string;
    playbookStatus: "ready" | "in_progress" | "resolved";
};

export type WhatIfScenario = {
    capitalInjection: number; // in USD (e.g. 250000)
    devSprintBoost: number;   // 1x, 1.5x, 2x
    marketingBudget: number;  // in USD/month
    targetLaunchWeeks: number;
};

export type CoreDimensionMetric = {
    id: "health" | "readiness" | "product" | "launch" | "growth" | "market" | "risk";
    title: string;
    subtitle: string;
    score: number; // 0 - 100
    status: "optimal" | "warning" | "critical";
    trend: string;
    accentColor: string; // e.g. "cyan", "emerald", "indigo", "violet", "amber", "rose"
    actionLabel: string;
    actionId: string;
    description: string;
};
