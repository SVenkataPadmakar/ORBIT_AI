import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { LiveTerminal } from "../LiveTerminal";
import { useStartupStore } from "@/lib/stores/startup-store";

describe("LiveTerminal Component", () => {
  beforeEach(() => {
    cleanup();
    act(() => {
      useStartupStore.getState().clearTerminalLogs();
      useStartupStore.getState().resetPipelineProgress();
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty waiting state when no logs are present", () => {
    render(<LiveTerminal runId="test-run-123" />);

    expect(screen.getByText("Live Terminal")).toBeInTheDocument();
    expect(screen.getByText(/run:test-run/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Awaiting live execution logs/i)
    ).toBeInTheDocument();
  });

  it("appends and renders streaming logs in real time from store", () => {
    render(<LiveTerminal runId="test-run-123" />);

    act(() => {
      useStartupStore.getState().appendTerminalLog("Scanning competitor websites...");
      useStartupStore.getState().appendTerminalLog("Running sandbox build: npm install...");
    });

    expect(screen.getByText("Scanning competitor websites...")).toBeInTheDocument();
    expect(screen.getByText("Running sandbox build: npm install...")).toBeInTheDocument();
  });

  it("clears logs when trash icon is clicked", () => {
    render(<LiveTerminal runId="test-run-123" />);

    act(() => {
      useStartupStore.getState().appendTerminalLog("Temporary log line");
    });
    expect(screen.getByText("Temporary log line")).toBeInTheDocument();

    const clearBtn = screen.getByLabelText("Clear logs");
    fireEvent.click(clearBtn);

    expect(screen.queryByText("Temporary log line")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Awaiting live execution logs/i)
    ).toBeInTheDocument();
  });
});
