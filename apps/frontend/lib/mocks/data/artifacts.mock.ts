/**
 * apps/frontend/lib/mocks/data/artifacts.mock.ts
 * Detailed mock artifacts for research, PRD, roadmap, finance, pitch deck, and VC evaluation.
 */
import type { ReportArtifact, FinancialArtifact, PitchArtifact } from "@/types/api";

export function getMockResearchArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-res-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-stage-2-${projectId}`,
    report_type: "market_research",
    title: "Market Validation & Competitor Strategy Brief",
    content_markdown: `## Market Opportunity Overview\n\nHealthcare operations teams lose an estimated **4.2 hours weekly** per coordinator managing fragmented patient triage.\n\n### Key Metrics\n- **TAM:** $8.4B USD\n- **SAM:** $1.2B USD\n- **SOM:** $180M USD\n\n### Validated Wedge\nTarget high-volume outpatient clinics experiencing acute coordinator burnout. Automating urgency classification eliminates missed escalations and reduces patient wait times from 45 minutes to under 2 minutes.`,
    content_json: {
      tam_usd: 8400000000,
      sam_usd: 1200000000,
      som_usd: 180000000,
      confidence_score: 94,
    },
    version: 1,
    created_at: "2026-10-23T08:00:04.000Z",
    updated_at: "2026-10-23T08:00:04.000Z",
  };
}

export function getMockPrdArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-prd-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-stage-3-${projectId}`,
    report_type: "product_strategy",
    title: "Product Requirements Document (PRD)",
    content_markdown: `# PRD.md — Product Requirements Document\n\n## Executive Summary\n\nRelay Health is an autonomous operational command center for outpatient healthcare practices.\n\n### Core Value Proposition\nTransform fragmented triage and handoffs into structured, prioritized queues with automatic urgency extraction.\n\n### MVP Scope\n1. **Async Handoff Command Center:** Unified status overview with urgent task badges.\n2. **Urgency Classification Engine:** Multi-signal evaluation scoring severity from 1 to 10.\n3. **Audit Ledger:** Cryptographic traceability for every triage routing decision.`,
    content_json: {
      mvp_features: ["Async Command Center", "Urgency Classifier", "Audit Ledger"],
      target_release_weeks: 6,
    },
    version: 1,
    created_at: "2026-10-23T08:00:06.000Z",
    updated_at: "2026-10-23T08:00:06.000Z",
  };
}

export function getMockRoadmapArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-rdm-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-stage-3-${projectId}`,
    report_type: "roadmap",
    title: "Phased Technical & Launch Roadmap",
    content_markdown: `## Phase 1: Core Foundation (Weeks 1-4)\n- Complete Command Center UI layout and Next.js 15 App Router architecture.\n- Deploy local vector embeddings and Socratic Co-Founder assistance.\n\n## Phase 2: Pilot Deployment (Weeks 5-8)\n- Launch closed beta with 5 outpatient specialty clinics.\n- Measure coordinator adoption, latency reduction, and error rates.\n\n## Phase 3: Scale & Certification (Weeks 9-12)\n- Complete HIPAA & SOC2 Type II compliance reviews.\n- Open self-serve onboarding for outpatient group practices.`,
    content_json: {
      total_phases: 3,
      duration_weeks: 12,
    },
    version: 1,
    created_at: "2026-10-23T08:00:06.000Z",
    updated_at: "2026-10-23T08:00:06.000Z",
  };
}

export function getMockFinancialArtifact(projectId: string): FinancialArtifact {
  return {
    id: `art-fin-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-stage-4-${projectId}`,
    pricing_model: {
      starter: 199,
      pro: 499,
      enterprise: 1299,
    },
    forecast: [
      { period: "M1", revenue: 2495, expenses: 4200, balance: 45000 },
      { period: "M6", revenue: 18962, expenses: 11500, balance: 72000 },
      { period: "M12", revenue: 55888, expenses: 24000, balance: 195000 },
    ],
    cac_by_channel: [
      { channel: "Inbound SEO", cac_usd: 180, share: 45 },
      { channel: "Direct Outreach", cac_usd: 420, share: 35 },
      { channel: "EHR Marketplaces", cac_usd: 290, share: 20 },
    ],
    ltv_usd: 8980,
    ltv_cac_ratio: 5.2,
    runway_months: 18,
    assumptions: ["Monthly churn < 1.5%", "Gross margins > 82%"],
    created_at: "2026-10-23T08:00:08.000Z",
    updated_at: "2026-10-23T08:00:08.000Z",
  };
}

export function getMockPitchArtifact(projectId: string): PitchArtifact {
  return {
    id: `art-ptc-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-stage-5-${projectId}`,
    slides: [
      {
        number: 1,
        title: "Relay Health",
        headline: "The AI Operating System for Clinic Operations",
        bullets: ["Automates intake triage and eliminates patient handoff bottlenecks", "Founded by clinical operations and AI systems veterans"],
        speaker_notes: "Welcome investors. Today clinic operations are fundamentally broken.",
      },
      {
        number: 2,
        title: "The Problem",
        headline: "Outpatient clinics bleed time on fragmented triage",
        bullets: ["4+ hours lost per coordinator weekly", "Patient dissatisfaction and missed clinical escalations", "Manual spreadsheets replace proper audit trails"],
        speaker_notes: "Clinics rely on duct-taped solutions that increase staff burnout.",
      },
      {
        number: 3,
        title: "Our Solution",
        headline: "Real-time urgency classification and coordinator command",
        bullets: ["Sub-2 second triage response", "Direct EMR bidirectional synchronization", "Zero dropped follow-ups with cryptographic audit logging"],
        speaker_notes: "We give clinic staff superpowers while keeping doctors focused on care.",
      },
    ],
    business_plan_markdown: "# Relay Health Business Plan\n\nFull financial, technical, and market expansion plan.",
    executive_summary_markdown: "Relay Health creates high-margin software efficiency for outpatient medical practices.",
    exported_pptx_url: null,
    exported_pdf_url: "/ORBIT_Project_Complete_Explanation_Guide.pdf",
    created_at: "2026-10-23T08:00:10.000Z",
    updated_at: "2026-10-23T08:00:10.000Z",
  };
}

export function getMockVcArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-vc-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-7-${projectId}`,
    report_type: "vc_evaluation",
    title: "Venture Capital Evaluation Scorecard",
    content_markdown: `## Venture Capital Assessment\n\n- **Investment Readiness:** 91 / 100\n- **Recommendation:** **PROCEED TO SEED ROUND**\n\n### Scorecard Breakdown\n- **Market Defensibility:** 88/100\n- **Technical Architecture:** 94/100\n- **Unit Economics (LTV:CAC 5.2x):** 92/100\n\n### Diligence Notes\nConvincing founder vision with clear wedge in outpatient operations. Defensible switching costs once EMR workflows are operationalized.`,
    content_json: {
      score: 91,
      recommendation: "proceed",
      strengths: ["Clear ROI", "High LTV:CAC", "Low churn risk"],
    },
    version: 1,
    created_at: "2026-10-23T08:00:12.000Z",
    updated_at: "2026-10-23T08:00:12.000Z",
  };
}

// ─── 7 CONSTITUTIONAL ARTIFACTS ──────────────────────────────────────────────

export function getMockProblemArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-prob-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-1-${projectId}`,
    report_type: "problem_discovery",
    title: "problem.md — Problem Discovery & Pain Synthesis",
    content_markdown: `# problem.md\n\n## 1. Executive Problem Synthesis\nOutpatient clinics lose an average of **4.2 coordinator hours daily** manually resolving handoff bottlenecks and fragmented patient intake queues.\n\n## 2. Target Persona & Friction Points\n- **Primary Persona:** Clinic Operations Coordinator (Burnout rate > 65%)\n- **Secondary Persona:** Clinical Lead / Practice Owner (Revenue leakage from missed appointments)\n\n## 3. Evidence Matrix\n- 42 coordinator interviews across 18 high-volume specialty clinics\n- 78% of triage delays stem from disparate EMR and messaging silos`,
    content_json: {
      artifact_name: "problem.md",
      agent: "problem_discovery",
      model: "Gemini 2.0 Flash",
      evidence_interviews: 42,
      burnout_rate_pct: 65,
    },
    version: 1,
    created_at: "2026-10-23T08:00:02.000Z",
    updated_at: "2026-10-23T08:00:02.000Z",
  };
}

export function getMockMarketAnalysisArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-mkt-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-2-${projectId}`,
    report_type: "market_analysis",
    title: "market.md — Market Opportunity & Competitor Matrix",
    content_markdown: `# market.md\n\n## 1. Market Sizing (Tavily Search Validated)\n- **TAM:** $8.4B USD (US Healthcare Administration Automation)\n- **SAM:** $1.2B USD (Outpatient Specialty Group Practices)\n- **SOM:** $180M USD (Immediate 3-Year serviceable wedge)\n\n## 2. Competitor Matrix & Moat\n- **Legacy EHRs (Epic/Cerner):** Rigid, slow, unspecialized in asynchronous intake workflows.\n- **Generic Automation (Zapier):** Lacks HIPAA compliance and contextual medical urgency reasoning.\n- **ORBIT Moat:** Pre-trained triage prioritization with sub-2s latency and cryptographic decision ledger.`,
    content_json: {
      artifact_name: "market.md",
      agent: "market_analysis",
      model: "Tavily Search + Gemini",
      tam_usd: 8400000000,
      sam_usd: 1200000000,
      som_usd: 180000000,
    },
    version: 1,
    created_at: "2026-10-23T08:00:04.000Z",
    updated_at: "2026-10-23T08:00:04.000Z",
  };
}

export function getMockFeasibilityArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-feas-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-3-${projectId}`,
    report_type: "feasibility",
    title: "feasibility.json — Constitutional Gate Evaluation (Score: 92/100)",
    content_markdown: `# feasibility.json\n\n\`\`\`json\n{\n  "gate": "feasibility_passed",\n  "score": 92,\n  "threshold": 80,\n  "status": "proceed_to_prd",\n  "breakdown": {\n    "technical_feasibility": 94,\n    "regulatory_hipaa_compliance": 89,\n    "unit_economics": 93,\n    "go_to_market_viability": 92\n  },\n  "gate_passed": true\n}\n\`\`\``,
    content_json: {
      artifact_name: "feasibility.json",
      agent: "feasibility",
      model: "GPT-4o (strict JSON)",
      score: 92,
      threshold: 80,
      gate_passed: true,
      status: "proceed_to_prd",
    },
    version: 1,
    created_at: "2026-10-23T08:00:06.000Z",
    updated_at: "2026-10-23T08:00:06.000Z",
  };
}

export function getMockDesignArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-des-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-5-${projectId}`,
    report_type: "design",
    title: "architecture.md — System Architecture & Schema Contracts",
    content_markdown: `# architecture.md\n\n## 1. System Architecture\n- **Client:** Next.js 15 App Router, React 19, Tailwind CSS, Lucide, Zustand.\n- **Data Layer:** PostgreSQL 16 schema with strict handoff auditing.\n- **API Contract:** OpenAPI 3.1 YAML specification.\n\n## 2. Generated Artifacts Bundle\n- \`architecture.md\` (Complete topological system architecture)\n- \`schema.sql\` (Relational DDL for users, runs, artifacts & audit logs)\n- \`openapi.yaml\` (REST endpoint schemas & typed request/response models)\n- \`wireframes.md\` (ASCII UX component hierarchy & view transitions)`,
    content_json: {
      artifact_name: "architecture.md",
      agent: "design",
      model: "Claude 3.5 Sonnet",
      bundled_files: ["architecture.md", "schema.sql", "openapi.yaml", "wireframes.md"],
    },
    version: 1,
    created_at: "2026-10-23T08:00:10.000Z",
    updated_at: "2026-10-23T08:00:10.000Z",
  };
}

export function getMockDeveloperArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-dev-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-6-${projectId}`,
    report_type: "developer",
    title: "orbit.zip — Production Code, Tests & Infra Package",
    content_markdown: `# orbit.zip\n\n## E2B Sandbox Verification Summary\n- **Sandbox Environment:** E2B Linux MicroVM Container\n- **Build Status:** PASSED (0 taxonomy errors)\n- **Tests Passed:** 18 / 18 unit & integration tests\n- **Repair Attempts:** 0 / 5\n\n### Bundle Contents\n- \`/src\`: Complete TypeScript & Next.js application modules\n- \`/tests\`: Full coverage test suites\n- \`/infra\`: Dockerfile, docker-compose, and environment specifications`,
    content_json: {
      artifact_name: "orbit.zip",
      agent: "developer",
      model: "Claude 3.5 Sonnet + E2B",
      sandbox_provider: "E2B",
      build_passed: true,
      repairs_count: 0,
      archive_size_bytes: 421800,
    },
    version: 1,
    created_at: "2026-10-23T08:00:12.000Z",
    updated_at: "2026-10-23T08:00:12.000Z",
  };
}

export function getMockRiskArtifact(projectId: string): ReportArtifact {
  return {
    id: `art-rsk-${projectId}`,
    project_id: projectId,
    agent_run_id: `run-ag-7-${projectId}`,
    report_type: "risk_analysis",
    title: "risk.md — Constitutional Risk & Threat Model",
    content_markdown: `# risk.md\n\n## 1. Risk Assessment Matrix\n| Category | Risk Vector | Severity | Mitigation Strategy |\n| :--- | :--- | :--- | :--- |\n| **Regulatory** | HIPAA BAA requirements | High | Cryptographic audit ledger & zero-PHI storage |\n| **Technical** | EMR API sync latency | Medium | Resilient webhook queue & optimistic UI state |\n| **GTM** | Clinic coordinator switching inertia | Low | 1-click Slack/Teams integration wedge |\n\n## 2. Verdict & Readiness\nAll identified vectors mitigated. Autonomous consensus reached.`,
    content_json: {
      artifact_name: "risk.md",
      agent: "risk_analysis",
      model: "Claude 3.5 Sonnet",
      overall_risk_rating: "LOW",
      consensus_score: 96,
    },
    version: 1,
    created_at: "2026-10-23T08:00:14.000Z",
    updated_at: "2026-10-23T08:00:14.000Z",
  };
}

