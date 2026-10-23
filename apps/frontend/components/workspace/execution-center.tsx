"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Circle, Code2, Database, Rocket, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { projectsApi } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { ExecutionPhase, ExecutionPlan, ExecutionTask, ExecutionTaskStatus } from "@/types/api";
import { ErrorState, LoadingState } from "@/components/ui/core";

const phaseMeta = {
    build: { label: "Build", icon: Code2, tone: "text-accent" },
    launch: { label: "Launch", icon: Rocket, tone: "text-coral" },
    growth: { label: "Growth", icon: TrendingUp, tone: "text-emerald-400" },
};

export function ExecutionCenter({ projectId }: { projectId: string }) {
    const client = useQueryClient();
    const query = useQuery({ queryKey: ["execution", projectId], queryFn: () => projectsApi.execution(projectId) });
    const update = useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: ExecutionTaskStatus }) => projectsApi.updateExecutionTask(projectId, taskId, status),
        onSuccess: (plan) => client.setQueryData(["execution", projectId], plan),
    });
    if (query.isLoading) return <LoadingState label="Building your execution system" />;
    if (query.isError || !query.data) return <ErrorState message={query.error?.message ?? "Execution plan unavailable"} />;
    const plan = query.data;
    const allTasks = [...plan.build.tasks, ...plan.launch.tasks, ...plan.growth.tasks];
    const done = allTasks.filter((task) => task.status === "done").length;

    return <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.5fr_.5fr]">
            <div className="surface p-6"><p className="eyebrow">Founder directive</p><h2 className="mt-2 text-2xl font-bold">Turn evidence into a launch.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{plan.executive_action}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-to-r from-accent to-coral" style={{ width: `${Math.round(done / allTasks.length * 100)}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{done} of {allTasks.length} execution outcomes complete</p></div>
            <div className="surface p-6"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-emerald-400" /><h3 className="font-bold">Validated plan</h3></div><p className="mt-5 text-4xl font-bold">{plan.validation.confidence_score}%</p><p className="text-xs text-muted-foreground">Overall confidence</p><p className="mt-4 text-xs leading-5 text-muted-foreground">Evidence quality {plan.validation.evidence_quality}%. Unverified assumptions remain visible instead of being presented as facts.</p></div>
        </section>
        {(["build", "launch", "growth"] as ExecutionPhase[]).map((phase) => <Phase key={phase} phase={phase} plan={plan} onStatus={(taskId, status) => update.mutate({ taskId, status })} />)}
        <section className="grid gap-5 lg:grid-cols-2"><Technical plan={plan} /><LaunchChecklist plan={plan} /></section>
    </div>;
}

function Phase({ phase, plan, onStatus }: { phase: ExecutionPhase; plan: ExecutionPlan; onStatus: (id: string, status: ExecutionTaskStatus) => void }) {
    const data = plan[phase]; const meta = phaseMeta[phase]; const Icon = meta.icon;
    return <section className="surface overflow-hidden"><div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center"><span className={cn("flex size-10 items-center justify-center rounded-xl bg-white/[.05]", meta.tone)}><Icon className="size-5" /></span><div><h2 className="text-lg font-bold">{meta.label} phase</h2><p className="text-sm text-muted-foreground">{data.objective}</p></div><div className="sm:ml-auto"><span className="status-pill bg-white/[.05]">Exit: {data.exit_criteria[0]}</span></div></div><div className="divide-y divide-white/10">{data.tasks.map((task) => <Task key={task.id} task={task} onStatus={onStatus} />)}</div><div className="grid gap-3 border-t border-white/10 bg-black/10 p-5 sm:grid-cols-3">{data.kpis.map((kpi) => <div key={kpi}><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Track</p><p className="mt-1 text-sm font-semibold">{kpi}</p></div>)}</div></section>;
}

function Task({ task, onStatus }: { task: ExecutionTask; onStatus: (id: string, status: ExecutionTaskStatus) => void }) {
    const next: Record<ExecutionTaskStatus, ExecutionTaskStatus> = { todo: "in_progress", in_progress: "done", blocked: "in_progress", done: "todo" };
    return <div className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-start"><button aria-label={`Update ${task.title}`} onClick={() => onStatus(task.id, next[task.status])} className={cn("mt-0.5 flex size-7 items-center justify-center rounded-full border border-white/15", task.status === "done" && "border-emerald-400 bg-emerald-400 text-black", task.status === "in_progress" && "border-accent text-accent")}>{task.status === "done" ? <Check className="size-4" /> : <Circle className="size-3" />}</button><div><div className="flex flex-wrap items-center gap-2"><h3 className={cn("font-bold", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</h3><span className="status-pill bg-white/[.05]">{task.owner_role}</span><span className="text-xs text-muted-foreground">{task.duration_days} days</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{task.outcome}</p><ul className="mt-3 space-y-1">{task.acceptance_criteria.map((item) => <li key={item} className="flex gap-2 text-xs"><ChevronRight className="mt-0.5 size-3.5 shrink-0 text-coral" />{item}</li>)}</ul></div><div className="flex flex-wrap gap-1 md:max-w-44 md:justify-end">{task.recommended_tools.map((tool) => <span key={tool} className="rounded border border-white/10 px-2 py-1 text-[10px] text-muted-foreground">{tool}</span>)}</div></div>;
}

function Technical({ plan }: { plan: ExecutionPlan }) { return <section className="surface p-5"><div className="flex items-center gap-2"><Database className="size-5 text-accent" /><h2 className="font-bold">Technical blueprint</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{plan.technical_blueprint.stack.map((item) => <div key={item.layer} className="surface-subtle p-4"><p className="text-[10px] font-bold uppercase text-muted-foreground">{item.layer}</p><p className="mt-1 font-semibold">{item.choice}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.reason}</p></div>)}</div><ul className="mt-5 space-y-2">{plan.technical_blueprint.architecture.map((item) => <li key={item} className="flex gap-2 text-sm"><Target className="mt-0.5 size-4 shrink-0 text-coral" />{item}</li>)}</ul></section>; }
function LaunchChecklist({ plan }: { plan: ExecutionPlan }) { return <section className="surface p-5"><div className="flex items-center gap-2"><Rocket className="size-5 text-coral" /><h2 className="font-bold">Launch readiness</h2></div><div className="mt-5 space-y-3">{plan.launch_checklist.map((item) => <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3 text-sm" key={item}><span className="flex size-6 items-center justify-center rounded-full bg-white/[.05]"><Check className="size-3 text-muted-foreground" /></span>{item}</div>)}</div></section>; }
