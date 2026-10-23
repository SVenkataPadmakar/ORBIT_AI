// apps/frontend/components/landing/CommandPalette.tsx
// Section 12: COMMAND PALETTE SPEC
// Cmd+K opens command palette (routes to sections #spark #validate #product #agents #galaxy #core + auth)
// Full keyboard traversal, aria modal, fast search

"use client";

import React, { useEffect, useRef } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Compass,
  Layers,
  Cpu,
  Orbit,
  Disc,
  Play,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemo?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenDemo }: CommandPaletteProps) {
  const router = useRouter();
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (hashOrUrl: string) => {
    onClose();
    if (hashOrUrl.startsWith("#")) {
      const el = document.querySelector(hashOrUrl);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(hashOrUrl);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-[20px] animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Orbit Command Palette"
    >
      <div
        ref={paletteRef}
        className="w-full max-w-xl bg-[#0A0A0F] border border-[#1E1E2A] rounded-2xl shadow-2xl overflow-hidden text-[#EDEDF2]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full" label="Command Menu">
          <div className="flex items-center px-4 border-b border-[#1A1A24] bg-[#07070B]">
            <Command.Input
              autoFocus
              placeholder="Search sections, agents, or actions..."
              className="w-full bg-transparent py-3.5 text-sm text-[#EDEDF2] placeholder-[#8A8A96] outline-none font-mono"
            />
            <button
              onClick={onClose}
              className="p-1.5 text-[#8A8A96] hover:text-[#EDEDF2] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
              aria-label="Close command palette"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs">
            <Command.Empty className="py-8 text-center text-[#8A8A96] font-mono">
              No matching commands found.
            </Command.Empty>

            <Command.Group heading="Scenes & Sections" className="text-[#8A8A96] font-mono px-2 py-1.5">
              <Command.Item
                onSelect={() => navigateTo("#spark")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
                <div className="flex items-center justify-between w-full">
                  <span>Scene 1: The Spark</span>
                  <span className="text-[10px] text-[#8A8A96] font-mono">#spark</span>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("#validate")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4 text-[#4ADE80]" />
                <div className="flex items-center justify-between w-full">
                  <span>Scene 2: Validation Orbit</span>
                  <span className="text-[10px] text-[#8A8A96] font-mono">#validate</span>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("#product")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Layers className="w-4 h-4 text-[#38BDF8]" />
                <div className="flex items-center justify-between w-full">
                  <span>Scene 3: Product Formation</span>
                  <span className="text-[10px] text-[#8A8A96] font-mono">#product</span>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("#agents")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Cpu className="w-4 h-4 text-[#A48BFF]" />
                <div className="flex items-center justify-between w-full">
                  <span>Scene 4: Agent Awakening</span>
                  <span className="text-[10px] text-[#8A8A96] font-mono">#agents</span>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("#galaxy")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Disc className="w-4 h-4 text-[#FBBF24]" />
                <div className="flex items-center justify-between w-full">
                  <span>Scene 5: Startup Galaxy</span>
                  <span className="text-[10px] text-[#8A8A96] font-mono">#galaxy</span>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("#core")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Orbit className="w-4 h-4 text-[#7C5CFF]" />
                <div className="flex items-center justify-between w-full">
                  <span>Scene 6: Orbit Core</span>
                  <span className="text-[10px] text-[#8A8A96] font-mono">#core</span>
                </div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions & Product" className="text-[#8A8A96] font-mono px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => {
                  onClose();
                  onOpenDemo?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <Play className="w-4 h-4 text-[#4ADE80]" />
                <span>Watch Product Demo (Walkthrough)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/login")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4 text-[#8A8A96]" />
                <span>Sign in to Founder Account</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/register")}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#EDEDF2] hover:bg-[#14141E] cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#7C5CFF]" />
                <span>Register New Organization</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1A1A24] text-[11px] text-[#8A8A96] bg-[#07070B] font-mono">
            <span>Use ↑↓ to navigate · Enter to select</span>
            <span>ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
