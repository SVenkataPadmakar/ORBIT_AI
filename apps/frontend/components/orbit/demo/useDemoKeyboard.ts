"use client";

import { useEffect } from "react";

interface DemoKeyboardOptions {
  isOpen: boolean;
  onTogglePlay: () => void;
  onSeekBackward: (seconds?: number) => void;
  onSeekForward: (seconds?: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

export function useDemoKeyboard({
  isOpen,
  onTogglePlay,
  onSeekBackward,
  onSeekForward,
  onToggleMute,
  onToggleFullscreen,
  onClose,
}: DemoKeyboardOptions) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onTogglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeekBackward(5);
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeekForward(5);
          break;
        case "KeyM":
          e.preventDefault();
          onToggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          onToggleFullscreen();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    onTogglePlay,
    onSeekBackward,
    onSeekForward,
    onToggleMute,
    onToggleFullscreen,
    onClose,
  ]);
}
