"use client";

import type { ExecutionPlan, PipelineOutputs } from "@/types/api";
import { FounderMissionControl } from "@/components/mission-control/FounderMissionControl";

export function HealthDashboard({
    projectName,
    plan,
    outputs,
    onTriggerSpecialistCouncil,
}: {
    projectName: string;
    plan: ExecutionPlan;
    outputs: PipelineOutputs;
    onTriggerSpecialistCouncil?: () => void;
}) {
    return (
        <FounderMissionControl
            projectName={projectName}
            plan={plan}
            outputs={outputs}
            onTriggerSpecialistCouncil={onTriggerSpecialistCouncil}
        />
    );
}
