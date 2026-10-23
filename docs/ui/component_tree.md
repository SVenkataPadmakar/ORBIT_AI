# ORBIT v2 — Next.js 15 App Router Component Tree

**Author**: UIAgent (Division B4)  
**Framework**: Next.js 15 (App Router), React 19, Tailwind CSS, Zustand, TanStack React Query  
**Routing Hierarchy**:

```text
apps/web/
├── app/
│   ├── layout.tsx                     # Global root layout (Providers, Fonts, Theme)
│   ├── globals.css                    # Tailwind CSS v4 / custom design token variables
│   │
│   ├── (auth)/                        # Route Group: Unauthenticated authentication flow
│   │   ├── layout.tsx                 # Centered branding canvas layout
│   │   ├── login/
│   │   │   └── page.tsx               # Login page -> POST /api/v1/auth/login
│   │   └── register/
│   │       └── page.tsx               # Registration page
│   │
│   └── (app)/                         # Route Group: Authenticated dashboard & workspace
│       ├── layout.tsx                 # Shell layout (Navbar, OrgSwitcher, UserMenu)
│       │
│       ├── dashboard/
│       │   └── page.tsx               # Main Dashboard -> GET /api/v1/runs, GET /api/v1/orgs
│       │
│       └── runs/
│           ├── new/
│           │   └── page.tsx           # Idea intake & clarification -> POST /api/v1/runs
│           │
│           └── [run_id]/
│               ├── layout.tsx         # Run workspace shell (RunHeader, SubNav, LiveStatus)
│               ├── page.tsx           # Live 22-node execution graph canvas (SSE)
│               │
│               ├── spec/
│               │   └── page.tsx       # PRD & Scope contract inspector -> GET /api/v1/runs/{id}/spec
│               │
│               ├── artifacts/
│               │   └── page.tsx       # Monorepo code & file explorer -> GET /api/v1/runs/{id}/artifacts
│               │
│               ├── repairs/
│               │   └── page.tsx       # Self-healing repair diff log -> GET /api/v1/runs/{id}/repairs
│               │
│               └── export/
│                   └── page.tsx       # Stripe checkout & ZIP download -> POST checkout / GET export
```

---

## Component Architecture & Hierarchy

### 1. Global Shell (`app/(app)/layout.tsx`)
```text
RootLayout (Server)
├── ThemeProvider (Client)
├── QueryClientProvider (Client)
└── AppShell (Client)
    ├── AppNavbar
    │   ├── OrbitBrandLogo
    │   ├── OrgSwitcherDropdown (Zustand: useOrgStore)
    │   ├── ActiveRunsIndicator (Badge with live pulsing count)
    │   └── UserAvatarMenu (Sign out, Settings)
    └── MainContentContainer
```

### 2. Dashboard View (`app/(app)/dashboard/page.tsx`)
```text
DashboardPage (Server Component with Suspense)
├── DashboardHeader
│   ├── TitleAndDescription
│   └── NewRunButton (Link -> /runs/new)
├── MetricsSummaryCards (Server / Cached)
│   ├── ActiveRunsCard
│   ├── CompletedPackagesCard
│   └── MeanLatencyCard
└── RunsDataTable (Client: React Query `useRunsQuery`)
    ├── TableFilterBar (Search, Status Filter, Date Sort)
    ├── RunRowList
    │   └── RunRowItem
    │       ├── StatusPill (Intake, Scope Locked, Building, Verified, Completed)
    │       ├── CurrentNodeBadge (e.g. "BuildRunner")
    │       ├── RepairCountBadge
    │       └── ActionButtons (Open Workspace, Download ZIP)
    └── TablePagination
```

### 3. Idea Intake View (`app/(app)/runs/new/page.tsx`)
```text
NewRunPage (Client Component)
├── IntakeFormContainer
│   ├── ProjectNameInput (Form state: React Hook Form + Zod)
│   ├── IdeaTextarea (Auto-expanding, markdown enabled)
│   ├── RealTimeClarityBar (Heuristic clarity evaluation)
│   └── SubmitButton
└── ClarificationModal (Conditional overlay when clarity < 40%)
    ├── WarningAlertBanner
    ├── ClarifyingQuestionsList
    │   └── QuestionChoiceRadioGroup (1: Architecture, 2: Monetization, 3: Persona)
    └── ConfirmClarificationButton (Triggers POST /api/v1/runs/{id}/clarify)
```

### 4. Live Execution Graph View (`app/(app)/runs/[run_id]/page.tsx`)
```text
RunWorkspacePage (Client: SSE Event Listener `useRunTelemetry`)
├── RunHeaderBar
│   ├── RunTitleBreadcrumb
│   ├── ScopeLockStatusIndicator (Locked vs. Unlocked)
│   ├── BudgetProgressBar (Used tokens vs. Max token cap)
│   └── ExportActionCTA (Redirects to /export when verified)
├── WorkspaceTabsNav (/overview, /spec, /artifacts, /repairs, /export)
├── MainWorkspaceSplitPane
│   ├── GraphCanvasSection (Left 65%)
│   │   ├── StateGraphRenderer (Interactive SVG / React Flow 22-node visualizer)
│   │   │   ├── NodeGroup: Division A (Intake -> PRD -> ScopeGuard -> Architect...)
│   │   │   ├── NodeGroup: Division B (Scaffold -> Backend -> Frontend -> Integration)
│   │   │   ├── NodeGroup: Division C (TestWriter -> Infra -> BuildRunner -> RuntimeProbe -> E2E -> QualityGate)
│   │   │   ├── LoopbackNode: RepairAgent (Visual animated loopback edge)
│   │   │   └── NodeGroup: Division D (Evidence -> Package -> DONE)
│   │   └── NodeDetailDrawer (Slide-out showing tool calls & tokens for selected node)
│   └── LiveTelemetrySidebar (Right 35%)
│       ├── TerminalHeader (Clear, Auto-scroll toggle, Connection status)
│       ├── TerminalLogStream (Real-time virtualized log messages)
│       └── ActiveStepDetailsCard
```

### 5. Spec & Scope Inspector (`app/(app)/runs/[run_id]/spec/page.tsx`)
```text
SpecInspectorPage (Client Component)
├── SpecHeaderBar
│   ├── DocumentToggleButtons ("PRD Markdown" vs. "Scope Contract JSON")
│   └── DownloadRawSpecButton
├── SpecContentContainer
│   ├── PRDViewer (Rendered Markdown via @tailwindcss/typography)
│   │   ├── ProblemSection
│   │   ├── PersonasCards (Maya, David)
│   │   ├── JTBDCallout
│   │   ├── MoSCoWFeaturesTable (Tags: Must Have, Should Have)
│   │   ├── NonGoalsList
│   │   └── SuccessMetricsGrid
│   └── ScopeContractViewer
│       ├── InScopeList (Green badge checklist)
│       ├── OutOfScopePrunedList (Red badge pruned features)
│       └── StatedAssumptionsList
```

### 6. Monorepo File Browser (`app/(app)/runs/[run_id]/artifacts/page.tsx`)
```text
ArtifactsBrowserPage (Client Component)
├── FileTreeSidebar
│   ├── DirectoryNode: apps/web
│   ├── DirectoryNode: apps/api
│   ├── DirectoryNode: packages/db
│   ├── DirectoryNode: infra
│   └── FileItemNode (Click loads file in editor pane)
├── CodeViewerPane
│   ├── FileHeader (Path, Size, SHA-256 Checksum, Copy Button)
│   └── MonacoEditorReadOnly (Syntax highlighted code viewer)
```

### 7. Self-Healing Repair Log (`app/(app)/runs/[run_id]/repairs/page.tsx`)
```text
RepairLogPage (Client Component)
├── RepairSummaryBanner (Attempts used: 1 of 3 allowed)
├── RepairTimeline
│   └── RepairAttemptCard
│       ├── AttemptHeader (Node: BuildRunner, Timestamp, Status: Resolved)
│       ├── ErrorDiagnosticAlert (Compiler error message & stack trace)
│       ├── DiffViewerContainer (Split-pane git diff showing corrective patch)
│       └── ReTestResultBadge (Pass / Fail)
```

---

## State Management Architecture

| Store Name | Tech | Responsibilities |
|---|---|---|
| `useAuthStore` | Zustand + LocalStorage | JWT access token, user session claims, logout dispatcher. |
| `useOrgStore` | Zustand | Current active organization slug, org switching. |
| `useRunTelemetry` | React Query + SSE EventSource | Subscribes to `/api/v1/runs/{id}/events`, appends telemetry events, updates node positions. |
| `useSpecStore` | React Query | Caches PRD and scope contract data from `/api/v1/runs/{id}/spec`. |
| `useFileTreeStore`| Zustand | Active file selection, expansion state in artifacts browser. |
