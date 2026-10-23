# ORBIT v2 — UI Wireframes & Layout Blueprints

**Author**: UIAgent (Division B4)  
**Coordination**: Mapped 1:1 with APIContractAgent (`packages/shared/openapi.yaml`) and SystemArchitectAgent (`docs/ARCHITECTURE.md`).

---

## Page Mapping Matrix (UI Page ↔ API Endpoint)

| Page Route | Page Title / Role | Primary B3 API Endpoint | Primary Components |
|---|---|---|---|
| `/login` | Auth Portal | `POST /api/v1/auth/login` | `LoginForm`, `OAuthButtons`, `AuthPortalCanvas` |
| `/dashboard` | Pipeline Dashboard | `GET /api/v1/runs`, `GET /api/v1/orgs` | `OrgHeader`, `RunCardGrid`, `StatsSummary`, `NewRunCTA` |
| `/runs/new` | Idea Intake & Clarification | `POST /api/v1/runs`, `POST /api/v1/runs/{id}/clarify` | `IdeaPromptInput`, `ClarityGauge`, `ClarifyingModal` |
| `/runs/[id]` | Live Execution Canvas | `GET /api/v1/runs/{id}` (SSE stream) | `GraphCanvas22Node`, `TelemetryTerminal`, `RepairBanner` |
| `/runs/[id]/spec` | Spec & Scope Inspector | `GET /api/v1/runs/{id}/spec` | `PRDMarkdownViewer`, `ScopeContractMatrix`, `LockBadge` |
| `/runs/[id]/artifacts`| Monorepo File Browser | `GET /api/v1/runs/{id}/artifacts` | `FileTreeNav`, `SyntaxHighlighter`, `HashVerifier` |
| `/runs/[id]/repairs`| Self-Healing Repair Log | `GET /api/v1/runs/{id}/repairs` | `RepairTimeline`, `DiffViewer`, `DiagnosticAlert` |
| `/runs/[id]/export` | Package & Checkout Modal | `POST /api/v1/runs/{id}/checkout`, `GET /api/v1/runs/{id}/export` | `StripeCheckoutCard`, `ChecksumDisplay`, `DownloadButton` |

---

## 1. Page Wireframe: `/dashboard` (Pipeline Dashboard)

```text
+----------------------------------------------------------------------------------------------------+
|  ORBIT v2                                   [ Org: Acme Ventures v ]   (🔔)   [ Maya Lin (Owner) v]|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  Pipeline Dashboard                                                 [ + New Run: Autonomous Build ]|
|  Transform raw startup ideas into running, tested monorepos.                                       |
|                                                                                                    |
|  +------------------------+  +------------------------+  +------------------------+                |
|  | ACTIVE RUNS            |  | COMPLETED EXPORTS      |  | AVG BUILD LATENCY      |                |
|  | 2 in progress          |  | 14 packages ($406)     |  | 2m 44s                 |                |
|  +------------------------+  +------------------------+  +------------------------+                |
|                                                                                                    |
|  Recent Execution Runs                                                                             |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Run Title                  | Status        | Current Node   | Repaired | Created     | Action | |
|  |----------------------------+---------------+----------------+----------+-------------+--------| |
|  | ORBIT v2 Monorepo Factory  | Scope Locked  | ScopeGuard     | 0        | 10m ago     | [Open] | |
|  | DevShield CVE Triage       | Building      | BackendBuilder | 1        | 2h ago      | [Open] | |
|  | PulseMetrics SaaS          | Completed     | DONE           | 2        | 1d ago      | [Export| |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Page Wireframe: `/runs/new` (Idea Intake & Clarification)

```text
+----------------------------------------------------------------------------------------------------+
|  ORBIT v2 > New Execution Run                                                              [ Close ]
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  Stage 1: Founder Idea Intake                                                                      |
|  Enter your raw startup concept. Our IntakeAgent will normalize and evaluate feasibility.          |
|                                                                                                    |
|  Project Name                                                                                      |
|  [ DevShield — Automated CI/CD Vulnerability Remediation Agent                                   ] |
|                                                                                                    |
|  Raw Concept Description                                                                           |
|  +-----------------------------------------------------------------------------------------------+ |
|  | An autonomous AI agent that ingests Dependabot CVE alerts, performs static AST reachability  | |
|  | analysis in Python and Node.js, and creates backwards-compatible upgrade patches.            | |
|  |                                                                                               | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  Clarity Score: [||||||||||||||||||..........] 68% (Sufficient to proceed)                        |
|                                                                                                    |
|  [ Cancel ]                                                      [ Submit to Discovery Agent -> ]  |
+----------------------------------------------------------------------------------------------------+
```

### Clarification Modal (Triggered when Clarity < 40%)
```text
      +------------------------------------------------------------------------+
      |  (⚠️) Clarification Required by IntakeAgent                            |
      |  Your idea needs minor refinement before we lock scope and write code. |
      |------------------------------------------------------------------------|
      |  Q1: What is the primary target architecture for the MVP deliverable?  |
      |  (o) Serverless Cloud: Next.js 15 on Vercel + Python Lambda + DynamoDB |
      |  ( ) Sandboxed Monorepo: Next.js + FastAPI + Postgres 16 (Docker)      |
      |                                                                        |
      |  Q2: What is the target monetization model to validate in the PRD?     |
      |  (o) Pay-per-export model ($29 per generated repository ZIP)           |
      |  ( ) Monthly team subscription ($99/mo flat)                           |
      |------------------------------------------------------------------------|
      |  [ Cancel Run ]                          [ Confirm Answers & Resume -> ]
      +------------------------------------------------------------------------+
```

---

## 3. Page Wireframe: `/runs/[id]` (Live Execution Canvas & Repair Loop)

```text
+----------------------------------------------------------------------------------------------------+
|  ORBIT v2 > Runs > run-orbit-v2-discovery-01                       [ Scope Locked ]  [ $29 Export ]|
+----------------------------------------------------------------------------------------------------+
|  [ Graph Canvas ]  [ PRD & Scope ]  [ Monorepo Files ]  [ Repairs (1) ]  [ Live Telemetry Logs ]   |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   (START) --> [Intake] --> [PRD] --> [ScopeGuard] --> [Architect] --> [DataModeler]                |
|                                                                             |                      |
|                                                                             v                      |
|   [Integration] <-- [Frontend] <-- [Backend] <-- [Scaffold] <-- [Threat] <-- [APIContract]         |
|         |                                                                                          |
|         v                                                                                          |
|   [TestWriter] --> [Infra] --> [BuildRunner] ---> (PASS) ---> [RuntimeProbe] ---> [E2E]            |
|                                     |                              ^                 |             |
|                                  (FAIL)                            |              (FAIL)           |
|                                     |                              |                 |             |
|                                     v                              |                 v             |
|                              +--------------+                      |          +--------------+     |
|                              | RepairAgent  | ---- [Re-verify] ----+          | RepairAgent  |     |
|                              +--------------+                                 +--------------+     |
|                                                                                                    |
|  ------------------------------------------------------------------------------------------------  |
|  CURRENT STATUS: Verifying in Sandbox                                                              |
|  Active Node: BuildRunner | Attempt: 1 | Budget Consumed: 18,400 tokens / 40,000                   |
|                                                                                                    |
|  Live Telemetry Terminal (SSE)                                                                     |
|  +-----------------------------------------------------------------------------------------------+ |
|  | [12:00:14] IntakeAgent: Idea normalized. Clarity score 0.95.                                  | |
|  | [12:00:22] PRDAgent: Generated 7 MoSCoW features; 2 personas (Maya, David).                   | |
|  | [12:00:31] ScopeGuardAgent: Pruned live-collab; locked scope_contract.json.                   | |
|  | [12:01:05] RepoScaffold: Scaffolding Next.js 15 + FastAPI monorepo at /workspace.              | |
|  | [12:01:42] BuildRunner: Executing "pnpm build && pytest -q"...                                | |
|  +-----------------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Page Wireframe: `/runs/[id]/spec` (PRD & Scope Contract Inspector)

```text
+----------------------------------------------------------------------------------------------------+
|  ORBIT v2 > Runs > run-orbit-v2-discovery-01 > Specifications                       [ Lock Status: 🔒]
+----------------------------------------------------------------------------------------------------+
|  [ Overview ]  [ PRD.md (Markdown) ]  [ scope_contract.json (Contract) ]                           |
|----------------------------------------------------------------------------------------------------|
|                                                                                                    |
|  ### IN-SCOPE FEATURES (Strictly Bounded to 7)             ### OUT-OF-SCOPE PRUNING (ScopeGuard)   |
|  [v] 1. Founder Natural Language Intake & Expansion        [x] Real-time multi-user live editing   |
|  [v] 2. Automated PRD & Scope Contract Generator          [x] 24/7 post-deployment cloud APM      |
|  [v] 3. Next.js 15 App Router Frontend Generator          [x] Self-hosted LLM fine-tuning cluster |
|  [v] 4. Serverless Python Lambda & DynamoDB Backend       [x] Multi-region active DR orchestration |
|  [v] 5. Automated Build, Type & Unit Test Gate                                                     |
|  [v] 6. Self-Healing Targeted Repair Loop (3 attempts)    ### STATED ASSUMPTIONS                  |
|  [v] 7. Pay-Per-Export Monorepo Package ($29/export)       - Serverless Vercel + Python Lambda     |
|                                                            - $29 pay-per-export Stripe checkout    |
|                                                            - Offline DynamoDB Local via Compose    |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. Page Wireframe: `/runs/[id]/export` (Stripe Checkout & Download)

```text
+----------------------------------------------------------------------------------------------------+
|  ORBIT v2 > Export Verified Monorepo Deliverable                                           [ X ]   |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|      +------------------------------------------------------------------------------+              |
|      |  PACKAGE READY FOR INSTANT ONE-COMMAND BOOT                                  |              |
|      |  All 22 agent verification gates passed with zero syntax or security errors. |              |
|      +------------------------------------------------------------------------------+              |
|                                                                                                    |
|      Package Contents:                                                                             |
|      - /apps/web            Next.js 15 App Router frontend (Tailwind + Zustand)                    |
|      - /apps/api            FastAPI backend with Pydantic v2 schemas                               |
|      - /packages/db         Postgres 16 schema, migrations, and seed scripts                       |
|      - /infra               Docker Compose, Dockerfiles, and .env.example                          |
|      - /tests               Pytest and Vitest test suites (100% pass)                              |
|                                                                                                    |
|      Cryptographic Verification:                                                                   |
|      SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855             |
|                                                                                                    |
|      Price: $29.00 USD (Pay-Per-Export Single License)                                             |
|                                                                                                    |
|      [ Pay $29 via Stripe Checkout -> ]                     [ Download ZIP (Requires Token) ]      |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```
