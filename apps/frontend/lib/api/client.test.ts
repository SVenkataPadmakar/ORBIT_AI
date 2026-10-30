import { describe, expect, it } from "vitest";
import { authApi, projectsApi, cofounderApi, getApiHealth } from "@/lib/api/client";
import { CONSTITUTIONAL_7_STEPS } from "@/components/workspace/AgentPipeline";

describe("Real API Client Contracts", () => {
    it("returns founder session on login", async () => {
        const session = await authApi.login({ email: "founder@orbit.dev", password: "password123" });
        expect(session.access_token).toBeDefined();
        expect(session.user.email).toBe("founder@orbit.dev");
        expect(session.user.role).toBe("founder");
    });

    it("lists projects with correct shape", async () => {
        const res = await projectsApi.list();
        expect(res.items.length).toBeGreaterThanOrEqual(1);
        expect(res.items[0]).toHaveProperty("name");
        expect(res.items[0]).toHaveProperty("blueprint_status");
    });

    it("fetches single project execution plan", async () => {
        const plan = await projectsApi.execution("startup-1");
        expect(plan.project_id).toBe("startup-1");
        expect(plan.build.tasks.length).toBeGreaterThanOrEqual(1);
        expect(plan.technical_blueprint.stack.length).toBeGreaterThan(0);
    });

    it("provides Socratic co-founder advice", async () => {
        const response = await cofounderApi.chat("What should we build first?", "startup-1");
        expect(response.answer).toBeDefined();
        expect(response.confidence_score).toBeGreaterThan(80);
        expect(response.suggested_actions.length).toBeGreaterThan(0);
    });

    it("reports healthy API status", async () => {
        const health = await getApiHealth();
        expect(health.status).toBe("healthy");
        expect(health.database).toBeDefined();
    });
});

describe("ORBIT Constitution Compliance", () => {
    it("defines exactly 7 constitutional agents in linear topology", () => {
        expect(CONSTITUTIONAL_7_STEPS.length).toBe(7);
        const expectedAgents = [
            "problem_discovery",
            "market_analysis",
            "feasibility",
            "prd_generator",
            "design",
            "developer",
            "risk_analysis",
        ];
        expect(CONSTITUTIONAL_7_STEPS.map((a) => a.key)).toEqual(expectedAgents);
        expect(CONSTITUTIONAL_7_STEPS.map((a) => a.step)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("assigns the constitutional AI models to each agent", () => {
        const models = CONSTITUTIONAL_7_STEPS.map((a) => a.model);
        expect(models[0]).toContain("Gemini 2.0 Flash");
        expect(models[1]).toContain("Gemini 2.0 Flash with Tavily");
        expect(models[2]).toContain("Gemini 2.0 Flash Structured JSON");
        expect(models[3]).toContain("Gemini 2.0 Flash Pydantic");
        expect(models[4]).toContain("Gemini 2.0 Flash");
        expect(models[5]).toContain("DeepSeek Coder");
        expect(models[6]).toContain("Gemini 2.0 Flash");
    });

    it("validates feasibility gate (score >= 80)", async () => {
        const feas = await projectsApi.artifact.feasibility("startup-1");
        const json = feas.content_json as Record<string, unknown> | null;
        expect(Number(json?.score)).toBeGreaterThanOrEqual(80);
    });

    it("fetches all 7 constitutional artifacts", async () => {
        const prob = await projectsApi.artifact.problem("startup-1");
        const mkt = await projectsApi.artifact.marketAnalysis("startup-1");
        const feas = await projectsApi.artifact.feasibility("startup-1");
        const prd = await projectsApi.artifact.prd("startup-1");
        const des = await projectsApi.artifact.design("startup-1");
        const dev = await projectsApi.artifact.developer("startup-1");
        const rsk = await projectsApi.artifact.risk("startup-1");

        expect(prob.content_markdown).toBeDefined();
        expect(mkt.content_markdown).toBeDefined();
        expect(feas.content_markdown).toBeDefined();
        expect(prd.content_markdown).toBeDefined();
        expect(des.content_markdown).toBeDefined();
        expect(dev.content_markdown).toBeDefined();
        expect(rsk.content_markdown).toBeDefined();
    });
});
