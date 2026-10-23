"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  Cpu,
  Tv,
  Settings,
} from "lucide-react";
import { DemoChapter } from "@/lib/demo/demoTypes";
import { DEMO_CHAPTERS, DEMO_TOTAL_DURATION } from "@/lib/demo/demoData";
import { DemoInteractiveStage } from "./DemoInteractiveStage";

interface DemoVideoPlayerProps {
  activeChapter: DemoChapter;
  activeChapterIndex: number;
  onChapterChange: (chapter: DemoChapter, index: number) => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function DemoVideoPlayer({
  activeChapter,
  activeChapterIndex,
  onChapterChange,
  onClose,
}: DemoVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEMO_TOTAL_DURATION);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [mode, setMode] = useState<"video" | "interactive">("interactive");
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Auto-hide controls when playing and mouse is still
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Sync simulation timer when in interactive mode and playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mode === "interactive" && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackRate;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          // Check if active chapter changed
          const newIdx = DEMO_CHAPTERS.findIndex(
            (ch) => next >= ch.timestamp && next < ch.timestamp + ch.duration
          );
          if (newIdx !== -1 && newIdx !== activeChapterIndex && DEMO_CHAPTERS[newIdx]) {
            onChapterChange(DEMO_CHAPTERS[newIdx] as DemoChapter, newIdx);
          }
          return next;
        });
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, isPlaying, playbackRate, duration, activeChapterIndex, onChapterChange]);

  // Handle Video Element Events
  const handleTimeUpdate = () => {
    if (!videoRef.current || mode !== "video") return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    const newIdx = DEMO_CHAPTERS.findIndex(
      (ch) => curr >= ch.timestamp && curr < ch.timestamp + ch.duration
    );
    if (newIdx !== -1 && newIdx !== activeChapterIndex && DEMO_CHAPTERS[newIdx]) {
      onChapterChange(DEMO_CHAPTERS[newIdx] as DemoChapter, newIdx);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || DEMO_TOTAL_DURATION);
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (mode === "video" && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {
          // If video file is missing or autoplay blocked, fallback to interactive mode
          setMode("interactive");
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [mode]);

  // Seek to specific timestamp
  const seekTo = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(duration, seconds));
      setCurrentTime(clamped);
      if (videoRef.current && mode === "video") {
        videoRef.current.currentTime = clamped;
      }
      const newIdx = DEMO_CHAPTERS.findIndex(
        (ch) => clamped >= ch.timestamp && clamped < ch.timestamp + ch.duration
      );
      if (newIdx !== -1 && newIdx !== activeChapterIndex && DEMO_CHAPTERS[newIdx]) {
        onChapterChange(DEMO_CHAPTERS[newIdx] as DemoChapter, newIdx);
      }
    },
    [duration, mode, activeChapterIndex, onChapterChange]
  );

  // Seek relative
  const seekRelative = useCallback(
    (delta: number) => {
      seekTo(currentTime + delta);
    },
    [currentTime, seekTo]
  );

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  // Playback rate change
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Sync seek when chapter changes externally (e.g. from Chapter Rail)
  useEffect(() => {
    seekTo(activeChapter.timestamp);
  }, [activeChapter.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex-1 aspect-video w-full max-h-[80vh] lg:max-h-[640px] bg-black rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col group select-none"
    >
      {/* ── Visual Stage: Real Video OR Interactive Simulation Fallback ── */}
      {mode === "video" && !videoError ? (
        <video
          ref={videoRef}
          preload="metadata"
          poster="/videos/demo-poster.webp"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => {
            setVideoError(true);
            setMode("interactive");
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        >
          <source src="/videos/demo.mp4" type="video/mp4" />
          <track
            src="/videos/captions/demo-en.vtt"
            kind="subtitles"
            srcLang="en"
            label="English"
            default={captionsEnabled}
          />
        </video>
      ) : (
        <div onClick={togglePlay} className="w-full h-full cursor-pointer">
          <DemoInteractiveStage
            chapter={activeChapter}
            currentTime={currentTime}
          />
        </div>
      )}

      {/* ── Mode Indicator Pill (Top Left) ── */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            setMode((prev) => (prev === "video" ? "interactive" : "video"));
            setVideoError(false);
          }}
          className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/15 backdrop-blur-xl text-xs font-mono text-white/90 flex items-center gap-2 transition-all shadow-lg"
          data-cursor="hover"
          title="Toggle between Video Stream and Interactive Simulation"
        >
          {mode === "video" ? (
            <>
              <Tv className="size-3.5 text-indigo-400" />
              <span>Video Stream</span>
            </>
          ) : (
            <>
              <Cpu className="size-3.5 text-cyan-400" />
              <span>Interactive Simulation</span>
            </>
          )}
        </button>

        <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/60 backdrop-blur-md">
          {activeChapter.title}
        </span>
      </div>

      {/* ── Center Big Play Button Overlay (when paused) ── */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
        >
          <button
            aria-label="Play demo video"
            className="size-16 sm:size-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all transform hover:scale-105"
            data-cursor="play"
          >
            <Play className="size-7 sm:size-8 fill-white ml-1" />
          </button>
        </div>
      )}

      {/* ── Player Controls Overlay (Bottom) ── */}
      <div
        className={`
          absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent
          transition-opacity duration-300 backdrop-blur-[2px]
          ${showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Progress Bar with Chapter Markers */}
        <div className="relative mb-3 group/progress">
          <input
            type="range"
            min={0}
            max={duration || DEMO_TOTAL_DURATION}
            step={0.5}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            aria-label="Video Seek Bar"
            aria-valuemin={0}
            aria-valuemax={duration || DEMO_TOTAL_DURATION}
            aria-valuenow={currentTime}
            className="w-full h-1.5 bg-white/20 hover:h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all"
            data-cursor="seek"
          />

          {/* Chapter Tick Marks */}
          <div className="absolute inset-x-0 top-0 h-1.5 pointer-events-none flex justify-between">
            {DEMO_CHAPTERS.map((ch) => {
              const leftPercent = (ch.timestamp / (duration || DEMO_TOTAL_DURATION)) * 100;
              return (
                <div
                  key={ch.id}
                  style={{ left: `${leftPercent}%` }}
                  title={ch.title}
                  className="absolute top-0 w-0.5 h-1.5 bg-white/40"
                />
              );
            })}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 text-white">
          {/* Left Controls: Play/Pause, Rewind, FastForward, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause demo" : "Play demo"}
              className="size-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              data-cursor="hover"
            >
              {isPlaying ? (
                <Pause className="size-4 fill-white" />
              ) : (
                <Play className="size-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => seekRelative(-5)}
              aria-label="Rewind 5 seconds"
              className="size-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              data-cursor="hover"
            >
              <RotateCcw className="size-3.5" />
            </button>

            <button
              onClick={() => seekRelative(5)}
              aria-label="Fast-forward 5 seconds"
              className="size-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              data-cursor="hover"
            >
              <RotateCw className="size-3.5" />
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-1.5 group/vol relative">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                className="size-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                data-cursor="hover"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Volume slider"
                className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-white/70">
              <span className="text-white font-semibold">
                {formatTime(currentTime)}
              </span>{" "}
              / <span>{formatTime(duration || DEMO_TOTAL_DURATION)}</span>
            </div>
          </div>

          {/* Right Controls: Playback Speed, Captions, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                aria-label="Change playback speed"
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-xs font-mono text-white/80 hover:text-white flex items-center gap-1 transition-colors"
                data-cursor="hover"
              >
                <Settings className="size-3" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 w-20 rounded-xl bg-[#0c0c16] border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col z-30">
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-3 py-1 text-left text-xs font-mono transition-colors ${
                        playbackRate === rate
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Captions Toggle */}
            <button
              onClick={() => setCaptionsEnabled((prev) => !prev)}
              aria-label={captionsEnabled ? "Disable subtitles" : "Enable subtitles"}
              aria-pressed={captionsEnabled}
              className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                captionsEnabled
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "hover:bg-white/10 text-white/50 hover:text-white"
              }`}
              data-cursor="hover"
            >
              <Subtitles className="size-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="size-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              data-cursor="hover"
            >
              {isFullscreen ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
