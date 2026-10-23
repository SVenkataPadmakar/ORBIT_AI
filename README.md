# AI Startup Copilot

AI Startup Copilot is an execution operating system for founders. It turns an idea into validated analysis, a technical blueprint, phase-based build/launch/growth tasks, measurable acceptance criteria, and persistent AI co-founder guidance.

## Working product

- Email/password registration, login, rotating refresh sessions, logout, and authenticated user identity
- Ownership-scoped project creation, listing, editing, retrieval, and deletion APIs
- Responsive founder dashboard, project intake, project workspace, account settings, and billing status
- Six-stage pipeline with durable per-stage status, retry-safe artifact persistence, and latest-run recovery
- Structured market, product, finance, pitch, and VC outputs rendered as operational views
- OpenAI, Anthropic, and Gemini provider selection through environment configuration
- Deterministic demo generation when no provider key is configured, with no network calls
- Inline development execution or Celery/Redis queued execution
- PostgreSQL models, Alembic migration, repositories, seed data, and integration test support
- Startup Execution Center with technical architecture, phase gates, owners, tools, dependencies, KPIs, and persisted task status
- Floating Gemini AI Co-Founder with project-scoped conversation memory and an offline execution fallback
- Confidence, evidence freshness, missing-information, challenged-assumption, and correction metadata on execution plans
- Role-guarded admin dashboard with user, revenue, agent, system-health, and AI-usage aggregates

## Architecture

```text
apps/frontend   Next.js 15, React 19, React Query, Zustand, Tailwind
apps/backend    FastAPI, SQLAlchemy async, PostgreSQL, Celery, Redis
packages        Shared TypeScript contracts
infra           Nginx and Terraform foundations
```

The frontend uses `NEXT_PUBLIC_API_URL` and defaults to `http://localhost:8000/v1`. The backend exposes API documentation at `http://localhost:8000/docs`.

## Prerequisites

- Docker Desktop with the Linux container engine running
- Node.js 20+ and pnpm 9.7 for local frontend commands
- Python 3.12 and Poetry when running the backend outside containers

Docker Desktop is required for the standard development stack because authentication, projects, and generated artifacts are persisted in PostgreSQL.

## Start the complete stack

1. Copy `.env.example` to `.env` and replace development secrets where appropriate.
2. Start all services:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

3. Apply the schema and seed the six specialist agents:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.db.seed
```

4. Open the services:

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- API documentation: http://localhost:8000/docs
- ChromaDB: http://localhost:8001

Stop the stack with:

```bash
docker compose down
```

Use `docker compose down -v` only when you intentionally want to delete local database and Chroma data.

## AI execution modes

The default `AI_PROVIDER=auto` selects the first configured provider key. Supported keys are:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`

Set `AI_PROVIDER=demo`, or leave all provider keys empty, to run the complete deterministic demo pipeline. Demo mode generates validated, project-specific structured outputs and persists them exactly like provider-backed runs.

The persistent co-founder uses Gemini whenever `GOOGLE_GEMINI_API_KEY` is configured. `GEMINI_CHAT_MODEL` defaults to `gemini-2.0-flash`. Without a Gemini key, the assistant remains available with a deterministic execution-focused response and project memory; it clearly identifies itself as the fallback provider.

Market evidence is labeled by freshness and source. The current implementation does not fabricate live research: project memory is marked `baseline`, and missing current competitor pricing, demand, and acquisition-cost evidence is surfaced by validation. Google Trends, news, startup-database, and market-intelligence connectors require provider-specific API credentials and source adapters before they can be marked `live`.

`PIPELINE_EXECUTION_MODE=auto` runs inline in development and test environments. Use `queued` to require Redis and the Celery worker, or `inline` for explicit synchronous execution.

## Main workflow

1. Register at `/register` or log in at `/login`.
2. Create a project from the dashboard and describe the problem, audience, industry, budget, and goals.
3. Open the Execution Center to work through build, launch, and growth tasks; completion state persists per project.
4. Use Agent Analysis for problem, market, product, finance, pitch, and investor review.
5. Ask the floating AI Co-Founder to challenge strategy, explain agent decisions, or design implementation details.
6. Admin users can open `/admin` for operating metrics and account oversight.

## Quality checks

Frontend:

```bash
pnpm typecheck:frontend
pnpm lint:frontend
pnpm test:frontend
pnpm build:frontend
```

Backend from `apps/backend` with the local virtual environment:

```bash
.venv/Scripts/python.exe -m ruff check app tests/unit
.venv/Scripts/python.exe -m pytest tests/unit -q
```

Database integration tests require the PostgreSQL test database configured by the repository environment.

## Current boundaries

Stripe model and environment foundations exist, but checkout, customer portal, and webhook activation are not enabled. Revenue metrics are therefore estimated from active paid-plan records, not claimed as Stripe cash data. Google OAuth, live-data provider adapters, vector embedding ingestion, document uploads, realtime streaming, exports, and production Terraform resources remain separate production features. The execution workflow, persistent relational project memory, Gemini co-founder, validation metadata, and admin role boundary do not depend on them.
