"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Plus,
  ChevronDown,
  Rocket,
  Compass,
  Layers,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { projectsApi } from "@/lib/api/client";
import { ErrorState, LoadingState } from "@/components/ui/core";
import { FounderMissionControl } from "@/components/mission-control/FounderMissionControl";
import type { Project, ExecutionTaskStatus } from "@/types/api";

export default function FounderMissionControlDashboardPage() {
  const client = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // 1. Fetch founder projects
  const projectsQuery = useQuery({
    queryKey: ["projects", "dashboard-list"],
    queryFn: () => projectsApi.list({ limit: 10 }),
  });

  const projects: Project[] = projectsQuery.data?.items || [];
  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // 2. Fetch execution plan for the active project
  const executionQuery = useQuery({
    queryKey: ["execution", activeProject?.id],
    queryFn: () => (activeProject ? projectsApi.execution(activeProject.id) : null),
    enabled: Boolean(activeProject?.id),
  });

  // 3. Fetch latest pipeline result / outputs if available
  const resultQuery = useQuery({
    queryKey: ["pipeline-result", activeProject?.id],
    queryFn: async () => {
      if (!activeProject) return null;
      try {
        const latest = await projectsApi.latestPipelineStatus(activeProject.id);
        if (!latest?.pipeline_run_id) return null;
        return await projectsApi.pipelineResult(activeProject.id, latest.pipeline_run_id);
      } catch {
        return null;
      }
    },
    enabled: Boolean(activeProject?.id),
  });

  // 3. Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      taskStatus,
    }: {
      taskId: string;
      taskStatus: ExecutionTaskStatus;
    }) => {
      if (!activeProject) throw new Error("No active project");
      return projectsApi.updateExecutionTask(activeProject.id, taskId, taskStatus);
    },
    onSuccess: (plan) => {
      if (activeProject) {
        client.setQueryData(["execution", activeProject.id], plan);
      }
    },
  });

  // 4. Start specialist pipeline run mutation
  const startPipelineMutation = useMutation({
    mutationFn: () => {
      if (!activeProject) throw new Error("No active project");
      return projectsApi.startPipeline(activeProject.id);
    },
    onSuccess: () => {
      if (activeProject) {
        client.invalidateQueries({ queryKey: ["project", activeProject.id] });
        client.invalidateQueries({ queryKey: ["execution", activeProject.id] });
      }
    },
  });

  // Loading State
  if (projectsQuery.isLoading) {
    return <LoadingState label="Initializing Founder Mission Control..." />;
  }

  // Error State
  if (projectsQuery.isError) {
    return (
      <ErrorState
        message={projectsQuery.error.message || "Failed to load founder projects"}
        action={
          <button
            className="btn-secondary"
            onClick={() => projectsQuery.refetch()}
          >
            Retry Connection
          </button>
        }
      />
    );
  }

  // Zero-State: If no projects exist yet
  if (projects.length === 0 || !activeProject) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(6,182,212,0.4)]">
            <Rocket className="size-8 text-white" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
              ORBIT V2 · MISSION CONTROL
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome to Founder Mission Control
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
              You haven&apos;t initialized a startup mission yet. Create your first autonomous startup
              project to activate the 15-agent specialist council and real-time execution telemetry.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projects/new"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
            >
              <Plus className="size-4" />
              <span>Initialize First Startup</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const executionPlan = executionQuery.data;

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Dashboard Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B0D14]/80 p-4 backdrop-blur-xl">
        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Compass className="size-5" />
          </div>

          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase block">
              Active Startup Mission
            </span>
            <div className="relative inline-block">
              {projects.length > 1 ? (
                <select
                  value={activeProject.id}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-sm sm:text-base font-bold text-white pr-8 focus:outline-none cursor-pointer appearance-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0B0D14] text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm sm:text-base font-bold text-white">
                  {activeProject.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Jump Links to Deep Workspace Modules */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${activeProject.id}?view=architecture`}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white transition-colors"
          >
            Architecture
          </Link>
          <Link
            href={`/projects/${activeProject.id}?view=sprints`}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white transition-colors"
          >
            Sprints
          </Link>
          <Link
            href={`/projects/${activeProject.id}?view=launch`}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white transition-colors"
          >
            Launch Gate
          </Link>
          <Link
            href={`/projects/${activeProject.id}?view=memory`}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white transition-colors"
          >
            Memory Vault
          </Link>

          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="size-3.5" />
            <span>New Mission</span>
          </Link>
        </div>
      </div>

      {/* ── Main Founder Mission Control Surface ── */}
      {executionPlan ? (
        <FounderMissionControl
          projectId={activeProject.id}
          projectName={activeProject.name}
          plan={executionPlan}
          outputs={resultQuery.data?.outputs || {}}
          onTriggerSpecialistCouncil={() => startPipelineMutation.mutate()}
          onTaskStatusUpdate={(taskId, status) =>
            updateTaskMutation.mutate({ taskId, taskStatus: status })
          }
        />
      ) : (
        <LoadingState label="Synchronizing mission telemetry..." />
      )}
    </div>
  );
}
