import { DemoChapter } from "./demoTypes";

export const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: "chapter-01",
    number: 1,
    title: "01 — Introduction",
    timestamp: 0,
    duration: 30,
    description: "Overview of the Orbit AI Founder Operating System and autonomous co-founder paradigm.",
    narration: "What if a startup could be built with an AI founding team? Welcome to Orbit, the AI Founder Operating System transforming ideas into real, shipping products.",
    agentName: "Orbit System",
    agentColor: "#6366f1",
    stageBadge: "INITIALIZATION",
    previewState: {
      headline: "Orbit AI Founder Operating System",
      details: [
        "15 Specialized Autonomous AI Agents standing by",
        "LangGraph Cyclic Consensus Engine initialized",
        "Deterministic Computational Tools ready for execution",
        "Direct bridge between human vision and engineering reality"
      ],
      metrics: [
        { label: "ORCHESTRATION", value: "Active", trend: "Ready" },
        { label: "CONSENSUS ENGINE", value: "Cycle 0", trend: "Standby" },
        { label: "SPECIALIST ROSTER", value: "15 Agents", trend: "Loaded" }
      ],
      terminalLogs: [
        "[SYSTEM] Booting Orbit Kernel v2.4.0...",
        "[AUTH] Founder session validated: session_8f92a",
        "[LANGGRAPH] StateGraph compiled with 7 pipeline nodes",
        "[COFOUNDER] Socratic guidance layer standing by"
      ]
    }
  },
  {
    id: "chapter-02",
    number: 2,
    title: "02 — Creating Startup Mission",
    timestamp: 30,
    duration: 45,
    description: "Initializing mission for: 'AI Interview Preparation Platform' with target customer parameters.",
    narration: "We start by entering our core vision: an AI Interview Preparation Platform providing real-time behavioral and technical mock interviews with automated rubric feedback.",
    agentName: "Mission Control",
    agentColor: "#8b5cf6",
    stageBadge: "MISSION CREATION",
    previewState: {
      headline: "Mission: AI Interview Preparation Platform",
      details: [
        "Sector: EdTech & Career Acceleration",
        "Value Wedge: Real-time low-latency speech feedback for candidate prep",
        "Target ICP: Software engineers & mid-career job switchers",
        "Constraints: 90-day runway to initial MVP validation"
      ],
      metrics: [
        { label: "MISSION CONTEXT", value: "Established", trend: "+100%" },
        { label: "INITIAL AGENTS", value: "15 Queued", trend: "Parallel" },
        { label: "WORKSPACE SCOPE", value: "Defined", trend: "Validated" }
      ],
      terminalLogs: [
        "[MISSION] Creating project 'ai-interview-prep' [UUID: e41b-48cd]",
        "[EMBEDDINGS] Ingesting sector context into Project Memory...",
        "[EVENT] Broadcasted MISSION_ACTIVATED to event bus",
        "[DISPATCH] Parallelizing Problem Discovery & Market Research"
      ]
    }
  },
  {
    id: "chapter-03",
    number: 3,
    title: "03 — Problem Discovery",
    timestamp: 75,
    duration: 30,
    description: "Problem Discovery Agent identifies candidate pain points, high anxiety, and lack of actionable feedback.",
    narration: "The Problem Discovery Agent activates, analyzing candidate friction, real-time stress, and unvalidated market assumptions.",
    agentName: "Problem Discovery Agent",
    agentColor: "#06b6d4",
    stageBadge: "RESEARCH",
    previewState: {
      headline: "Validated Problem Statements",
      details: [
        "Acute Anxiety: 78% of candidates report panic during unexpected system design questions",
        "Vague Feedback: Existing peer mocks fail to provide structured scoring rubrics",
        "High Cost: Human coaching costs $150–$300/hour, inaccessible to students",
        "Static Question Fatigue: LeetCode solves algorithms, not verbal delivery"
      ],
      metrics: [
        { label: "PROBLEM SEVERITY", value: "8.9 / 10", trend: "Critical" },
        { label: "INTERVIEW FRICTION", value: "78%", trend: "Pervasive" },
        { label: "COACHING COST GAP", value: "$200/hr", trend: "High Margin" }
      ],
      terminalLogs: [
        "[PROBLEM_AGENT] Ingesting 2,400 developer survey vectors...",
        "[SYNTHESIS] Identified 3 critical friction clusters",
        "[VALIDATION] Correlated friction with candidate churn rate",
        "[ARTIFACT] ProblemDiscoveryDocument generated"
      ]
    }
  },
  {
    id: "chapter-04",
    number: 4,
    title: "04 — Market Research",
    timestamp: 105,
    duration: 45,
    description: "Market Research Agent estimates TAM ($18.4B), SAM ($4.2B), and SOM ($650M) with competitor moats.",
    narration: "Market Research calculates total addressable market at 18.4 billion dollars, mapping competitors and defensibility moats.",
    agentName: "Market Research Agent",
    agentColor: "#10b981",
    stageBadge: "MARKET RESEARCH",
    previewState: {
      headline: "Market Sizing & Competitive Topology",
      details: [
        "TAM: $18.4B (Global Technical Recruitment & Career Upskilling)",
        "SAM: $4.2B (Software Engineering Mock Prep & Interview Readiness)",
        "SOM: $650M (Self-serve AI Audio-First Mock Platform for CS grads)",
        "Competitors: Pramp (high latency, peer matching), Interviewing.io (premium $250 mocks)"
      ],
      metrics: [
        { label: "TAM", value: "$18.4B", trend: "+14% CAGR" },
        { label: "SAM", value: "$4.2B", trend: "High Growth" },
        { label: "SOM (Year 2)", value: "$650M", trend: "Achievable" }
      ],
      terminalLogs: [
        "[TOOL_CALL] estimate_market_size(vertical='technical_interviews')",
        "[OUTPUT] TAM calculated via top-down + bottom-up triangulation",
        "[BENCHMARK] Competitor latency evaluated: Pramp=1400ms, Orbit=120ms",
        "[CONSENSUS] Market viability score: 92/100"
      ]
    }
  },
  {
    id: "chapter-05",
    number: 5,
    title: "05 — Product Strategy",
    timestamp: 150,
    duration: 45,
    description: "Product Strategy Agent prioritizes MVP scope, core personas, and 80/20 feature boundaries.",
    narration: "Translating research into decisive MVP scope, user personas, and a ruthless 80/20 feature priority list.",
    agentName: "Product Strategy Agent",
    agentColor: "#f59e0b",
    stageBadge: "STRATEGY",
    previewState: {
      headline: "MVP Scope & Feature Prioritization",
      details: [
        "P0 Feature: Real-time conversational audio agent with live transcription",
        "P0 Feature: Automated 5-factor rubric feedback (Architecture, Speed, Clarity, Trade-offs, Edge Cases)",
        "P1 Feature: Company-specific mock simulations (Google, Meta, Stripe style)",
        "P2 Deprioritized: Video avatar rendering (high GPU cost, low value for audio mocks)"
      ],
      metrics: [
        { label: "MVP SCOPE", value: "4 Core Features", trend: "Ruthless" },
        { label: "SPRINT BUDGET", value: "6 Weeks", trend: "Controlled" },
        { label: "RETENTION HOOK", value: "Score Tracking", trend: "Daily Loop" }
      ],
      terminalLogs: [
        "[STRATEGY] Filtering 28 feature proposals down to P0 core",
        "[REJECTION] Cut video avatar synthesis to protect runway",
        "[PERSONA] Primary: 'Alex', 24yo Junior Engineer facing 1st on-site",
        "[PRD] Generated Product Requirements Document v1.0"
      ]
    }
  },
  {
    id: "chapter-06",
    number: 6,
    title: "06 — UI/UX Architect",
    timestamp: 195,
    duration: 45,
    description: "UI/UX Architect synthesizes design tokens, component hierarchies, and interactive interview wireframes.",
    narration: "Establishing component hierarchy, cosmic dark design tokens, and high-fidelity candidate dashboard wireframes.",
    agentName: "UI/UX Architect Agent",
    agentColor: "#ec4899",
    stageBadge: "DESIGN SYSTEM",
    previewState: {
      headline: "Component Hierarchy & Interactive Wireframes",
      details: [
        "Design System: Deep Space Obsidian (#030308) with electric cyan/indigo accents",
        "Mock Interview View: Split audio waveform visualizer + interactive collaborative code editor",
        "Scoring HUD: Real-time confidence metrics, speaking cadence, and filler word detection",
        "Accessibility: WCAG 2.1 AA compliant contrast ratios and keyboard-only test navigation"
      ],
      metrics: [
        { label: "DESIGN TOKENS", value: "64 Exported", trend: "CSS Variables" },
        { label: "ACCESSIBILITY", value: "WCAG AA", trend: "100% Pass" },
        { label: "USER FLOWS", value: "3 Core Paths", trend: "Optimized" }
      ],
      terminalLogs: [
        "[UI_AGENT] Synthesizing component hierarchy for /interview/live",
        "[ACCESSIBILITY] Auditing contrast ratios: min 4.8:1 achieved",
        "[SPECS] Wireframes and responsive breakpoints defined",
        "[FIGMA] Vector tokens compiled into Tailwind configuration"
      ]
    }
  },
  {
    id: "chapter-07",
    number: 7,
    title: "07 — Technical Architect",
    timestamp: 240,
    duration: 45,
    description: "Technical Architect outputs PostgreSQL DDL schemas, OpenAPI 3.1 REST contracts, and system topology.",
    narration: "Formulating production-grade PostgreSQL DDL schemas, OpenAPI 3.1 REST contracts, and async WebSockets topology.",
    agentName: "Technical Architect Agent",
    agentColor: "#3b82f6",
    stageBadge: "ARCHITECTURE",
    previewState: {
      headline: "System Topology & Relational Schemas",
      details: [
        "Backend: FastAPI async microservice with WebSocket speech streaming",
        "Database: PostgreSQL with pgvector for semantic question retrieval",
        "Caching: Redis for session state and live token rate limiting",
        "Speech Pipeline: Sub-120ms WebRTC audio streaming directly to LangGraph engine"
      ],
      metrics: [
        { label: "TARGET LATENCY", value: "< 120ms", trend: "Sub-second" },
        { label: "DDL VALIDATION", value: "Clean Syntax", trend: "0 Errors" },
        { label: "API ENDPOINTS", value: "14 Routes", trend: "OpenAPI 3.1" }
      ],
      codePreview: {
        title: "schema.sql — Relational PostgreSQL DDL",
        language: "sql",
        code: `CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES users(id),
  track VARCHAR(50) NOT NULL, -- 'system_design' | 'algorithms'
  rubric_score NUMERIC(4,2),
  feedback_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_candidate ON interview_sessions(candidate_id, created_at DESC);`
      },
      terminalLogs: [
        "[TECH_ARCHITECT] Evaluating async WebSockets vs Server-Sent Events",
        "[TOOL_CALL] validate_ddl_schema(table='interview_sessions')",
        "[DDL] 0 syntax errors. Foreign keys and indexes verified",
        "[OPENAPI] Contract generated: 14 REST routes + 1 WebSocket stream"
      ]
    }
  },
  {
    id: "chapter-08",
    number: 8,
    title: "08 — Sprint Planner",
    timestamp: 285,
    duration: 30,
    description: "Sprint Planner converts specs into 18 backlog tickets across 3 two-week agile development sprints.",
    narration: "Turning architectural specifications into two-week agile Kanban sprints with acceptance criteria.",
    agentName: "Sprint Planner Agent",
    agentColor: "#14b8a6",
    stageBadge: "PLANNING",
    previewState: {
      headline: "Two-Week Agile Execution Roadmap",
      details: [
        "Sprint 1 (Weeks 1-2): WebRTC audio stream pipeline & question vector database",
        "Sprint 2 (Weeks 3-4): Real-time speech transcription & 5-factor rubric scoring engine",
        "Sprint 3 (Weeks 5-6): Candidate dashboard, performance history, and Stripe billing",
        "Total Tickets: 18 stories with test coverage acceptance criteria"
      ],
      metrics: [
        { label: "SPRINT CADENCE", value: "14 Days", trend: "Bi-weekly" },
        { label: "TOTAL BACKLOG", value: "18 User Stories", trend: "Assigned" },
        { label: "VELOCITY TARGET", value: "32 Pts / Sprint", trend: "Calibrated" }
      ],
      terminalLogs: [
        "[SPRINT_AGENT] Parsing PRD and Technical Architecture into epics",
        "[TICKETS] Generated 18 Kanban items with DoD (Definition of Done)",
        "[ESTIMATION] Story point weighting calculated via historical velocity",
        "[EXPORT] Backlog synchronized to Mission Control workspace"
      ]
    }
  },
  {
    id: "chapter-09",
    number: 9,
    title: "09 — Gemini Co-Founder",
    timestamp: 315,
    duration: 45,
    description: "Founder asks: 'What should I build first?' — Gemini evaluates trade-offs, warns against risks, and outlines next actions.",
    narration: "Founder asks: What should I build first? Gemini evaluates trade-offs, warns against building complex question banks before validating WebRTC voice latency, and outlines immediate next actions.",
    agentName: "Gemini Co-Founder",
    agentColor: "#818cf8",
    stageBadge: "CO-FOUNDER INTELLIGENCE",
    previewState: {
      headline: "Socratic Co-Founder Advisory Session",
      details: [
        "Founder Prompt: 'What should I build first to validate willingness to pay?'",
        "Gemini Recommendation: Do NOT build custom question banks or user auth first.",
        "Critical Risk Identified: If audio turnaround latency exceeds 300ms, candidates lose conversational immersion.",
        "Next Action: Ship a 1-page WebRTC audio test with 3 standard system design questions to 25 target candidates."
      ],
      metrics: [
        { label: "STRATEGIC FOCUS", value: "Audio Latency", trend: "P0 Priority" },
        { label: "RISK MITIGATION", value: "High Severity", trend: "Addressed" },
        { label: "VALIDATION TIME", value: "48 Hours", trend: "Fast Feedback" }
      ],
      terminalLogs: [
        "[COFOUNDER] Analyzing founder query: 'What should I build first?'",
        "[REASONING] Evaluating product risk: Latency > Catalog size",
        "[WARNING] Alerted founder against premature database optimization",
        "[PRESCRIPTION] Recommended 48-hour audio-first smoke test"
      ]
    }
  },
  {
    id: "chapter-10",
    number: 10,
    title: "10 — Startup Blueprint",
    timestamp: 360,
    duration: 45,
    description: "Orbit consolidates 15 agent outputs into an investor-ready, engineering-executable Startup Blueprint.",
    narration: "All 15 specialist outputs converge into one unified, investor-ready PRD, schema, and API bundle.",
    agentName: "Consensus Engine",
    agentColor: "#a855f7",
    stageBadge: "CONVERGENCE",
    previewState: {
      headline: "Consolidated Living Startup Blueprint",
      details: [
        "Product Requirements Document (PRD) with user stories & persona profiles",
        "Validated PostgreSQL Relational Schema with performance indexing",
        "OpenAPI 3.1 REST & WebSocket Communication Specifications",
        "Three 14-day Kanban Sprints with complete acceptance criteria",
        "Unit Economics model: CAC $42, LTV $210, Payback period 2.4 months"
      ],
      metrics: [
        { label: "BLUEPRINT ARTIFACTS", value: "6 Packages", trend: "Complete" },
        { label: "CONSENSUS SCORE", value: "96 / 100", trend: "Unanimous" },
        { label: "FOUNDER READINESS", value: "Production Ready", trend: "100%" }
      ],
      terminalLogs: [
        "[CONSENSUS] Final multi-agent consensus round executed",
        "[CONVERGENCE] Merging 15 specialist artifact schemas into Blueprint",
        "[VALIDATION] Verifying cross-document consistency: 0 discrepancies",
        "[EXPORT] Blueprint locked and staged for deployment"
      ]
    }
  },
  {
    id: "chapter-11",
    number: 11,
    title: "11 — Launch Center",
    timestamp: 405,
    duration: 30,
    description: "Launch Center validates pre-flight security headers, SSL certificates, and zero-day rollback triggers.",
    narration: "Pre-flight verification audits security headers, SSL certificates, and zero-day rollback triggers.",
    agentName: "Launch Agent",
    agentColor: "#22c55e",
    stageBadge: "LAUNCH READY",
    previewState: {
      headline: "Pre-Flight Launch Readiness Checklist",
      details: [
        "Infrastructure: Vercel edge deployment with Neon serverless Postgres",
        "Security Audit: Content-Security-Policy, HSTS, and CORS origin whitelisting passed",
        "Rollback Plan: Zero-downtime blue/green deployment triggers configured",
        "Growth Tracking: PostHog event instrumentation on interview completion flow"
      ],
      metrics: [
        { label: "READINESS SCORE", value: "94 / 100", trend: "Go For Launch" },
        { label: "SECURITY AUDIT", value: "Clean Pass", trend: "A+ Rating" },
        { label: "RECOVERY TIME", value: "< 30s", trend: "Automated" }
      ],
      terminalLogs: [
        "[LAUNCH_AGENT] Running automated pre-flight verification checklist...",
        "[AUDIT] SSL/TLS certificates and security headers validated",
        "[TELEMETRY] Sentry and PostHog error tracking verified",
        "[STATUS] System status: CLEARED FOR LAUNCH"
      ]
    }
  },
  {
    id: "chapter-12",
    number: 12,
    title: "12 — Closing",
    timestamp: 435,
    duration: 15,
    description: "The complete journey from raw idea to living operating system. Powered By Orbit.",
    narration: "From Idea To Product. Powered By Orbit.",
    agentName: "Orbit Intelligence Core",
    agentColor: "#6366f1",
    stageBadge: "FOUNDER EMPOWERED",
    previewState: {
      headline: "From Idea To Product. Powered By Orbit.",
      details: [
        "Autonomous AI orchestration for ambitious founders",
        "Transforming raw intuition into engineered execution",
        "Sign in or register to launch your startup mission today"
      ],
      metrics: [
        { label: "ORBIT FOUNDER OS", value: "Online", trend: "Active" },
        { label: "TIME TO BLUEPRINT", value: "Minutes", trend: "Instant" },
        { label: "INTELLIGENCE CORE", value: "Operational", trend: "Infinite" }
      ],
      terminalLogs: [
        "[MISSION] AI Interview Preparation Platform mission blueprint ready",
        "[ORBIT] Intelligence core steady at optimal resonance",
        "[ACTION] Ready for founder sign-in and direct execution"
      ]
    }
  }
];

export const DEMO_TOTAL_DURATION = 450; // 7 minutes 30 seconds
