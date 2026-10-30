"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  X,
  Download,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Code2,
  ExternalLink,
} from "lucide-react";

export interface ArtifactViewerProps {
  isOpen: boolean;
  onClose: () => void;
  runId: string;
  agentName: string;
  stepTitle?: string;
  deliverableFilename?: string;
}

const BASE_URL = "http://localhost:8000";

export function ArtifactViewer({
  isOpen,
  onClose,
  runId,
  agentName,
  stepTitle,
  deliverableFilename,
}: ArtifactViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isJson, setIsJson] = useState<boolean>(false);

  const fetchArtifactContent = useCallback(async () => {
    if (!runId || !agentName) return;

    setLoading(true);
    setError(null);
    setContent("");

    const targetUrl = `${BASE_URL}/api/runs/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(agentName)}`;

    try {
      const response = await fetch(targetUrl);

      if (response.status === 404) {
        setError("File not found");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load artifact (${response.status}: ${response.statusText})`);
      }

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      // Check if response is JSON
      if (contentType.includes("application/json") || deliverableFilename?.endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          setContent(JSON.stringify(parsed, null, 2));
          setIsJson(true);
        } catch {
          setContent(text);
          setIsJson(false);
        }
      } else {
        setContent(text);
        setIsJson(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch file content";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [runId, agentName, deliverableFilename]);

  useEffect(() => {
    if (isOpen) {
      fetchArtifactContent();
    }
  }, [isOpen, fetchArtifactContent]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!content) return;
    const resolvedFilename = deliverableFilename || `${agentName}.${isJson ? "json" : "md"}`;
    const mimeType = isJson ? "application/json" : "text/markdown";
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const resolvedFilename = deliverableFilename || `${agentName}.${isJson ? "json" : "md"}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-3xl h-full bg-[#0B0D14] border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-white/10 bg-[#0E111A]/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Artifact Inspector
                  </span>
                  <span className="text-xs font-mono text-zinc-400 truncate">
                    {resolvedFilename}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-1 truncate">
                  {stepTitle || agentName.replace(/_/g, " ").toUpperCase()}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {content && !loading && !error && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                      title="Copy content"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadFile}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all active:scale-95"
                      title="Download file"
                    >
                      <Download className="size-3.5" />
                      <span>Download This File</span>
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close viewer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* ── Content Viewport ── */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
              {/* Loading State: Skeleton Loader */}
              {loading && (
                <div className="space-y-6 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="size-4 rounded-full bg-purple-500/40" />
                    <div className="h-4 w-48 rounded bg-white/10" />
                  </div>
                  <div className="h-8 w-3/4 rounded-lg bg-white/10" />
                  <div className="space-y-3 pt-4">
                    <div className="h-4 w-full rounded bg-white/5" />
                    <div className="h-4 w-5/6 rounded bg-white/5" />
                    <div className="h-4 w-4/6 rounded bg-white/5" />
                    <div className="h-4 w-full rounded bg-white/5" />
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-white/10" />
                    <div className="h-3 w-1/2 rounded bg-white/5" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-11/12 rounded bg-white/5" />
                    <div className="h-4 w-3/4 rounded bg-white/5" />
                  </div>
                </div>
              )}

              {/* Error State: 404 or other errors */}
              {!loading && error && (
                <div className="p-6 rounded-2xl border border-red-500/40 bg-red-950/20 text-red-200 space-y-3">
                  <div className="flex items-center gap-2.5 text-red-400 font-bold">
                    <AlertCircle className="size-5" />
                    <span className="text-base font-mono">
                      {error === "File not found" ? "File not found" : "Error Loading Artifact"}
                    </span>
                  </div>
                  <p className="text-xs text-red-300/80 leading-relaxed font-mono">
                    {error === "File not found"
                      ? `The artifact for agent '${agentName}' (${resolvedFilename}) has not been generated yet for run '${runId}'. Ensure the agent pipeline has finished executing.`
                      : error}
                  </p>
                  <button
                    onClick={fetchArtifactContent}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-colors"
                  >
                    Retry Fetching
                  </button>
                </div>
              )}

              {/* Success State: Markdown Render */}
              {!loading && !error && !isJson && (
                <div className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed font-sans prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-zinc-300/90 prose-strong:text-white prose-ul:my-2 prose-li:text-zinc-300 prose-code:text-purple-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}

              {/* Success State: JSON Render inside <pre> */}
              {!loading && !error && isJson && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="size-4 text-emerald-400" />
                      <span>Structured JSON Output</span>
                    </span>
                    <span>{content.split("\n").length} lines</span>
                  </div>
                  <pre className="p-4 rounded-xl font-mono text-xs text-emerald-400 bg-black/70 border border-white/10 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                    {content}
                  </pre>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#0E111A]/80 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
              <span className="truncate">
                Run ID: <span className="text-zinc-300">{runId}</span>
              </span>
              <a
                href={`${BASE_URL}/api/runs/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(agentName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>Raw Endpoint</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

