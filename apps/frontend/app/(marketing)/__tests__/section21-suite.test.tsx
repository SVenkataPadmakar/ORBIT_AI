import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { COLORS, RADII, MOTION } from "@/lib/design/tokens";
import { CommandPalette } from "@/components/landing/CommandPalette";
import { CoreStatic } from "@/components/landing/fallbacks/CoreStatic";

import { Navbar } from "@/components/landing/Navbar";
import { clampProgress } from "@/hooks/useScrollProgress";
import { metaballFragmentShader } from "@/shaders/metaball.frag";
import { sparkFragmentShader } from "@/shaders/spark.frag";
import { agentFragmentShader } from "@/shaders/agent.frag";
import { particlesFragmentShader } from "@/shaders/particles.frag";
import { implosionFragmentShader } from "@/shaders/implosion.frag";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Section 21 Test Suite", () => {
  describe("Unit: Design Tokens", () => {
    it("exports exact design tokens matching tokens.css", () => {
      expect(COLORS.bgVoid).toBe("#050507");
      expect(COLORS.bgSurface).toBe("#0A0A0F");
      expect(COLORS.fgPrimary).toBe("#EDEDF2");
      expect(COLORS.fgSecondary).toBe("#8A8A96");
      expect(COLORS.accent).toBe("#7C5CFF");
      expect(COLORS.signal).toBe("#4ADE80");

      expect(RADII.sm).toBe("6px");
      expect(RADII.md).toBe("12px");
      expect(RADII.lg).toBe("20px");
      expect(RADII.xl).toBe("32px");

      expect(MOTION.easeOutExpo).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
      expect(MOTION.durationBase).toBe(400);
    });
  });

  describe("Unit: useScrollProgress Clamping", () => {
    it("clamps values strictly within [0, 1]", () => {
      expect(clampProgress(-0.5)).toBe(0);
      expect(clampProgress(0)).toBe(0);
      expect(clampProgress(0.42)).toBe(0.42);
      expect(clampProgress(1)).toBe(1);
      expect(clampProgress(1.85)).toBe(1);
    });
  });

  describe("Unit: Shader Source Integrity", () => {
    it("exports valid, non-empty shader sources with LOW_QUALITY guards", () => {
      expect(metaballFragmentShader).toContain("LOW_QUALITY");
      expect(sparkFragmentShader.length).toBeGreaterThan(50);
      expect(agentFragmentShader).toContain("#define LOW_QUALITY");
      expect(particlesFragmentShader).toContain("#define LOW_QUALITY");
      expect(implosionFragmentShader).toContain("#define LOW_QUALITY");
    });
  });

  describe("Integration: Navbar Navigation (Section 12)", () => {
    it("renders brand, nav items, and triggers demo & command palette", () => {
      const handleDemo = vi.fn();
      const handlePalette = vi.fn();

      render(<Navbar onOpenDemo={handleDemo} onOpenCommandPalette={handlePalette} />);

      expect(screen.getByLabelText("Orbit Home")).toBeInTheDocument();
      expect(screen.getByText("Features")).toBeInTheDocument();
      expect(screen.getByText("How it works")).toBeInTheDocument();
      expect(screen.getByText("Demo")).toBeInTheDocument();
      expect(screen.getByText("Pricing")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Demo"));
      expect(handleDemo).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByLabelText(/Open command palette/i));
      expect(handlePalette).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration: Command Palette (Section 12)", () => {
    it("renders all 6 scenes and responds to ESC", () => {
      const handleClose = vi.fn();
      render(<CommandPalette isOpen={true} onClose={handleClose} onOpenDemo={vi.fn()} />);

      expect(screen.getByRole("dialog", { name: /Orbit Command Palette/i })).toBeInTheDocument();
      expect(screen.getByText(/Scene 1: The Spark/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 2: Validation Orbit/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 3: Product Formation/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 4: Agent Awakening/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 5: Startup Galaxy/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 6: Orbit Core/i)).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("A11y / Reduced Motion: CoreStatic Fallback", () => {
    it("renders full static fallback without WebGL", () => {
      render(<CoreStatic isStatic={true} onOpenDemo={vi.fn()} />);

      expect(screen.getByText(/ORBIT CORE/i)).toBeInTheDocument();
      expect(screen.getByText("ORBIT")).toBeInTheDocument();
      expect(screen.getByText(/AI Founder Operating System./i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Watch demo/i })).toBeInTheDocument();
      expect(screen.getByText(/ORBIT OS · CORE WORKSPACE/i)).toBeInTheDocument();
    });
  });
});
