"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, ListFilter, Keyboard } from "lucide-react";
import Link from "next/link";
import { DemoChapter } from "@/lib/demo/demoTypes";
import { DEMO_CHAPTERS } from "@/lib/demo/demoData";
import { DemoVideoPlayer } from "./DemoVideoPlayer";
import { DemoChapterRail } from "./DemoChapterRail";
import { useDemoKeyboard } from "./useDemoKeyboard";

interface OrbitDemoCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrbitDemoCenter({ isOpen, onClose }: OrbitDemoCenterProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isMobileRailOpen, setIsMobileRailOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const activeChapter: DemoChapter = (DEMO_CHAPTERS[activeChapterIndex] ??
    DEMO_CHAPTERS[0]) as DemoChapter;

  // Callback to handle chapter selection
  const handleSelectChapter = useCallback(
    (chapter: DemoChapter, index: number) => {
      setActiveChapterIndex(index);
      setCurrentTime(chapter.timestamp);
    },
    []
  );

  // Keyboard shortcut handlers
  const handleTogglePlay = useCallback(() => {
    // Handled directly inside DemoVideoPlayer or via simulation
    const playBtn = document.querySelector(
      '[aria-label="Play demo video"], [aria-label="Pause demo"], [aria-label="Play demo"]'
    ) as HTMLButtonElement | null;
    if (playBtn) playBtn.click();
  }, []);

  const handleSeekBackward = useCallback(() => {
    const rewindBtn = document.querySelector(
      '[aria-label="Rewind 5 seconds"]'
    ) as HTMLButtonElement | null;
    if (rewindBtn) rewindBtn.click();
  }, []);

  const handleSeekForward = useCallback(() => {
    const forwardBtn = document.querySelector(
      '[aria-label="Fast-forward 5 seconds"]'
    ) as HTMLButtonElement | null;
    if (forwardBtn) forwardBtn.click();
  }, []);

  const handleToggleMute = useCallback(() => {
    const muteBtn = document.querySelector(
      '[aria-label="Unmute audio"], [aria-label="Mute audio"]'
    ) as HTMLButtonElement | null;
    if (muteBtn) muteBtn.click();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const fsBtn = document.querySelector(
      '[aria-label="Enter fullscreen"], [aria-label="Exit fullscreen"]'
    ) as HTMLButtonElement | null;
    if (fsBtn) fsBtn.click();
  }, []);

  useDemoKeyboard({
    isOpen,
    onTogglePlay: handleTogglePlay,
    onSeekBackward: handleSeekBackward,
    onSeekForward: handleSeekForward,
    onToggleMute: handleToggleMute,
    onToggleFullscreen: handleToggleFullscreen,
    onClose,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
          {/* Backdrop with Deep Cosmic Space Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="orbit-demo-title"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-7xl max-h-[96vh] flex flex-col rounded-3xl border border-white/10 bg-[#05050d] shadow-[0_0_120px_rgba(0,0,0,0.95)] z-10 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
              {/* Left Brand & Title */}
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h2
                    id="orbit-demo-title"
                    className="text-sm font-bold text-white tracking-tight flex items-center gap-2"
                  >
                    <span>Orbit Product Demo Experience</span>
                    <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      AI Founder Operating System
                    </span>
                  </h2>
                  <p className="text-xs text-white/50 font-mono">
                    Startup Mission:{" "}
                    <strong className="text-white/80 font-semibold">
                      AI Interview Preparation Platform
                    </strong>
                  </p>
                </div>
              </div>

              {/* Right Controls: Keyboard Shortcuts Hint, Mobile Drawer Toggle, Close Button */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
                  <Keyboard className="size-3 text-indigo-400" />
                  <span>Space: Play/Pause · Arrows: Seek · M: Mute · F: Fullscreen</span>
                </div>

                {/* Mobile Chapter Drawer Toggle */}
                <button
                  onClick={() => setIsMobileRailOpen((prev) => !prev)}
                  aria-label="Toggle chapter drawer"
                  className="lg:hidden px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-white/80 flex items-center gap-1.5"
                  data-cursor="hover"
                >
                  <ListFilter className="size-3.5 text-indigo-400" />
                  <span>Chapters</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  aria-label="Close demo modal"
                  className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all group"
                  data-cursor="hover"
                >
                  <X className="size-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Modal Body: Stage + Chapter Rail */}
            <div className="relative flex-1 p-3 sm:p-5 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
              {/* Central Video & Simulation Stage */}
              <DemoVideoPlayer
                activeChapter={activeChapter}
                activeChapterIndex={activeChapterIndex}
                onChapterChange={handleSelectChapter}
                onClose={onClose}
              />

              {/* Chapter Rail Navigation (Desktop aside, Mobile drawer) */}
              <DemoChapterRail
                activeChapterIndex={activeChapterIndex}
                currentTime={currentTime}
                onSelectChapter={handleSelectChapter}
                isOpenMobile={isMobileRailOpen}
                onCloseMobile={() => setIsMobileRailOpen(false)}
              />
            </div>

            {/* Modal Footer / Direct Transition */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-7 py-3 border-t border-white/[0.08] bg-white/[0.01]">
              <p className="text-xs text-white/60 text-center sm:text-left font-sans">
                Experience the complete 15-agent autonomous intelligence suite directly in your workspace.
              </p>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={onClose}
                  className="w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                  data-cursor="hover"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onClick={onClose}
                  className="w-full sm:w-auto text-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                  data-cursor="hover"
                >
                  <span>Register Account</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
