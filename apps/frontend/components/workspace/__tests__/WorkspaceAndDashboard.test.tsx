import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "@/app/(app)/dashboard/page";
import ProjectWorkspacePage from "@/app/(app)/projects/[projectId]/page";
import { projectsApi } from "@/lib/api/client";
import type { Project } from "@/types/api";

// Mock client API
vi.mock("@/lib/api/client", () => ({
  projectsApi: {
    list: vi.fn(),
    get: vi.fn(),
    latestPipelineStatus: vi.fn(),
    pipelineResult: vi.fn(),
    startPipeline: vi.fn(),
  },
  ApiError: class ApiError extends Error {},
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ projectId: "test-proj-1" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a clean grid of project cards with links routing to workspace", async () => {
    const mockProjects: Project[] = [
      {
        id: "proj-1",
        name: "Alpha Startup",
        idea_description: "An AI-powered legal copilot for contract analysis",
        status: "active",
        industry: "LegalTech",
        target_audience: "Law firms",
        budget_band: "$50k",
        goals: "Fast MVP",
        blueprint_status: "ready",
        owner_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "proj-2",
        name: "Beta Venture",
        idea_description: "Automated warehouse logistics dispatch engine",
        status: "draft",
        industry: "Logistics",
        target_audience: "Carriers",
        budget_band: "$100k",
        goals: "Scale",
        blueprint_status: "not_started",
        owner_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    vi.mocked(projectsApi.list).mockResolvedValueOnce({
      items: mockProjects,
      total: 2,
      offset: 0,
      limit: 50,
    });

    const client = createTestQueryClient();
    render(
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Alpha Startup")).toBeInTheDocument();
      expect(screen.getByText("Beta Venture")).toBeInTheDocument();
    });

    // Verify descriptions
    expect(
      screen.getByText(/An AI-powered legal copilot for contract analysis/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Automated warehouse logistics dispatch engine/i)
    ).toBeInTheDocument();

    // Verify project links route to /projects/[projectId]
    const links = screen.getAllByRole("link");
    const alphaLink = links.find((l) => l.getAttribute("href") === "/projects/proj-1");
    const betaLink = links.find((l) => l.getAttribute("href") === "/projects/proj-2");
    expect(alphaLink).toBeDefined();
    expect(betaLink).toBeDefined();

    // Verify 7-Agent pipeline CTA
    expect(screen.getAllByText("7-Agent Pipeline").length).toBe(2);
  });

  it("renders clean empty state when no projects exist", async () => {
    vi.mocked(projectsApi.list).mockResolvedValueOnce({
      items: [],
      total: 0,
      offset: 0,
      limit: 50,
    });

    const client = createTestQueryClient();
    render(
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No Projects Initialized Yet")).toBeInTheDocument();
      expect(screen.getByText("Create First Startup")).toBeInTheDocument();
    });
  });
});

describe("ProjectWorkspacePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders single-column view containing AgentPipeline", async () => {
    vi.mocked(projectsApi.get).mockResolvedValueOnce({
      id: "test-proj-1",
      name: "Autonomous Health",
      idea_description: "Healthcare diagnostics assistant",
      status: "active",
      industry: "HealthTech",
      target_audience: "Clinics",
      budget_band: "$75k",
      goals: "Trial launch",
      blueprint_status: "in_progress",
      owner_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    vi.mocked(projectsApi.latestPipelineStatus).mockResolvedValueOnce({
      pipeline_run_id: "run-h-1",
      project_id: "test-proj-1",
      status: "running",
      runs: [
        {
          id: "r-1",
          pipeline_run_id: "run-h-1",
          stage: "problem_discovery",
          status: "running",
          mode: "demo",
          provider: "gemini",
          model: "Gemini 2.0 Flash",
          error_message: null,
          started_at: null,
          completed_at: null,
        },
      ],
    });

    vi.mocked(projectsApi.pipelineResult).mockResolvedValueOnce({
      pipeline_run_id: "run-h-1",
      project_id: "test-proj-1",
      status: "running",
      runs: [],
      outputs: {},
    });

    const client = createTestQueryClient();
    render(
      <QueryClientProvider client={client}>
        <ProjectWorkspacePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Autonomous Health")).toBeInTheDocument();
      expect(screen.getByText("Problem Discovery")).toBeInTheDocument();
      expect(screen.getByText("Back to Projects")).toBeInTheDocument();
    });
  });
});
