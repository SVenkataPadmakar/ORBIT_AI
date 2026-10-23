import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { WatchDemoModal } from "@/components/landing/WatchDemoModal";

describe("WatchDemoModal (Section 11)", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders when open with all 7 chapters and 7-segment navigation", () => {
    render(<WatchDemoModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: /Orbit Product Walkthrough Demo/i })).toBeInTheDocument();
    expect(screen.getByText(/ORBIT DEMO/i)).toBeInTheDocument();
    expect(screen.getByText(/Autonomous 7-Agent Pipeline Walkthrough/i)).toBeInTheDocument();

    // Verify step markers exist
    expect(screen.getByRole("button", { name: /Jump to Step 1: Idea Input/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jump to Step 2: Validation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jump to Step 3: Agents/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jump to Step 4: PRD/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jump to Step 5: Architecture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jump to Step 6: Sprint/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jump to Step 7: Launch/i })).toBeInTheDocument();
  });

  it("switches chapters when a chapter marker is clicked", async () => {
    render(<WatchDemoModal isOpen={true} onClose={vi.fn()} />);

    // Click Chapter 4 (PRD)
    const step4Btn = screen.getByRole("button", { name: /Jump to Step 4: PRD/i });
    fireEvent.click(step4Btn);

    expect(await screen.findByText(/Comprehensive technical product requirement doc synthesized/i)).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed or close button is clicked", () => {
    const handleClose = vi.fn();
    render(<WatchDemoModal isOpen={true} onClose={handleClose} />);

    // Click close button
    const closeBtn = screen.getByRole("button", { name: /Close demo modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
