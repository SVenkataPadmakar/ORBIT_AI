"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  ArrowRight,
  FolderKanban,
  Sparkles,
  Calendar,
  Layers,
  Bot,
} from "lucide-react";
import { projectsApi } from "@/lib/api/client";
import { ErrorState, LoadingState, StatusBadge } from "@/components/ui/core";
import type { Project } from "@/types/api";

export default function DashboardPage() {
  // Fetch founder startup projects
  const projectsQuery = useQuery({
    queryKey: ["projects", "dashboard-list"],
    queryFn: () => projectsApi.list({ limit: 50 }),
    staleTime: 5000,
  });

  if (projectsQuery.isLoading) {
    return <LoadingState label="Loading your startup ventures..." />;
  }

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

  const projects: Project[] = projectsQuery.data?.items || [];

  return (
    <div className="min-h-screen bg-[#07070F] text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ── Top Dashboard Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[11px] font-mono text-purple-300 mb-2">
              <Sparkles className="size-3 text-purple-400" />
              <span>7-AGENT AUTONOMOUS VENTURES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Projects Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Select a venture to inspect and execute the 7 specialized constitutional agents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>

        {/* ── Empty State ── */}
        {projects.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl">
            <div className="size-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <FolderKanban className="size-8 text-white" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              No Projects Initialized Yet
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mt-2 leading-relaxed">
              Initialize your first startup idea to launch the 7-Agent Constitutional pipeline:
              Problem Discovery → Market Analysis → Feasibility → PRD → Design → Developer → Risk Analysis.
            </p>

            <Link
              href="/projects/new"
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="size-4" />
              <span>Create First Startup</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          /* ── Clean Responsive Grid of Project Cards ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const formattedDate = project.created_at
                ? new Date(project.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-[#0B0D14]/80 hover:bg-[#0E111C]/90 hover:border-purple-500/50 backdrop-blur-xl shadow-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1"
                >
                  <div>
                    {/* Top Card Bar: Project Orb & Status Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="size-10 rounded-xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-white font-bold text-sm">
                        {project.name.slice(0, 1).toUpperCase()}
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    {/* Project Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {project.name}
                    </h3>

                    {/* Project Idea Description */}
                    <p className="text-xs sm:text-sm text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                      {project.idea_description || "Autonomous venture initialized via Orbit Copilot."}
                    </p>
                  </div>

                  {/* Card Footer: Metadata and Pipeline Route CTA */}
                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Bot className="size-3.5 text-purple-400" />
                      <span className="text-zinc-400">7-Agent Pipeline</span>
                    </div>

                    <div className="flex items-center gap-1 text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
