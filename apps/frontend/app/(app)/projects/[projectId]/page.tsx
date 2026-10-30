"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Play, Loader2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { projectsApi, ApiError } from "@/lib/api/client";
import { ErrorState, LoadingState, StatusBadge } from "@/components/ui/core";
import { AgentPipeline } from "@/components/workspace/AgentPipeline";
import type { PipelineRunResponse } from "@/types/api";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = String(params.projectId);
  const client = useQueryClient();
  const [runError, setRunError] = useState<string | null>(null);

  // 1. Fetch project details
  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId),
    staleTime: 5000,
  });

  // 2. Query latest pipeline status
  const statusQuery = useQuery({
    queryKey: ["pipeline-status", projectId],
    queryFn: () => projectsApi.latestPipelineStatus(projectId),
    enabled: Boolean(projectId),
    staleTime: 3000,
    refetchInterval: (query) =>
      ["queued", "running"].includes(query.state.data?.status ?? "") ? 1500 : false,
  });

  // 3. Query pipeline result outputs
  const runId = statusQuery.data?.pipeline_run_id;
  const resultQuery = useQuery({
    queryKey: ["pipeline-result", projectId, runId],
    queryFn: () => {
      if (!runId) return null;
      return projectsApi.pipelineResult(projectId, runId);
    },
    enabled: Boolean(runId),
    staleTime: 5000,
  });

  // 4. Start 7-Agent pipeline mutation
  const startMutation = useMutation({
    mutationFn: () => projectsApi.startPipeline(projectId),
    onSuccess: (data: PipelineRunResponse) => {
      setRunError(null);
      client.invalidateQueries({ queryKey: ["pipeline-status", projectId] });
      client.invalidateQueries({ queryKey: ["pipeline-result", projectId] });
      client.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (cause) => {
      setRunError(
        cause instanceof ApiError
          ? cause.message
          : "The 7-Agent pipeline could not be started."
      );
    },
  });

  if (project.isLoading) {
    return <LoadingState label="Loading 7-Agent Workspace..." />;
  }

  if (project.isError || !project.data) {
    return (
      <ErrorState
        message={project.error?.message ?? "Startup project not found"}
        action={
          <Link href="/dashboard" className="btn-secondary">
            Return to Dashboard
          </Link>
        }
      />
    );
  }

  const isExecuting =
    startMutation.isPending ||
    statusQuery.data?.status === "running" ||
    statusQuery.data?.status === "queued";

  return (
    <div className="min-h-screen bg-[#07070F] text-white">
      {/* ── Single-Column Clean Container ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <StatusBadge status={project.data.status} />
            {project.data.industry && (
              <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                {project.data.industry}
              </span>
            )}
          </div>
        </div>

        {/* Inline Error Alert if start pipeline failed */}
        {runError && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs sm:text-sm font-mono"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0 text-red-400" />
            <span>{runError}</span>
          </div>
        )}

        {/* ── Clean 7-Agent Pipeline Vertical Stepper ── */}
        <AgentPipeline
          projectId={projectId}
          projectName={project.data.name}
          pipelineStatus={statusQuery.data?.status}
          statusData={statusQuery.data}
          outputs={resultQuery.data?.outputs || {}}
          isStarting={startMutation.isPending}
          onStartPipeline={() => startMutation.mutate()}
          onDownloadZip={() => {
            const activeRunId = statusQuery.data?.pipeline_run_id || "latest";
            window.open(
              `http://localhost:8000/api/runs/${activeRunId}/download/orbit.zip`,
              "_blank"
            );
          }}
        />
      </main>
    </div>
  );
}
