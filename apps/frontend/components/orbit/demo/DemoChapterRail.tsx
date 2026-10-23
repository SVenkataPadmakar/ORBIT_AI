"use client";

import { motion } from "framer-motion";
import { List, CheckCircle, ChevronRight, Play } from "lucide-react";
import { DEMO_CHAPTERS } from "@/lib/demo/demoData";
import { DemoChapter } from "@/lib/demo/demoTypes";

interface DemoChapterRailProps {
  activeChapterIndex: number;
  currentTime: number;
  onSelectChapter: (chapter: DemoChapter, index: number) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function DemoChapterRail({
  activeChapterIndex,
  currentTime,
  onSelectChapter,
  isOpenMobile = false,
  onCloseMobile,
}: DemoChapterRailProps) {
  return (
    <aside
      aria-label="Demo Chapter Navigation"
      className={`
        flex flex-col bg-[#070711]/95 border border-white/[0.08] backdrop-blur-2xl
        rounded-2xl overflow-hidden transition-all duration-300
        w-full lg:w-80 xl:w-96 shrink-0 h-full max-h-[80vh] lg:max-h-[640px]
        ${isOpenMobile ? "fixed inset-x-4 bottom-4 top-20 z-50 lg:static" : "hidden lg:flex"}
      `}
    >
      {/* Chapter Rail Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <List className="size-4 text-indigo-400" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-white/90">
            Chapters ({DEMO_CHAPTERS.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-white/40">
          Chapter {String(activeChapterIndex + 1).padStart(2, "0")} of 12
        </span>
      </div>

      {/* Chapter List Scrollable */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {DEMO_CHAPTERS.map((chapter, index) => {
          const isActive = index === activeChapterIndex;
          const isPast = currentTime >= chapter.timestamp + chapter.duration;

          return (
            <button
              key={chapter.id}
              onClick={() => {
                onSelectChapter(chapter, index);
                if (onCloseMobile) onCloseMobile();
              }}
              aria-label={`Jump to Chapter ${chapter.title}`}
              aria-pressed={isActive}
              data-cursor="hover"
              className={`
                w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 group relative
                ${
                  isActive
                    ? "bg-indigo-500/10 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : "hover:bg-white/[0.03] border border-transparent text-white/70 hover:text-white"
                }
              `}
            >
              {/* Active / Status Indicator */}
              <div className="mt-0.5 shrink-0">
                {isActive ? (
                  <div className="size-5 rounded-md bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_8px_rgba(99,102,241,0.8)]">
                    <Play className="size-2.5 fill-white" />
                  </div>
                ) : isPast ? (
                  <div className="size-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="size-3" />
                  </div>
                ) : (
                  <div className="size-5 rounded-md bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/40 group-hover:text-white/70">
                    {String(chapter.number).padStart(2, "0")}
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-medium truncate ${
                      isActive ? "text-indigo-200 font-semibold" : "text-white/90"
                    }`}
                  >
                    {chapter.title}
                  </h4>
                  <span className="text-[10px] font-mono text-white/40 shrink-0">
                    {formatTime(chapter.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5 font-sans">
                  {chapter.description}
                </p>

                {/* Progress bar inside active chapter */}
                {isActive && (
                  <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            ((currentTime - chapter.timestamp) / chapter.duration) * 100
                          )
                        )}%`,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}
              </div>

              <ChevronRight
                className={`size-3.5 mt-1 text-white/20 transition-transform group-hover:translate-x-0.5 ${
                  isActive ? "text-indigo-400" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Chapter Rail Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between text-[11px] text-white/40">
        <span>Total Experience: 07:30</span>
        <span className="font-mono text-indigo-400">12 Milestone Stages</span>
      </div>
    </aside>
  );
}
