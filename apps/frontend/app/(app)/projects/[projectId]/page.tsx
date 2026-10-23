"use client";

import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ArrowRight, Bot, Check, ChevronRight, Circle, CircleDot, Code2, Database, FileCheck2, FlaskConical, Gauge, Lightbulb, LoaderCircle, MessageSquareText, Play, Radar, Rocket, Search, Send, ShieldAlert, ShieldCheck, Sparkles, Target, TrendingUp, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, projectsApi } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { ErrorState, LoadingState, StatusBadge } from "@/components/ui/core";
import { WorkspaceCofounderBanner } from "@/components/cofounder/WorkspaceCofounderBanner";
import { PersistentCofounderHUD } from "@/components/cofounder/PersistentCofounderHUD";
import { CenterIntelligenceSection } from "@/components/cofounder/CenterIntelligenceSection";
import { useStartupStore } from "@/lib/stores/startup-store";
import type { AgentStage, ExecutionPhase, ExecutionPlan, ExecutionTask, ExecutionTaskStatus, PipelineOutputs, PipelineRunResponse, PipelineStatusResponse, Project } from "@/types/api";

const ProductBuilder = dynamic(() => import("@/components/workspace/product-builder").then((m) => m.ProductBuilder), { loading: () => <LoadingState label="Loading Product Engine..." /> });
const ArchitectureBuilder = dynamic(() => import("@/components/workspace/architecture-builder").then((m) => m.ArchitectureBuilder), { loading: () => <LoadingState label="Loading Architecture Engine..." /> });
const UiUxArchitect = dynamic(() => import("@/components/workspace/ui-ux-architect").then((m) => m.UiUxArchitect), { loading: () => <LoadingState label="Loading UI/UX Engine..." /> });
const SprintPlanner = dynamic(() => import("@/components/workspace/sprint-planner").then((m) => m.SprintPlanner), { loading: () => <LoadingState label="Loading Sprint Board..." /> });
const AgentDebateSystem = dynamic(() => import("@/components/workspace/agent-debate-system").then((m) => m.AgentDebateSystem), { loading: () => <LoadingState label="Loading Debate System..." /> });
const ChangeImpactEngine = dynamic(() => import("@/components/workspace/change-impact").then((m) => m.ChangeImpactEngine), { loading: () => <LoadingState label="Loading Change Impact Engine..." /> });
const SimulationLab = dynamic(() => import("@/components/workspace/simulation-lab").then((m) => m.SimulationLab), { loading: () => <LoadingState label="Loading Simulation Lab..." /> });
const InvestorReadinessCenter = dynamic(() => import("@/components/workspace/investor-readiness").then((m) => m.InvestorReadinessCenter), { loading: () => <LoadingState label="Loading Investor Readiness..." /> });
const HealthDashboard = dynamic(() => import("@/components/workspace/health-dashboard").then((m) => m.HealthDashboard), { loading: () => <LoadingState label="Loading Health Radar..." /> });
const FounderMissionControl = dynamic(() => import("@/components/mission-control/FounderMissionControl").then((m) => m.FounderMissionControl), { loading: () => <LoadingState label="Loading Founder Mission Control..." /> });
const AgentCouncilOrbital = dynamic(() => import("@/components/workspace/agent-council-orbital").then((m) => m.AgentCouncilOrbital), { loading: () => <LoadingState label="Loading Specialist Council..." /> });
const StartupMemoryVault = dynamic(() => import("@/components/workspace/startup-memory-vault").then((m) => m.StartupMemoryVault), { loading: () => <LoadingState label="Loading Startup Memory Layer..." /> });

const stageMeta: Array<{ key: AgentStage; label: string; role: string; icon: typeof Lightbulb }> = [
    { key: "problem_discovery", label: "Problem", role: "Opportunity", icon: Lightbulb },
    { key: "market_research", label: "Market", role: "Research", icon: Search },
    { key: "product_strategy", label: "Product", role: "Product", icon: Target },
    { key: "finance", label: "Economics", role: "Finance", icon: Gauge },
    { key: "pitch_deck", label: "Narrative", role: "Synthesis", icon: MessageSquareText },
    { key: "vc_evaluation", label: "Verification", role: "Risk", icon: ShieldCheck },
];

const viewLabels: Record<string, { title: string; description: string }> = {
    mission:      { title: "Founder Mission Control", description: "Living operating system driving execution velocity, investor readiness, and strategic telemetry." },
    health:       { title: "Startup Health & Radar",   description: "Multi-dimensional startup viability radar, readiness scoring, and execution forecasts." },
    memory:       { title: "Startup Memory Vault",     description: "Project-scoped ChromaDB vector store, semantic search, decision memory, product memory, and founder directives." },
    evidence:     { title: "Validation Lab",          description: "Separate project inputs and model estimates from verified market evidence." },
    prd:          { title: "Product Builder Engine",   description: "Product requirements document, personas, user stories, and MVP scope." },
    uiux:         { title: "UI/UX Architect Engine",   description: "Page flow hierarchy, wireframe visualizer, and exportable Tailwind component code." },
    architecture: { title: "Technical Architect Engine", description: "PostgreSQL DDL schemas, OpenAPI specifications, and terminal CLI setup commands." },
    sprints:      { title: "Sprint Planner",           description: "Interactive Kanban board for backlog management, roles, and acceptance gates." },
    debate:       { title: "Multi-Agent Debate System", description: "Cross-agent reflection, trade-off reviews, and consensus confidence scoring." },
    impact:       { title: "Change Impact Engine",    description: "Evaluate requirement modifications and downstream artifact propagation." },
    launch:       { title: "Launch Center",            description: "Prepare the first focused cohort and close launch readiness gaps." },
    growth:       { title: "Growth Command",           description: "Run measurable growth work only after launch evidence exists." },
};

export default function ProjectWorkspacePage() {
    const projectId = String(useParams().projectId);
    const view = useSearchParams().get("view") || "mission";
    const client = useQueryClient();
    const [run, setRun] = useState<PipelineRunResponse | null>(null);
    const [runError, setRunError] = useState<string | null>(null);
    const project = useQuery({ queryKey: ["project", projectId], queryFn: () => projectsApi.get(projectId) });
    const execution = useQuery({ queryKey: ["execution", projectId], queryFn: () => projectsApi.execution(projectId) });

    useEffect(() => {
        if (!project.data || project.data.blueprint_status === "not_started") return;
        projectsApi.latestPipelineStatus(projectId).then((latest) => {
            const first = latest.runs[0];
            setRun({ pipeline_run_id: latest.pipeline_run_id, project_id: latest.project_id, status: latest.status, run_count: latest.runs.length, execution: "inline", mode: first?.mode ?? "demo", provider: first?.provider ?? "deterministic-demo" });
        }).catch(() => undefined);
    }, [project.data, projectId]);

    const connectStream = useStartupStore((state) => state.connectStream);
    useEffect(() => {
        const disconnect = connectStream(projectId);
        return () => disconnect();
    }, [projectId, connectStream]);

    const status = useQuery({ queryKey: ["pipeline", projectId, run?.pipeline_run_id], queryFn: () => projectsApi.pipelineStatus(projectId, run!.pipeline_run_id), enabled: Boolean(run), refetchInterval: (query) => ["queued", "running"].includes(query.state.data?.status ?? "") ? 1500 : false });
    const result = useQuery({ queryKey: ["pipeline-result", projectId, run?.pipeline_run_id], queryFn: () => projectsApi.pipelineResult(projectId, run!.pipeline_run_id), enabled: Boolean(run) && status.data?.status === "completed" });
    const start = useMutation({ mutationFn: () => projectsApi.startPipeline(projectId), onSuccess: (data) => { setRun(data); setRunError(null); client.invalidateQueries({ queryKey: ["project", projectId] }); }, onError: (cause) => setRunError(cause instanceof ApiError ? cause.message : "The specialist analysis could not start.") });
    const updateTask = useMutation({ mutationFn: ({ taskId, taskStatus }: { taskId: string; taskStatus: ExecutionTaskStatus }) => projectsApi.updateExecutionTask(projectId, taskId, taskStatus), onSuccess: (plan) => client.setQueryData(["execution", projectId], plan) });

    if (project.isLoading || execution.isLoading) return <LoadingState label="Assembling startup state" />;
    if (project.isError || !project.data) return <ErrorState message={project.error?.message ?? "Startup not found"} />;
    if (execution.isError || !execution.data) return <ErrorState message={execution.error?.message ?? "Execution state is unavailable"} />;

    const pipelineStatus = status.data?.status ?? run?.status ?? project.data.blueprint_status;
    const outputs = result.data?.outputs ?? {};
    const busy = start.isPending || ["queued", "running"].includes(pipelineStatus);
    const meta = viewLabels[view] ?? { title: "Founder Mission Control", description: "Decisions, evidence, and highest-value actions moving this startup forward." };

    const cofounderWorkspaces = ["mission", "health", "memory", "evidence", "architecture", "sprints", "launch", "growth"] as const;
    const activeCofounderWorkspace = view === "prd" ? "architecture" : view;
    const showCofounderBanner = cofounderWorkspaces.includes(activeCofounderWorkspace as any);

    return <div className="operating-workspace">
        <WorkspaceHeader project={project.data} title={meta.title} description={meta.description} pipelineStatus={pipelineStatus} run={run} busy={busy} onRun={() => start.mutate()} />
        {runError && <div className="workspace-alert workspace-alert-error" role="alert"><AlertTriangle className="size-4" />{runError}</div>}
        
        {/* Proactive Gemini Co-Founder Workspace Intelligence Banner */}
        {showCofounderBanner && (
            <WorkspaceCofounderBanner
                projectId={projectId}
                workspace={activeCofounderWorkspace as any}
                projectName={project.data.name}
            />
        )}

        {view === "mission"      && (
            <div className="space-y-8">
                <FounderMissionControl
                    projectId={projectId}
                    projectName={project.data.name}
                    plan={execution.data}
                    outputs={outputs}
                    onTriggerSpecialistCouncil={() => start.mutate()}
                    onTaskStatusUpdate={(taskId, taskStatus) => updateTask.mutate({ taskId, taskStatus })}
                />
                <CenterIntelligenceSection
                    projectId={projectId}
                    workspace="mission"
                    headlineOverride="Gemini Mission Intelligence & Strategic Defense"
                />
            </div>
        )}
        {view === "evidence"     && <EvidenceLab plan={execution.data} outputs={outputs} mode={run?.mode} onRun={() => start.mutate()} busy={busy} projectId={projectId} />}
        {view === "prd"          && <ProductBuilder />}
        {view === "uiux"         && <UiUxArchitect projectName={project.data.name} outputs={outputs} />}
        {view === "architecture" && <ArchitectureBuilder projectName={project.data.name} plan={execution.data} projectId={projectId} />}
        {view === "sprints"      && <SprintPlanner plan={execution.data} onTaskStatus={(taskId, taskStatus) => updateTask.mutate({ taskId, taskStatus })} projectId={projectId} />}
        {view === "debate"       && <AgentDebateSystem projectName={project.data.name} outputs={outputs} status={status.data} onRunCouncil={() => start.mutate()} busy={busy} projectId={projectId} />}
        {view === "impact"       && <ChangeImpactEngine />}
        {view === "council"      && <div className="work-surface" style={{ padding: 0 }}><AgentCouncilOrbital status={status.data} outputs={outputs} mode={run?.mode} onRun={() => start.mutate()} busy={busy} /></div>}
        {view === "build"        && <BuildWorkspace plan={execution.data} outputs={outputs} onTask={(taskId, taskStatus) => updateTask.mutate({ taskId, taskStatus })} />}
        {view === "simulation"   && <SimulationLab projectName={project.data.name} />}
        {view === "readiness"    && <InvestorReadinessCenter projectName={project.data.name} plan={execution.data} outputs={outputs} />}
        {view === "health"       && (
            <FounderMissionControl
                projectId={projectId}
                projectName={project.data.name}
                plan={execution.data}
                outputs={outputs}
                onTriggerSpecialistCouncil={() => start.mutate()}
                onTaskStatusUpdate={(taskId, taskStatus) => updateTask.mutate({ taskId, taskStatus })}
            />
        )}
        {view === "memory"       && <StartupMemoryVault projectId={projectId} projectName={project.data.name} />}
        {view === "launch"       && <LaunchCenter plan={execution.data} onTask={(taskId, taskStatus) => updateTask.mutate({ taskId, taskStatus })} projectId={projectId} />}
        {view === "growth"       && <GrowthCommand plan={execution.data} onTask={(taskId, taskStatus) => updateTask.mutate({ taskId, taskStatus })} projectId={projectId} />}
        
        {/* Persistent Co-Founder Architecture HUD */}
        <PersistentCofounderHUD
            projectId={projectId}
            projectName={project.data.name}
            activeWorkspace={view}
        />
    </div>;
}

function WorkspaceHeader({ project, title, description, pipelineStatus, run, busy, onRun }: { project: Project; title: string; description: string; pipelineStatus: string; run: PipelineRunResponse | null; busy: boolean; onRun: () => void }) {
    return <header className="workspace-header-block">
        <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground"><Link href="/dashboard" className="hover:text-foreground"><ArrowLeft className="size-4" /></Link><span className="truncate">{project.name}</span><ChevronRight className="size-3" /><span className="text-foreground">{title}</span></div>
        <div className="mt-5 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={project.status} /><span className="text-xs text-muted-foreground">{project.industry || "Unclassified market"}</span></div><h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div><div className="flex flex-wrap items-center gap-2"><div className="analysis-provenance"><span className={cn("size-2", run?.mode === "provider" ? "bg-emerald-300" : "bg-amber-300")} /><span>{run?.mode === "provider" ? `${run.provider} analysis` : "Demo analysis · not live research"}</span></div><button className="btn-primary" disabled={busy} onClick={onRun}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}{pipelineStatus === "completed" ? "Refresh analysis" : busy ? "Agents working" : "Run specialist council"}</button></div></div>
    </header>;
}



function EvidenceLab({ plan, outputs, mode, onRun, busy, projectId }: { plan: ExecutionPlan; outputs: PipelineOutputs; mode?: string; onRun: () => void; busy: boolean; projectId: string }) {
    const assumptions = outputs.problem_discovery?.assumptions_to_validate ?? plan.validation.challenged_assumptions;
    return <div className="space-y-6">
        <CenterIntelligenceSection
            projectId={projectId}
            workspace="evidence"
            headlineOverride="Gemini Evidence Verification & Assumption Stress-Test"
        />
        <div className="work-surface">
            <div className="work-surface-toolbar"><div><p className="section-kicker"><FlaskConical className="size-4 text-cyan-300" />Evidence ledger</p><h2 className="mt-2 text-xl font-semibold">What is known, inferred, and missing</h2></div><button className="btn-secondary" onClick={onRun} disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Refresh model analysis</button></div>
            <div className="evidence-warning"><AlertTriangle className="size-5 text-amber-300" /><div><p className="text-sm font-semibold">No live market connector is configured</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{mode === "provider" ? "Provider outputs are model analysis, not independently verified research." : "Current results are deterministic demo estimates."} Add primary evidence before treating market claims as facts.</p></div></div>
            <div className="evidence-table" role="table" aria-label="Evidence and assumptions">
                <div className="evidence-table-head" role="row"><span>Claim or assumption</span><span>Type</span><span>Source</span><span>Status</span></div>
                {assumptions.map((item) => <div className="evidence-table-row" role="row" key={item}><span className="font-medium">{item}</span><span className="text-amber-200">Hypothesis</span><span>Project + model</span><span className="flex items-center gap-2"><Circle className="size-3 text-amber-300" />Unverified</span></div>)}
                {plan.evidence.map((item) => <div className="evidence-table-row" role="row" key={item.title}><span className="font-medium">{item.title}</span><span>Context</span><span>{item.provider}</span><span className="flex items-center gap-2"><FileCheck2 className="size-3 text-cyan-300" />{item.freshness}</span></div>)}
            </div>
            <div className="evidence-actions"><div><h3 className="font-semibold">Close the highest-risk evidence gap</h3><p className="mt-2 text-sm text-muted-foreground">Run structured customer conversations and attach the observed outcomes to the active mission.</p></div><Link href="?view=mission" className="btn-primary">Open validation mission <ArrowRight className="size-4" /></Link></div>
        </div>
    </div>;
}

function AgentCouncil({ status, outputs, mode, onRun, busy }: { status?: PipelineStatusResponse; outputs: PipelineOutputs; mode?: string; onRun: () => void; busy: boolean }) {
    return <div className="work-surface">
        <div className="work-surface-toolbar"><div><p className="section-kicker"><Users className="size-4 text-violet-300" />Specialist council</p><h2 className="mt-2 text-xl font-semibold">Independent roles, one founder decision</h2></div><button className="btn-primary" onClick={onRun} disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}{status ? "Run new council" : "Convene council"}</button></div>
        <div className="council-grid">{stageMeta.map(({ key, label, role, icon: Icon }) => { const run = status?.runs.find((item) => item.stage === key); const output = outputs[key]; return <article className="council-agent" key={key}><div className="flex items-center gap-3"><span className="agent-mark"><Icon className="size-4" /></span><div><p className="text-sm font-semibold">{role} Agent</p><p className="text-xs text-muted-foreground">{label} perspective</p></div><span className={cn("ml-auto size-2", run?.status === "success" ? "bg-emerald-300" : run?.status === "running" ? "bg-cyan-300 animate-pulse" : "bg-muted-foreground")} /></div><p className="mt-5 line-clamp-4 text-sm leading-6 text-muted-foreground">{summaryFor(key, output) || "Awaiting a specialist run. No activity is simulated while the agent is idle."}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground"><span>{run?.provider || mode || "not run"}</span><span>{run?.status || "idle"}</span></div></article>; })}</div>
        <div className="council-synthesis"><div><p className="section-kicker"><ShieldCheck className="size-4 text-emerald-300" />Synthesis boundary</p><h3 className="mt-2 font-semibold">Verification is represented by the current investor/risk review.</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Reflection, execution, and growth are product roles expressed through execution plans and co-founder guidance; they are not separate backend agents yet. The interface does not invent debate events.</p></div><Link href="?view=mission" className="btn-secondary">Return to decision <ArrowRight className="size-4" /></Link></div>
    </div>;
}

function BuildWorkspace({ plan, outputs, onTask }: { plan: ExecutionPlan; outputs: PipelineOutputs; onTask: (id: string, status: ExecutionTaskStatus) => void }) {
    return <PhaseWorkspace phase="build" plan={plan} onTask={onTask} title="From requirement to working product" icon={Code2} intro={outputs.product_strategy?.value_proposition || plan.build.objective} side={<TechnicalMap plan={plan} />} />;
}
function LaunchCenter({ plan, onTask, projectId }: { plan: ExecutionPlan; onTask: (id: string, status: ExecutionTaskStatus) => void; projectId: string }) {
    return <div className="space-y-6">
        <CenterIntelligenceSection
            projectId={projectId}
            workspace="launch"
            headlineOverride="Gemini Launch Readiness & Cohort Defense"
        />
        <PhaseWorkspace phase="launch" plan={plan} onTask={onTask} title="Prepare one focused market entry" icon={Rocket} intro={plan.launch.objective} side={<div className="readiness-list"><p className="section-kicker">Preflight requirements</p>{plan.launch_checklist.map((item) => <div key={item}><Circle className="size-3" />{item}</div>)}</div>} />
    </div>;
}
function GrowthCommand({ plan, onTask, projectId }: { plan: ExecutionPlan; onTask: (id: string, status: ExecutionTaskStatus) => void; projectId: string }) {
    return <div className="space-y-6">
        <CenterIntelligenceSection
            projectId={projectId}
            workspace="growth"
            headlineOverride="Gemini Growth Optimization & Retention Engine"
        />
        <PhaseWorkspace phase="growth" plan={plan} onTask={onTask} title="Earn the right to scale" icon={TrendingUp} intro={plan.growth.objective} side={<div><p className="section-kicker">Measurement boundary</p><p className="mt-4 text-sm leading-6 text-muted-foreground">No product analytics or Stripe connector is enabled. Growth work remains a plan until real telemetry is connected.</p><div className="mt-5 space-y-3">{plan.growth.kpis.map((kpi) => <div className="metric-placeholder" key={kpi}><span>{kpi}</span><strong>Not connected</strong></div>)}</div></div>} />
    </div>;
}

function PhaseWorkspace({ phase, plan, onTask, title, icon: Icon, intro, side }: { phase: ExecutionPhase; plan: ExecutionPlan; onTask: (id: string, status: ExecutionTaskStatus) => void; title: string; icon: typeof Code2; intro: string; side: React.ReactNode }) {
    const data = plan[phase];
    return <div className="phase-layout"><section className="phase-main"><div className="work-surface-toolbar"><div><p className="section-kicker"><Icon className="size-4 text-cyan-300" />{phase} execution</p><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{intro}</p></div><span className="text-xs text-muted-foreground">Exit: {data.exit_criteria[0]}</span></div><div className="divide-y divide-border">{data.tasks.map((task) => <MissionRow key={task.id} task={task} onTask={onTask} expanded />)}</div></section><aside className="phase-side">{side}</aside></div>;
}

function MissionRow({ task, onTask, expanded = false }: { task: ExecutionTask; onTask: (id: string, status: ExecutionTaskStatus) => void; expanded?: boolean }) {
    const next: Record<ExecutionTaskStatus, ExecutionTaskStatus> = { todo: "in_progress", in_progress: "done", blocked: "in_progress", done: "todo" };
    return <div className="mission-row"><button className={cn("task-control", task.status === "done" && "task-control-done", task.status === "in_progress" && "task-control-active")} onClick={() => onTask(task.id, next[task.status])} aria-label={`Change status for ${task.title}`}>{task.status === "done" ? <Check className="size-4" /> : task.status === "in_progress" ? <LoaderCircle className="size-4" /> : <Circle className="size-3" />}</button><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className={cn("text-sm font-semibold", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</h3><span className="text-[11px] text-muted-foreground">{task.owner_role} · {task.duration_days}d</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{task.outcome}</p>{expanded && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="text-[11px] font-semibold text-foreground">Acceptance evidence</p>{task.acceptance_criteria.map((item) => <p className="mt-1 flex gap-2 text-xs text-muted-foreground" key={item}><ChevronRight className="mt-0.5 size-3 shrink-0" />{item}</p>)}</div><div><p className="text-[11px] font-semibold text-foreground">Recommended tools</p><p className="mt-1 text-xs text-muted-foreground">{task.recommended_tools.join(" · ") || "No tool specified"}</p></div></div>}</div><span className={cn("task-status", task.status === "done" && "text-emerald-300", task.status === "in_progress" && "text-cyan-300")}>{task.status.replaceAll("_", " ")}</span></div>;
}


function TechnicalMap({ plan }: { plan: ExecutionPlan }) { return <div><p className="section-kicker"><Database className="size-4" />Technical architecture</p><div className="mt-4 space-y-3">{plan.technical_blueprint.stack.map((item) => <div className="technical-layer" key={item.layer}><span>{item.layer}</span><strong>{item.choice}</strong><small>{item.reason}</small></div>)}</div><div className="mt-5 border-t border-border pt-4"><p className="text-xs text-muted-foreground">Architecture is an AI-generated baseline. Confirm it against team skills and product constraints.</p></div></div>; }
function Signal({ label, value }: { label: string; value: string }) { return <div className="signal-cell"><span>{label}</span><strong>{value}</strong></div>; }
function StateLine({ label, value }: { label: string; value: number }) { return <div><div className="flex justify-between text-xs"><span>{label}</span><span className="text-muted-foreground">{value}%</span></div><div className="state-track"><span style={{ width: `${value}%` }} /></div></div>; }
function summaryFor(stage: AgentStage, output: PipelineOutputs[AgentStage]) { if (!output) return ""; if ("executive_summary" in output) return output.executive_summary; if (stage === "product_strategy" && "product_vision" in output) return output.product_vision; if (stage === "finance" && "pricing_strategy" in output) return output.pricing_strategy; if (stage === "pitch_deck" && "one_liner" in output) return output.one_liner; if (stage === "vc_evaluation" && "concerns" in output) return output.concerns[0]; return ""; }
