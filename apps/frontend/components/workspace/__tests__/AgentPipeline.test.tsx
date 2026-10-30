import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentPipeline, CONSTITUTIONAL_7_STEPS } from "../AgentPipeline";
import type { PipelineStatusResponse, PipelineOutputs, ConstitutionAgent } from "@/types/api";

describe("AgentPipeline Component", () => {
  it("renders only initial agent by default and reveals all 7 when initialAgentIndex=7", () => {
    const { rerender } = render(
      <AgentPipeline
        projectId="proj-123"
        projectName="Orbit AI"
      />
    );

    // Initial state: only Step 1 is rendered sequentially
    expect(screen.getByText("Problem Discovery")).toBeInTheDocument();
    expect(screen.queryByText("Market Analysis")).not.toBeInTheDocument();

    // When initialAgentIndex=7, all 7 steps are rendered
    rerender(
      <AgentPipeline
        projectId="proj-123"
        projectName="Orbit AI"
        initialAgentIndex={7}
      />
    );

    // Verify all 7 steps are present
    expect(screen.getByText("Problem Discovery")).toBeInTheDocument();
    expect(screen.getByText("Market Analysis")).toBeInTheDocument();
    expect(screen.getByText("Feasibility Assessment")).toBeInTheDocument();
    expect(screen.getByText("PRD Generator")).toBeInTheDocument();
    expect(screen.getByText("System Design")).toBeInTheDocument();
    expect(screen.getByText("Autonomous Developer")).toBeInTheDocument();
    expect(screen.getByText("Risk Analysis")).toBeInTheDocument();

    // Verify the 7 step deliverables are mentioned
    expect(screen.getAllByText("problem.md").length).toBeGreaterThan(0);
    expect(screen.getAllByText("market.md").length).toBeGreaterThan(0);
    expect(screen.getAllByText("feasibility.json").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PRD.md").length).toBeGreaterThan(0);
    expect(screen.getAllByText("architecture.md & schema.sql").length).toBeGreaterThan(0);
    expect(screen.getAllByText("orbit.zip").length).toBeGreaterThan(0);
    expect(screen.getAllByText("risk.md").length).toBeGreaterThan(0);
  });

  it("disables and locks Steps 4-7 when Step 3 (Feasibility) fails with score < 80", () => {
    const outputs: PipelineOutputs = {
      problem_discovery: {
        stage: "problem_discovery",
        executive_summary: "Validated acute problem",
        focus_problem: "Inefficient manual workflows",
        problem_candidates: [],
        assumptions_to_validate: [],
        interview_questions: [],
      },
      market_analysis: {
        stage: "market_research",
        executive_summary: "Strong market potential",
        market_size: {
          tam_usd: 1000000000,
          sam_usd: 100000000,
          som_usd: 10000000,
          methodology: "top_down",
        },
        competitors: [],
        trends: [],
        opportunities: [],
        risks: [],
      },
      feasibility: {
        score: 68, // Fails < 80 threshold
        gate_passed: false,
        status: "failed",
        threshold: 80,
      },
    };

    const statusData: PipelineStatusResponse = {
      pipeline_run_id: "run-fail-1",
      project_id: "proj-123",
      status: "failed",
      runs: [
        {
          id: "r1",
          pipeline_run_id: "run-fail-1",
          stage: "problem_discovery",
          status: "success",
          mode: "demo",
          provider: "gemini",
          model: "Gemini 2.0 Flash",
          error_message: null,
          started_at: null,
          completed_at: null,
        },
        {
          id: "r2",
          pipeline_run_id: "run-fail-1",
          stage: "market_analysis",
          status: "success",
          mode: "demo",
          provider: "gemini",
          model: "Gemini 2.0 Flash",
          error_message: null,
          started_at: null,
          completed_at: null,
        },
        {
          id: "r3",
          pipeline_run_id: "run-fail-1",
          stage: "feasibility",
          status: "failed",
          mode: "demo",
          provider: "gemini",
          model: "Gemini 2.0 Flash",
          error_message: "Score 68 is below required threshold 80",
          started_at: null,
          completed_at: null,
        },
      ],
    };

    render(
      <AgentPipeline
        projectId="proj-123"
        projectName="Orbit AI"
        pipelineStatus="failed"
        statusData={statusData}
        outputs={outputs}
        initialAgentIndex={7}
      />
    );

    // Verify halt banner is visible
    expect(
      screen.getByText(/Pipeline halted: Idea did not pass Feasibility/i)
    ).toBeInTheDocument();

    // Verify Steps 4-7 show "Disabled" state pills
    const disabledPills = screen.getAllByText("Disabled");
    expect(disabledPills.length).toBe(4); // Steps 4, 5, 6, 7

    // Verify Step 3 shows Failed
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("keeps Download Project Zip button hidden when Step 7 is not done", () => {
    render(
      <AgentPipeline
        projectId="proj-123"
        projectName="Orbit AI"
      />
    );

    // Download button must only be shown when currentAgentIndex === 7 and status is done
    expect(screen.queryByText("Download Project Zip")).not.toBeInTheDocument();
  });

  it("activates massive Download Project Zip button when Step 7 is Done", () => {
    const onDownloadZip = vi.fn();
    const statusData: PipelineStatusResponse = {
      pipeline_run_id: "run-success-all",
      project_id: "proj-123",
      status: "completed",
      runs: CONSTITUTIONAL_7_STEPS.map((s, idx) => ({
        id: `r-${idx}`,
        pipeline_run_id: "run-success-all",
        stage: s.key as ConstitutionAgent,
        status: "success",
        mode: "demo",
        provider: "gemini",
        model: s.model,
        error_message: null,
        started_at: null,
        completed_at: null,
      })),
    };

    const outputs: PipelineOutputs = {
      feasibility: { score: 92, gate_passed: true, status: "passed", threshold: 80 },
      risk_analysis: { consensus_score: 95, overall_risk_rating: "low" },
    };

    render(
      <AgentPipeline
        projectId="proj-123"
        projectName="Orbit AI"
        pipelineStatus="completed"
        statusData={statusData}
        outputs={outputs}
        onDownloadZip={onDownloadZip}
      />
    );

    const downloadBtn = screen.getByRole("button", {
      name: /Download complete project ZIP/i,
    });
    expect(downloadBtn).not.toBeDisabled();
    expect(screen.getByText("Download Project Zip")).toBeInTheDocument();

    fireEvent.click(downloadBtn);
    expect(onDownloadZip).toHaveBeenCalledTimes(1);
  });
});
