# AI Startup Copilot: Product Redesign Blueprint

**Status:** Product and architecture direction  
**Audience:** Founders, product, design, engineering, data, AI, operations  
**North-star promise:** Move a founder from an idea to trustworthy evidence, a committed decision, and a launched market test faster than a strong human startup team.

---

## Executive verdict

The current product is a competent AI planning prototype wrapped in the language of an operating system. It is not yet an AI co-founder.

Its dominant loop is still:

`idea form -> fixed pipeline -> generated artifacts -> browse tabs -> manually check generic tasks`

Renaming a dashboard "command center," a checklist "execution center," and a chat drawer "AI co-founder" does not change the product's behavior. The application creates analysis faster than a founder could write it, but it does not reliably create evidence, force decisions, perform work, learn from outcomes, or improve the odds of launch.

The redesign must invert the product:

`idea -> interrogation -> evidence missions -> agent deliberation -> founder decision -> tool-assisted execution -> measured outcome -> updated belief -> launch`

Documents become optional exports of the operating history. They stop being the primary product.

---

# 1. Brutal product critique

## 1.1 What the product says versus what it does

| Claim | Current reality | Consequence |
|---|---|---|
| AI co-founder | A floating request-response chat with recent messages, project fields, and one execution-plan snapshot | Gemini cannot reliably know why decisions changed, what evidence supports them, or what is blocked |
| Execution operating system | A deterministic nine-task template with mutable status values | Checking a task does not schedule an interview, deploy software, send outreach, collect evidence, or verify completion |
| Agent collaboration | Six LLM calls in a fixed serial chain | Agents do not debate, branch, challenge one another, request evidence, or reconcile disagreement |
| Validated plan | Hard-coded scores and baseline labels | The confidence number looks authoritative without being calibrated to evidence |
| Market intelligence | Unsourced estimates and explicit disclaimers | The highest-risk startup claims remain unverified |
| Admin operating system | Aggregate metric cards plus a user table | Admins cannot operate prompts, cost, quality, incidents, queues, plans, or users |
| Live agent activity | Derived counts and static copy | It communicates theater, not system state |

## 1.2 Boring workflows

1. **Homepage to account:** A conventional hero, feature grid, pricing block, FAQ, and repeated registration CTAs. The founder learns what the product claims but does not experience its intelligence.
2. **Login:** A standard email/password card beside marketing copy. It feels like authentication because that is all it is.
3. **Idea intake:** A long project form asks the founder to provide structured certainty before the system has helped sharpen the idea.
4. **Pipeline:** The founder clicks "Build blueprint" and waits. The system does not ask high-value follow-up questions or expose meaningful decisions during the run.
5. **Analysis consumption:** Six tabs render articles, lists, scorecards, forecast tables, and pitch slides. This is a report reader.
6. **Execution:** Every startup receives nearly the same build, launch, and growth tasks. The only interaction is cycling a status.
7. **Gemini:** The founder opens a separate chat surface, asks for help, reads advice, and must manually translate it back into product state.
8. **Admin:** Operators inspect totals but cannot resolve the underlying issues represented by those totals.

## 1.3 Where excitement dies

- The homepage promises an intelligent team, then registration leads to a static form.
- The intake flow asks for project name, industry, budget, audience, and goals without demonstrating understanding.
- The highest-emotion moment, agents working on the founder's idea, is represented by spinners, status pills, and stage counts.
- Completion rewards the founder with more reading instead of a consequential choice.
- A generated TAM or readiness score initially feels impressive, then loses trust because no source can be inspected.
- The dashboard greets the founder with portfolio metrics even when there is one idea and no real-world progress.
- The co-founder proposes actions but cannot create, assign, schedule, or monitor them.
- Task completion has no proof requirement and creates no learning loop.

## 1.4 Unnecessary screens and concepts

**Remove or demote:**

- The generic founder portfolio dashboard as the default destination.
- "Blueprint" as the product's central noun.
- Generated artifact tabs as primary project navigation.
- Standalone pitch and PRD generation as top-level value propositions.
- Average confidence across projects. It is mathematically neat and operationally meaningless.
- Fake-live agent activity derived from pipeline status.
- A global chat bubble as Gemini's primary presence.
- Pricing based on agent-run quota. Customers pay for progress and leverage, not invisible LLM invocations.

**Retain but reposition:**

- Structured schemas as internal contracts.
- Durable agent runs, retries, model/cost metadata, and role guards.
- Demo mode, clearly labeled as simulated.
- Financial, pitch, and report generation as views or exports synthesized from validated product state.
- Project-scoped memory as a foundation, expanded into durable startup memory.

## 1.5 Static interactions that must become operational

| Current interaction | Replacement |
|---|---|
| Create a project form | Conversational idea interrogation that extracts claims, flags ambiguity, and creates the first mission |
| Run all six agents | Dynamic orchestration based on the current decision and missing evidence |
| Read interview questions | Recruit participants, schedule calls, record/transcribe, extract claims, and update assumptions |
| Read competitor list | Inspect sourced competitor records, tracked changes, pricing captures, and strategic responses |
| Read MVP features | Accept/reject tradeoffs, generate specs/issues, and sync them to Linear/GitHub |
| Check a task | Submit evidence or receive a verified integration event before completion |
| Read launch checklist | Run preflight checks against domain, analytics, billing, monitoring, legal, and rollback configuration |
| Read growth advice | Create an experiment, connect analytics, monitor a cohort, and record a decision |
| Chat with Gemini | Let Gemini operate in context, propose state changes, and execute approved tools |

## 1.6 Features that create documents but not action

- Problem discovery generates questions but does not conduct or organize discovery.
- Market research creates estimates but does not collect cited current evidence.
- Product strategy creates personas and features but does not create a prototype, backlog, or validation test.
- Finance creates projections but does not connect billing, bank, or acquisition data.
- Pitch generation creates slides before the underlying claims are proven.
- VC evaluation produces a readiness score without investor interaction or calibrated benchmark data.
- Execution planning outputs plausible tasks but does not adapt to startup type, founder skills, geography, stage, or observed outcomes.

## 1.7 Visual and interaction critique

The current visual system overuses dark purple gradients, glass surfaces, glow fields, rounded cards, decorative orbs, and generic hover lifts. This signals "AI SaaS" rather than a distinct, trustworthy operating environment. Motion decorates objects but rarely explains causality. Dense work is fragmented into nested containers while foundational state remains hidden.

The redesign should feel precise, calm, and alive:

- Neutral operational surfaces with role colors used only for meaning.
- Strong typography and hierarchy, not glow, as the primary design material.
- Fewer containers; use full-width work surfaces and clear panes.
- Motion tied to state transitions, evidence flow, agent handoff, decision impact, and execution outcomes.
- 3D only where spatial relationships explain the startup system.

---

# 2. Product redesign strategy

## 2.1 Product thesis

Founders do not need more startup content. They need reduced uncertainty and increased execution velocity.

The product should sell five outcomes:

1. **Discover:** Find painful, reachable, timely opportunities.
2. **Validate:** Replace assumptions with current evidence.
3. **Decide:** Make explicit choices with rationale and confidence.
4. **Execute:** Perform or coordinate the next real-world action.
5. **Learn:** Measure outcomes and update the startup strategy.

## 2.2 The unit of value

The unit of value is a **closed learning loop**, not a report or agent run:

`assumption -> test -> action -> evidence -> decision -> outcome`

A successful user session should end with at least one of these:

- a decision made,
- a mission launched,
- evidence captured,
- work shipped,
- a blocker resolved,
- or a next action committed to time and owner.

## 2.3 Product principles

1. **Action before artifact.** Every generated insight must change a decision, mission, or plan.
2. **Evidence before confidence.** Confidence is computed from source quality, recency, diversity, agreement, and test outcomes.
3. **One decisive next move.** The system may show alternatives, but it recommends one next action with rationale.
4. **Approval before consequence.** External writes, spending, publishing, and destructive actions require explicit approval.
5. **Proactive, not noisy.** Gemini intervenes only when urgency, expected impact, or contradiction crosses a threshold.
6. **Disagreement is visible.** Agent dissent and unresolved uncertainty are product features, not hidden chain-of-thought.
7. **Progress requires proof.** Tasks close through evidence or integration events, not unchecked self-report alone.
8. **Simulation is labeled.** Demo data, estimates, and real evidence are visually and structurally distinct.
9. **The operating model adapts.** A marketplace, regulated medical product, local service, and B2B SaaS startup must receive different missions.
10. **Exports are projections of state.** PRDs, decks, plans, and memos are generated on demand from the current evidence and decision graph.

## 2.4 Product moat

The moat is not model access or prompt volume. It is the accumulated **startup decision graph**:

- founder goals and constraints,
- claims and assumptions,
- evidence with provenance,
- decisions and reversals,
- experiments and observed outcomes,
- product/revenue telemetry,
- agent recommendations and calibration,
- and integrations that can act.

This memory lets the product become more useful over time, explain itself, detect contradictions, and benchmark what actions lead to progress.

## 2.5 Business model

Do not meter the product primarily by agent runs.

- **Explore:** One active startup, limited live-source refresh, manual missions, simulated tools.
- **Build:** Multiple active missions, connected data sources, execution integrations, weekly operating review, richer memory.
- **Launch:** Team collaboration, automated monitoring, launch preflight, growth experiments, higher execution limits.
- **Studio:** Portfolio view, templates, permissions, shared experts, cross-startup benchmarking.

Charge on active startup capacity, automation, connected data, and team collaboration. Show AI usage only as a transparent fair-use boundary.

## 2.6 Success metrics

**North star:** weekly verified startup outcomes per active startup.

**Activation:**

- Time from first idea to first committed mission.
- Percent of founders who add or collect one real evidence source in 24 hours.
- Percent who make one explicit decision in the first session.

**Engagement:**

- Weekly closed learning loops.
- Missions completed with accepted evidence.
- Gemini recommendations accepted, modified, ignored, and later successful.
- Startup state freshness.

**Outcome:**

- Time to first customer interview, prototype, deployed test, lead, and payment.
- Percent of startups reaching each stage gate.
- Decision reversal rate after new evidence.
- Retained cohorts by achieved outcome, not message volume.

**Trust:**

- Citation coverage and source freshness.
- Unsupported-claim rate.
- Agent calibration by confidence band.
- Tool-action failure and rollback rates.

---

# 3. New information architecture

## 3.1 Customer product

```text
Today
  Next best action
  Active missions
  Decisions waiting
  New evidence and changed signals
  Commitments due

Startup
  Narrative and current strategy
  Assumption map
  Stage gates
  System map

Missions
  Validation missions
  Build missions
  Launch missions
  Growth experiments

Evidence
  Interviews
  Market signals
  Competitors
  Sources
  Product and revenue telemetry

Decisions
  Decision inbox
  Decision journal
  Tradeoffs and dissent
  Reversal history

Product
  Customer problem
  Prototype and specification
  Backlog integrations
  Releases and product analytics

Launch
  Audience and channels
  Campaigns and assets
  Launch preflight
  Leads and conversion

Growth
  Funnel and cohorts
  Experiments
  Revenue and retention
  Growth loops

Team
  Gemini co-founder
  Specialist agents
  Human collaborators
  Approvals and activity

Settings
  Founder profile and constraints
  Integrations
  Memory and privacy
  Billing
```

The IA should be progressive. Before a founder has a validated problem, Product, Launch, and Growth appear as stage-gated destinations with clear unlock criteria, not as empty dashboards.

## 3.2 Admin control plane

Admin uses a separate route group, shell, permissions, and visual density:

```text
Operations
  Live incidents
  Queue and provider health
  Failing workflows
  Approval and tool-action failures

Customers
  Users and organizations
  Startup health and activation cohorts
  Support context
  Plans, limits, and entitlements

Revenue
  Stripe truth
  MRR, churn, expansion, failed payments
  AI gross margin by plan and account

AI quality
  Agent evaluations
  Unsupported claims
  Confidence calibration
  User feedback and regressions
  Model comparison

Prompts and policies
  Versioned prompts
  Experiment allocation
  Tool permissions
  Safety and escalation policies
  Staged rollout and rollback

Costs
  Token, search, vector, transcription, and tool spend
  Cost per closed loop and verified outcome
  Budgets and anomaly alerts

Data sources
  Connector freshness
  Quotas and failures
  Source reliability
  Terms and attribution compliance

Audit
  Admin actions
  Agent decisions
  External tool actions
  Security events
```

## 3.3 Core product objects

- **Startup:** durable company context, stage, goals, constraints, members, and current strategy.
- **Claim:** a falsifiable statement about problem, market, product, channel, or economics.
- **Assumption:** an unverified claim with importance, uncertainty, owner, and expiry.
- **Evidence:** a sourced observation that supports, contradicts, or contextualizes claims.
- **Decision:** a committed choice with options, rationale, dissent, evidence, owner, review date, and reversibility.
- **Mission:** a bounded outcome with steps, tools, evidence requirements, budget, owner, and deadline.
- **Experiment:** a mission with hypothesis, cohort, metric, threshold, and result.
- **Outcome:** observed result from a mission, product event, revenue event, or human review.
- **Agent deliberation:** proposals, critiques, verification findings, confidence, and final synthesis.
- **Tool action:** proposed or executed external operation with permission, idempotency, result, and audit data.
- **Signal:** a monitored external or internal change that may alter a claim or decision.

---

# 4. User journeys

## 4.1 New founder: idea to first mission

1. The homepage accepts an idea immediately, without requiring an account.
2. The AI co-founder parses the idea into customer, pain, proposed solution, advantage, constraints, and unknowns.
3. It asks one high-information question at a time and visibly updates the startup model.
4. A lightweight simulation shows three plausible futures: validate, pivot, or stop, with assumptions clearly labeled.
5. The founder creates an account to preserve the session.
6. The system proposes the single riskiest assumption and three possible tests.
7. Agents deliberate; the founder sees the recommendation, evidence gaps, dissent, cost, and expected learning.
8. The founder approves a seven-day validation mission.
9. The system creates outreach, participant criteria, interview guide, calendar slots, and evidence capture.
10. The first screen after onboarding is the active mission, not a dashboard.

**Activation event:** first mission approved with owner and due date.

## 4.2 Returning founder: daily operating loop

1. Today opens with one next best action and why it matters now.
2. Changed signals appear only if they affect an assumption, decision, or mission.
3. Gemini presents overdue commitments, blocked work, and decisions waiting for approval.
4. The founder performs an action in context or approves Gemini to execute it.
5. New evidence updates the relevant claim and confidence.
6. If a threshold is crossed, the system requests a decision or proposes a plan adjustment.
7. The session closes with a committed next action, owner, and time.

## 4.3 Validation journey

1. Select or accept the riskiest assumption.
2. Choose evidence standard: interviews, behavior, payment, market signal, technical feasibility, or regulatory review.
3. AI creates a mission and sources/recruits targets through approved connectors.
4. Calls and responses are captured, transcribed, and coded into claims.
5. Verification separates quotes, observations, inference, and model synthesis.
6. Agents debate whether evidence passes the threshold.
7. Founder decides: persevere, modify, pivot, pause, or kill.
8. The decision updates all dependent missions and generated views.

## 4.4 Build journey

1. A validated decision produces the smallest product test, not an automatic full PRD.
2. Product and technical agents debate scope, risk, architecture, and buy-versus-build.
3. Founder accepts a release objective and explicit exclusions.
4. Execution Agent creates Linear/GitHub issues and a delivery sequence after approval.
5. GitHub, deployment, error, and analytics events update mission state automatically.
6. Gemini reports blockers, scope drift, and missing instrumentation.
7. The release gate requires working product, target-user access, telemetry, and rollback readiness.

## 4.5 Launch journey

1. Growth Agent identifies the narrowest reachable cohort and channel based on evidence.
2. The system drafts channel-specific assets from verified claims only.
3. Founder approves spend, audience, messaging, and publishing actions.
4. Preflight tests domain, billing, analytics, deliverability, support, legal, and monitoring.
5. Launch runs as a live mission timeline with real events.
6. Gemini recommends interventions only when metrics cross agreed thresholds.
7. Launch review converts outcomes into evidence and the next decision.

## 4.6 Admin incident journey

1. Operations detects a rise in unsupported market claims for a prompt/model version.
2. Admin drills from metric to traces, sources, affected users, and cost.
3. Admin compares the current version against a known evaluation suite.
4. A corrected prompt or model route is tested in shadow mode.
5. Admin stages rollout to a small cohort with automatic rollback thresholds.
6. Every change is audited; affected artifacts are marked stale and queued for regeneration where appropriate.

---

# 5. Screen-by-screen redesign

## 5.1 Homepage: live startup universe

**Purpose:** Demonstrate the core loop before asking for registration.

**First viewport:**

- Product name is prominent.
- A single idea input accepts text or voice: "What are you trying to build or change?"
- The background is a full-bleed Three.js startup system, initially quiet and legible.
- Submitting an idea transforms the scene: claims appear as nodes, uncertainty as incomplete structures, evidence gaps as open paths, and a co-founder presence focuses attention.
- The AI asks the first clarifying question in the same surface.

**Scroll narrative, only after interaction:**

1. **Interrogate:** The raw idea separates into assumptions. Motion shows decomposition, not decoration.
2. **Investigate:** Live sample evidence arrives with source labels and timestamps.
3. **Deliberate:** Agents take visible positions around one decision; disagreement changes the graph.
4. **Execute:** An approved mission propagates into calendar, outreach, product, or analytics tools.
5. **Learn:** Results flow back and update the startup trajectory.

Use a prerecorded but honestly labeled simulation when no live connectors are available. No generic feature grid, logo cloud, vanity counters, or FAQ wall in the primary story. Pricing and legal links can remain concise below the experience.

## 5.2 Login: access portal

**Purpose:** Restore context and communicate secure entry, without obstructing authentication.

- Medium-weight Three.js environment reuses a simplified startup system silhouette.
- Returning users see their startup name and last safe summary only after email identification or passkey selection; never reveal sensitive state before authentication.
- Passkeys and Google are primary; email/password is fallback.
- On successful authentication, the environment resolves from encrypted/blurred state into the current startup map while data hydrates.
- The transition lands directly on the current mission or pending decision.
- Errors cause a localized, calm portal interruption with actionable recovery. No shaking forms or theatrical failure.
- Reduced motion and low-power devices receive a static, high-quality bitmap fallback.

## 5.3 Onboarding: co-founder working session

**Purpose:** Convert an idea into a startup model and first commitment.

- No multi-section project form.
- Split workspace: focused dialogue on the left, continuously updated idea model on the right.
- The system asks adaptive questions selected by expected information gain.
- Founder can correct any extracted field in place.
- Unknowns are first-class and never auto-filled to make the model look complete.
- The session ends with a proposed mission and alternative options, not a generated report.

## 5.4 Today: founder command surface

**Purpose:** Answer "What needs my attention now?"

Layout:

- **Primary action rail:** one recommended action, expected impact, effort, deadline, and why now.
- **Mission timeline:** active work, owners, blockers, recent outcomes.
- **Decision inbox:** choices that require founder judgment or approval.
- **Signal changes:** only evidence that changes the startup model.
- **Gemini briefing:** a concise, interruptible daily brief grounded in citations.

Do not show portfolio totals, generic greetings, average confidence, or empty metric cards. Founders with multiple startups choose a startup from a switcher; studio users may have a separate portfolio product.

## 5.5 Startup system map

**Purpose:** Make the startup's logic inspectable.

- A 2D default graph for productivity; optional 3D exploration for relationships and scenario simulation.
- Nodes: customer, problem, solution, channel, revenue, capability, risk, assumption, evidence, decision.
- Edges explain dependencies and contradictions.
- Filters isolate weak assumptions, stale evidence, blocked missions, and decision impact.
- Selecting a node opens its history and actions without navigating away.
- Scenario mode previews consequences but never mutates committed state until approved.

## 5.6 Mission control

**Purpose:** Run one bounded startup outcome end to end.

- Mission header: outcome, owner, time box, budget, confidence, and stop condition.
- Operational timeline: planned action, approvals, tool calls, human work, evidence arrivals, and outcomes.
- Work pane: next step and the actual control needed to perform it.
- Evidence gate: required proof and current status.
- Agent room: recommendation, dissent, verification, and unresolved questions.
- Blocked state: cause, responsible party, impact, and recovery choices.
- Completion requires accepted evidence or a verified integration event.

## 5.7 Evidence room

**Purpose:** Establish trust and make learning reusable.

- Inbox for interviews, URLs, files, news, trend data, product events, and revenue events.
- Every item has origin, author/provider, retrieval time, excerpt, method, freshness, and rights.
- AI extracts atomic claims, but the source remains one click away.
- Evidence can support, contradict, or contextualize an assumption.
- Duplicate and correlated sources are detected to avoid false confidence.
- Founder corrections become durable feedback.
- Staleness policies trigger refresh missions, not silent score decay.

## 5.8 Decision room

**Purpose:** Turn analysis into commitment.

- Decision statement and deadline.
- Options with expected upside, downside, cost, reversibility, and second-order effects.
- Evidence for and against each option.
- Agent positions and confidence, including dissent.
- Gemini recommendation with the minimum sufficient rationale.
- Controls: decide, run another test, delegate, defer with review date, or reject framing.
- Committing records owner, rationale, expected outcome, review date, and affected missions.
- The journal later compares expected versus actual outcomes.

## 5.9 Agent collaboration hub

**Purpose:** Inspect and direct the AI team without exposing private chain-of-thought.

- Show role, task, inputs, tool calls, concise findings, citations, confidence, and critique.
- Visualize handoffs and unresolved conflicts as an event graph.
- Founder can request deeper verification, alter constraints, or invite a human reviewer.
- Do not render token-by-token hidden reasoning or anthropomorphic idle animation.
- Agent personas are operational roles, not decorative avatars.

## 5.10 Product workshop

**Purpose:** Move from validated problem to testable release.

- Release objective and target behavior at the top.
- Scope table with must-test, defer, and excluded.
- Prototype/spec pane linked to assumptions and evidence.
- Architecture and risk decisions appear only where they affect delivery.
- Sync status with Linear/GitHub/Figma, including conflicts and last update.
- Acceptance criteria map to analytics events and release checks.
- PRD export is available, but the maintained state is the release model.

## 5.11 Launch room

**Purpose:** Prepare, execute, and learn from launch.

- Cohort, promise, offer, channel, target, budget, and stop conditions.
- Connected asset workflow with claim verification.
- Automated preflight matrix with pass, warning, fail, and owner.
- Live timeline of sends, visits, activations, revenue, support, and incidents.
- Intervention controls are tied to thresholds defined before launch.
- Post-launch review makes a decision; it does not merely produce a summary.

## 5.12 Growth lab

**Purpose:** Run a disciplined experiment portfolio.

- Funnel and cohort views come from connected telemetry.
- Experiment backlog ranked by expected impact, evidence, effort, and strategic fit.
- Each experiment has hypothesis, segment, metric, threshold, duration, guardrail, and owner.
- Gemini detects invalid tests, peeking, instrumentation gaps, and conflicting experiments.
- Results update claims and future prioritization.

## 5.13 Gemini co-founder

**Purpose:** Be an embedded operating partner, not a chatbot destination.

Gemini appears in three forms:

1. **Context bar:** concise recommendation and explanation in the current work surface.
2. **Working session:** a resizable side pane for complex dialogue and artifact co-editing.
3. **Proactive brief:** interrupt only for deadlines, contradictions, threshold crossings, material external changes, or high-impact opportunities.

Every recommendation offers relevant actions such as `Accept`, `Modify`, `Ask agents`, `Gather evidence`, `Create mission`, or `Dismiss with reason`. Accepted actions update product state. External actions show a preview and require the applicable approval policy.

## 5.14 Admin screens

- **Operations:** live queue, providers, connectors, workflow failures, tool failures, latency, incidents, and drill-down traces.
- **Customers:** searchable users/organizations, activation stage, product outcomes, support context, entitlements, suspension, and impersonation with reason/audit.
- **Revenue:** Stripe-backed MRR, churn, expansion, invoices, failed payments, plan margins, and account-level usage.
- **AI quality:** evaluations by task/model/prompt/source, citation coverage, confidence calibration, user feedback, regression clusters, and replay.
- **Prompt studio:** versioned templates, schemas, policies, test cases, diffs, shadow tests, staged release, and rollback.
- **Cost control:** spend by provider/model/feature/account/outcome, cache rates, budgets, anomalies, and model-routing recommendations.
- **Data sources:** credential health, freshness SLA, quota, reliability, attribution, and compliance.
- **Audit:** immutable actor/action/resource/result timeline with export and retention controls.

---

# 6. Motion design system

## 6.1 Semantic motion vocabulary

| Meaning | Motion behavior |
|---|---|
| Work starts | Origin control transfers energy into the first active step |
| Agent handoff | A directional pulse moves along the actual dependency edge |
| Evidence arrives | Source anchors first; extracted claims resolve outward from it |
| Confidence changes | Scale remains fixed; an uncertainty band contracts or expands |
| Decision committed | Alternatives recede and dependent paths reorder visibly |
| Action executed | Preview transitions into pending, then resolves from verified result |
| Blocker | Motion stops at the blocked dependency; recovery paths remain active |
| Contradiction | Conflicting nodes pull apart and the connecting edge changes state |
| Completion | State settles locally and unlocks the next dependent control |

## 6.2 Timing and easing

- Micro feedback: 80-140 ms.
- Local state transitions: 160-240 ms.
- Pane/layout transitions: 240-360 ms.
- Narrative/3D camera moves: 600-1200 ms, always interruptible.
- Use spring motion for direct manipulation; ease-out for system response; linear motion only for measurable continuous progress.
- Never delay input availability for animation.

## 6.3 Rules

- No random floating, idle orbiting, repeated shimmer, generic fade-up sections, or hover lifts on every card.
- Progress animation must be driven by real events, not an estimated loop presented as truth.
- Preserve object continuity when moving between views.
- Use sound only as opt-in accessibility-aware feedback for consequential completion or attention.
- Honor `prefers-reduced-motion`; preserve all state meaning with color, labels, and structure.
- Pause canvas and ambient animation when hidden, offscreen, on battery constraints, or after inactivity.

---

# 7. Three.js architecture

## 7.1 Strategic scope

**High 3D:** homepage experience, interactive startup universe, scenario visualization, agent ecosystem demonstration.  
**Medium 3D:** login portal and onboarding startup-model assembly.  
**Minimal/none:** Today, evidence, decisions, product, launch, growth, and admin by default.

## 7.2 Frontend architecture

```text
ExperienceShell
  CapabilityGate
  SceneCanvas (dynamically imported, client only)
    SceneStateAdapter
    CameraDirector
    StartupGraph
    CofounderCore
    EvidenceFlow
    AgentConstellation
    InteractionController
    PerformanceController
  DOMOverlay
  StaticFallback
```

Recommended stack:

- `three`
- `@react-three/fiber`
- `@react-three/drei` selectively
- Framer Motion for DOM; a shared semantic event bus coordinates DOM and canvas
- GLTF/GLB assets compressed with Draco or Meshopt and KTX2 textures
- Web Worker for graph layout and heavy preprocessing

Do not synchronize scene state through ad hoc refs. A typed scene-state adapter consumes product events such as `claim.created`, `evidence.attached`, `decision.committed`, and `mission.completed`.

## 7.3 Performance budgets

- Initial homepage JavaScript excluding deferred 3D: under 180 KB gzip target.
- 3D chunk loads after first content/input readiness or explicit interaction.
- Initial compressed scene assets: under 2.5 MB desktop and 1 MB mobile.
- Cap device pixel ratio at 1.5 desktop and 1.25 constrained mobile.
- 55+ FPS target on representative desktop; 30+ FPS on supported mobile.
- Adaptive quality reduces particles, shadows, postprocessing, and geometry before frame rate degrades.
- No continuous render loop for static states; invalidate on demand where possible.
- Dispose geometry, materials, textures, controls, observers, and event listeners on unmount.

## 7.4 Accessibility and fallback

- Every 3D relationship has a synchronized DOM representation.
- Keyboard and screen-reader users can navigate the same nodes and actions.
- WebGL failure, reduced motion, save-data, and low capability use a generated bitmap or 2D canvas fallback.
- Text is rendered in DOM, not embedded into 3D.
- 3D never gates authentication or core product work.

## 7.5 Verification requirements

Automated tests should use Playwright screenshots and canvas-pixel variance checks across desktop and mobile to confirm scenes are nonblank and correctly framed. Interaction tests cover pointer, keyboard, resize, tab visibility, reduced motion, low-performance fallback, context loss, and route disposal. This can be part of implementation CI without manually launching a browser during this specification task.

---

# 8. Gemini integration architecture

## 8.1 Responsibilities

Gemini is the primary strategic interface and synthesis layer. It should:

- understand startup state and history,
- retrieve relevant evidence and decisions,
- explain recommendations with citations,
- identify contradictions and stale assumptions,
- initiate agent deliberations,
- propose missions and decisions,
- call approved tools,
- monitor outcomes,
- and learn from founder corrections.

It should not silently invent market facts, mutate committed decisions, spend money, publish, contact people, or merge code.

## 8.2 Memory model

Use typed memory instead of a chat transcript dump:

- **Profile memory:** founder skills, geography, runway, time, risk tolerance, goals, communication preferences.
- **Startup memory:** claims, strategy, stage, constraints, team, product, channel, economics.
- **Episodic memory:** conversations, deliberations, missions, tool actions, outcomes.
- **Decision memory:** committed choices, rationale, dissent, expected outcome, review date, reversals.
- **Evidence memory:** normalized source chunks, provenance, freshness, rights, relationships to claims.
- **Procedural memory:** approved integrations, policies, recurring workflows, and preferred formats.

Summaries are derived caches, not source-of-truth records. Retrieval is tenant-scoped and combines relational filters, full-text search, embeddings, recency, authority, and graph relationships.

## 8.3 Context assembly

For each interaction:

1. Authorize user, startup, role, and requested tool scope.
2. Classify intent and consequence level.
3. Load current page/work object.
4. Retrieve relevant claims, evidence, decisions, missions, outcomes, and recent dialogue.
5. Include unresolved contradictions and stale-source warnings.
6. Fit context through typed summaries with source IDs.
7. Generate a structured response with recommendation, assumptions, citations, confidence, and proposed state/tool actions.
8. Verify citations and schema before rendering.
9. Apply internal state changes transactionally or request approval for consequential tools.
10. Record trace, prompt/model version, context IDs, cost, latency, response, feedback, and result.

## 8.4 Response contract

```json
{
  "message": "string",
  "recommendation": "string or null",
  "known_facts": ["claim-id"],
  "assumptions": ["assumption-id"],
  "citations": ["evidence-id"],
  "confidence": {
    "score": 0,
    "basis": "string",
    "missing": ["string"]
  },
  "proposed_actions": [
    {
      "type": "create_mission",
      "risk": "internal_write",
      "preview": {},
      "requires_approval": false
    }
  ]
}
```

Confidence is computed from evidence and verifier signals, not a fixed model-authored number.

## 8.5 Tool and approval model

Risk classes:

- **Read:** retrieve sources, analytics, code, calendar availability.
- **Internal write:** create a draft mission, decision option, issue proposal, or note.
- **External reversible:** create a calendar hold, draft CRM record, create a private issue.
- **External consequential:** send outreach, publish, deploy, spend, charge, merge, or delete.

Policies consider role, startup, connector, action type, amount, destination, environment, and prior approval. Consequential actions use preview, explicit approval, idempotency keys, result verification, retry limits, rollback where possible, and immutable audit logs.

## 8.6 Proactive assistance

A signal engine evaluates events against policies:

- mission deadline risk,
- blocked dependency,
- evidence expiry,
- external market change,
- metric threshold crossing,
- decision review date,
- plan contradiction,
- unexpected cost,
- or launch incident.

Interventions are ranked by impact, urgency, confidence, interruptibility, and recent notification load. Low-priority items wait for the daily brief. Every proactive item must say what changed, why it matters, and what action is recommended.

## 8.7 Safety and trust

- Treat retrieved web content as untrusted data, not instructions.
- Scan for prompt injection and isolate tool instructions from source text.
- Enforce tenant and project authorization before retrieval.
- Redact secrets and unnecessary PII from model context.
- Store source and model lineage for every material recommendation.
- Provide founder-visible memory controls, deletion, correction, and export.
- Apply retention policies by data class and connector agreement.

---

# 9. Admin architecture

## 9.1 Separation

Use a separate frontend route group and shell backed by admin-specific APIs. Enforce permissions in backend dependencies and service methods; hidden navigation is not authorization. Support scoped roles such as super admin, support, finance, AI operator, and analyst.

## 9.2 Operational services

- **Telemetry pipeline:** OpenTelemetry traces plus product, agent, connector, and tool events.
- **Evaluation service:** golden datasets, user-feedback cases, adversarial tests, source-grounding checks, and regression runs.
- **Prompt registry:** immutable versions, schema references, policy bundles, rollout state, and rollback pointer.
- **Model router:** task-specific model policy using quality, latency, cost, region, and availability.
- **Cost ledger:** actual provider charges and allocated infrastructure cost by feature, account, workflow, and outcome.
- **Incident service:** alert grouping, ownership, status, affected tenants, mitigations, and postmortems.
- **Entitlements service:** plans, limits, feature flags, trials, exceptions, and enforcement.

## 9.3 Required metrics

- Customer activation and stage conversion.
- Verified outcomes and closed loops.
- Retention segmented by achieved outcome.
- Agent task success, citation coverage, verifier rejection, and confidence calibration.
- Latency and failure by stage/provider/model/prompt/connector.
- Cost per mission, decision, closed loop, and verified outcome.
- Tool approval, execution, failure, duplicate prevention, and rollback.
- MRR, churn, expansion, gross margin, failed payments, and plan profitability from Stripe data.

## 9.4 Prompt operations

A prompt change is a production change:

1. Create an immutable version.
2. Run schema, safety, grounding, and task-quality evaluations.
3. Compare quality, latency, and cost against baseline.
4. Shadow on production-like traffic without user impact.
5. Roll out by cohort percentage.
6. Monitor automatic thresholds.
7. Promote or rollback.
8. Retain full audit lineage.

---

# 10. Customer architecture

## 10.1 Product services

```text
API Gateway / FastAPI
  Identity and tenancy
  Startup state service
  Claim and evidence service
  Decision service
  Mission and experiment service
  Agent orchestration service
  Gemini co-founder service
  Tool gateway and approval service
  Connector service
  Notification and brief service
  Billing and entitlements
  Event and audit service
```

Start as a modular monolith with strong module boundaries and an event outbox. Extract high-scale connector ingestion, agent workers, and evaluation workloads only when operational demand justifies it.

## 10.2 Data model additions

Recommended relational entities:

- `organizations`, `organization_members`
- `startups`, `startup_members`, `founder_profiles`
- `claims`, `assumptions`, `claim_relations`
- `evidence_sources`, `evidence_items`, `evidence_claim_links`
- `decisions`, `decision_options`, `decision_evidence`, `decision_reviews`
- `missions`, `mission_steps`, `mission_dependencies`, `mission_evidence_requirements`
- `experiments`, `experiment_results`
- `outcomes`, `signals`, `signal_subscriptions`
- `agent_deliberations`, `agent_contributions`, `verification_findings`
- `tool_connections`, `tool_action_proposals`, `tool_action_runs`, `approvals`
- `memory_items`, `memory_links`, `memory_summaries`
- `prompt_versions`, `model_routes`, `ai_traces`, `evaluation_cases`, `evaluation_results`
- `product_events`, `notification_events`, `audit_events`

JSONB is suitable for provider payloads and flexible metadata, but claims, decisions, missions, status, permissions, and lineage need relational structure and constraints.

## 10.3 Realtime and jobs

- Use SSE first for mission, agent, connector, and tool-action events; it fits server-to-client progress and is simpler than bidirectional sockets.
- Use WebSockets only for collaborative editing or live audio where bidirectionality is necessary.
- Move durable orchestration toward a workflow engine such as Temporal when human approvals, timers, compensation, and long-running retries become central. Celery can remain for stateless background work during transition.
- Implement transactional outbox publishing to prevent database/event divergence.
- Every job and external tool action must be idempotent.

## 10.4 Integrations

Prioritize connectors by direct contribution to the core loop:

1. Calendar and email for interviews and outreach.
2. Interview recording/transcription and evidence ingestion.
3. Google Trends, search/news provider, and startup/company databases for current market signals.
4. Figma, Linear, GitHub, Vercel, and Sentry for build execution.
5. PostHog/Segment/GA and Stripe for launch, growth, and revenue truth.
6. CRM and campaign tools after the initial channel workflow is proven.

Connector adapters return normalized records with provider, source URL/ID, retrieved time, terms, reliability, and raw payload reference. The system must never label model recall as live evidence.

---

# 11. Agent collaboration architecture

## 11.1 Agent roles

**Core specialist agents:**

- Opportunity Agent
- Customer Research Agent
- Market Intelligence Agent
- Product Agent
- Technical Agent
- Finance Agent
- Launch Agent
- Growth Agent

**Control agents:**

- **Reflection Agent:** critiques strategy quality, missing alternatives, and reasoning shortcuts.
- **Verification Agent:** checks citations, calculations, source freshness, contradictions, and output schema.
- **Execution Agent:** decomposes approved decisions into tool-capable missions and monitors completion evidence.
- **Risk Agent:** examines legal, security, regulatory, operational, and irreversible downside where relevant.

Gemini is the co-founder/orchestrator interface, not merely another specialist node.

## 11.2 Dynamic deliberation workflow

```text
Founder intent or signal
  -> Orchestrator frames decision and evidence standard
  -> Planner selects only relevant agents and tools
  -> Researchers gather current evidence in parallel
  -> Specialists produce independent proposals
  -> Reflection critiques assumptions and alternatives
  -> Specialists respond to critiques
  -> Verification checks claims, sources, math, and conflicts
  -> Synthesizer produces options, dissent, recommendation, confidence basis
  -> Founder decides or requests another test
  -> Execution Agent creates approved mission/tool actions
  -> Outcome monitor updates evidence and calibration
```

Avoid one universal graph. Templates should exist for opportunity discovery, validation, product scope, architecture, launch, pricing, and growth, with dynamic routing inside each.

## 11.3 Contribution contract

Each agent contribution contains:

- task and role,
- input object IDs,
- claims made,
- evidence IDs,
- assumptions,
- proposal,
- alternatives considered,
- risks,
- confidence basis,
- requested follow-up,
- model/prompt/tool lineage,
- latency and cost.

Agents exchange structured contributions, not growing prose blobs.

## 11.4 Confidence

Calculate confidence from measurable components:

- source authority,
- source recency,
- source diversity and independence,
- directness of evidence,
- sample adequacy,
- agent agreement after critique,
- verifier pass rate,
- historical calibration for this task type,
- and unresolved contradiction penalty.

Show component-level basis. Do not average unrelated stage scores into a portfolio confidence number.

## 11.5 Failure handling

- Provider failure triggers route fallback according to task policy.
- Schema failure is repaired once, then routed or surfaced.
- Missing evidence produces a research mission, not fabricated completion.
- Agent disagreement above threshold becomes a founder decision or new test.
- Tool failure leaves mission state pending/blocked with verified error, never complete.
- Retry uses idempotency and preserves successful work.
- Human edits are protected and become explicit constraints or corrections.

---

# 12. Startup execution workflow

## 12.1 Stage gates

### Discover

**Objective:** identify a painful, reachable opportunity.  
**Exit evidence:** defined target user, observable painful job, urgency signal, reachable interview pool, and ranked assumptions.  
**Decision:** investigate, pivot framing, or stop.

### Validate

**Objective:** prove problem, behavior, and willingness to commit.  
**Exit evidence:** direct customer evidence, quantified current cost/behavior, failed alternatives, and commitment signal such as payment, LOI, pilot, or repeated use.  
**Decision:** build test, pivot, or stop.

### Build

**Objective:** ship the smallest instrumented solution that tests the value hypothesis.  
**Exit evidence:** target users can complete the core job, product events are captured, reliability threshold passes, and exclusions remain controlled.  
**Decision:** pilot, revise, or stop.

### Launch

**Objective:** acquire and activate a defined cohort through a measurable channel.  
**Exit evidence:** operational preflight passes, cohort arrives, activation and value behavior are measurable, and support loop works.  
**Decision:** iterate offer/onboarding/channel or proceed.

### Grow

**Objective:** establish retention and a repeatable economic growth loop.  
**Exit evidence:** cohort retention, monetization, CAC/payback, and channel repeatability meet startup-specific thresholds.  
**Decision:** scale, optimize, reposition, or stop.

## 12.2 Mandatory output envelope

Every agent synthesis must produce:

- decision it informs,
- recommendation and alternatives,
- evidence and source freshness,
- assumptions and risks,
- confidence basis,
- priority ranking,
- action plan,
- implementation steps,
- estimated human effort, elapsed time, and cost,
- suggested tools,
- acceptance evidence,
- and one next best action.

This envelope is consumed by missions and decisions; it is not rendered as a giant document by default.

## 12.3 Mission lifecycle

`draft -> proposed -> awaiting approval -> scheduled -> active -> blocked -> evidence review -> completed -> outcome review`

A mission includes objective, owner, deadline, budget, dependencies, tool permissions, stop condition, evidence standard, expected impact, and follow-up decision. Completion triggers an outcome review and updates dependent claims.

## 12.4 Example: customer validation mission

- **Assumption:** Operations managers lose at least five hours per week reconciling handoffs.
- **Threshold:** 8 of 12 qualified interviews report the behavior; 5 quantify cost above the target; 3 accept a paid pilot.
- **Execution:** identify participants, create outreach, approve sends, schedule calls, record consent, transcribe, code evidence, and request pilot commitment.
- **Agents:** Customer Research proposes method; Reflection challenges selection bias; Verification checks respondent qualification and quote provenance; Execution handles approved tooling.
- **Outcome:** assumption supported, weakened, or rejected.
- **Decision:** proceed with selected wedge, revise audience/problem, or stop.

---

# 13. UI/UX improvements

## 13.1 Design language

- Use a neutral charcoal/near-white operational foundation with restrained semantic colors: cyan for active intelligence, green for verified, amber for assumption/warning, red for contradiction/failure, and violet only for Gemini identity.
- Remove dominant purple gradients, decorative glow orbs, glass everywhere, and nested cards.
- Keep cards to repeated records, modals, and bounded tools with radius at or below 8 px.
- Prefer full-width panes, split views, tables, timelines, graphs, and inspectors for operational work.
- Use compact type in dense surfaces; reserve large display type for the homepage experience.
- Use zero letter spacing rather than compressed tracking.

## 13.2 Interaction quality

- Preserve context with side inspectors and command actions instead of deep page hops.
- Use keyboard-first command navigation for startup objects and actions.
- Provide undo for internal state changes and explicit rollback where integrations allow it.
- Autosave drafts with visible sync state and conflict handling.
- Keep one primary action per state; secondary actions use menus or contextual controls.
- Use icons for familiar tools and status, with tooltips for unfamiliar controls.
- Support bulk evidence triage and admin operations where repeated work demands it.
- Design empty states around creating the next mission or connection, not explanatory marketing copy.

## 13.3 Trust UX

- Every material claim exposes source, freshness, and whether it is fact, inference, estimate, or simulation.
- Confidence always provides a basis and missing information.
- Generated numbers include methodology and editable assumptions.
- Agent corrections and founder edits remain visible in history.
- Tool actions show exact payload/destination before approval and exact result afterward.
- Stale outputs are marked and downstream views show impact.

## 13.4 Accessibility

- WCAG 2.2 AA target.
- Full keyboard access and logical focus restoration across panes/dialogs.
- Semantic tables, timelines, graphs with alternative lists, and live-region announcements for real status changes.
- Never rely on color, animation, or 3D alone.
- Touch targets at least 44 px where touch is primary.
- Text reflows at 320 px without horizontal page scrolling; fixed-format tools get controlled internal scrolling.

---

# 14. Features that make the product world-class

These features matter because they alter outcomes, not because they look impressive:

1. **Decision graph:** Every strategy choice is explainable, reversible where possible, and connected to evidence and outcomes.
2. **Proof-gated missions:** Progress means evidence was accepted or a connected system verified the result.
3. **Live signal watch:** Material market, competitor, product, and revenue changes automatically reopen affected assumptions.
4. **Agent dissent:** Founders see credible disagreement and can choose another test instead of receiving false consensus.
5. **Outcome-calibrated confidence:** The system learns whether its confidence was deserved.
6. **Founder operating review:** A weekly Gemini-led review closes loops, reviews commitments, and resets priorities.
7. **One-click approved execution:** Convert decisions into real calendar, email, issue, deployment, analytics, CRM, or billing actions with controls.
8. **Startup flight recorder:** A durable timeline of what changed, why, who/what acted, and what happened afterward.
9. **Stop/pivot discipline:** Kill criteria and sunk-cost warnings make stopping a legitimate successful outcome.
10. **Scenario simulator:** Explore strategy changes against the decision graph without corrupting committed state.
11. **Claim-safe launch assets:** Messaging and decks are generated only from approved, current claims with provenance.
12. **Adaptive playbooks:** Missions vary by business model, sector, regulation, geography, stage, and founder capability.
13. **Human expert escalation:** Route high-risk legal, medical, security, or domain decisions to qualified reviewers with context packages.
14. **Operator-grade AI quality:** Prompt versions, evaluations, source quality, confidence calibration, cost, and incidents are first-class admin capabilities.

---

# 15. Delivery roadmap

## Phase 0: Instrument and stop pretending (2 weeks)

- Rename misleading "live" and "validated" states where evidence does not support them.
- Instrument current activation, pipeline, artifact, task, and chat behavior.
- Define typed product events and outcome taxonomy.
- Establish baseline retention and time-to-action metrics.
- Add source/fact/estimate/simulation labels consistently.

**Gate:** reliable baseline telemetry and no unsupported product claims.

## Phase 1: Execution core (6-8 weeks)

- Add claims, assumptions, evidence, decisions, missions, outcomes, and audit entities.
- Replace deterministic execution templates with mission generation from startup state.
- Build Today, Mission Control, Evidence Room, and Decision Room.
- Require evidence for mission completion.
- Turn Gemini proposed actions into typed internal state changes.
- Keep current reports as read-only legacy views/exports.

**Gate:** founders can close one complete assumption-to-decision loop without leaving the system of record.

## Phase 2: Real evidence and co-founder memory (6-8 weeks)

- Add web/news/trends/company adapters with provenance and freshness.
- Add calendar, email, interview capture, and transcription.
- Implement typed memory and retrieval over startup objects.
- Add proactive daily brief and signal policies.
- Add reflection and verification workflows.

**Gate:** at least 90% citation coverage on material market claims and first evidence captured within 24 hours for activated users.

## Phase 3: Build and launch execution (8-10 weeks)

- Add Linear/GitHub/Figma/Vercel/Sentry/PostHog/Stripe integrations.
- Build Product Workshop, Launch Room, preflight, approvals, and tool audit.
- Add long-running workflow support, idempotency, and compensation.
- Add release and launch outcome reviews.

**Gate:** a founder can move from validated decision to instrumented release and measurable launch mission.

## Phase 4: Admin control plane and growth (6-8 weeks)

- Build AI quality, prompt registry, evaluations, model routing, cost ledger, and incidents.
- Replace estimated revenue with Stripe-backed truth.
- Build Growth Lab and experiment engine.
- Add role-scoped admin operations and audited support tools.

**Gate:** operators can detect, diagnose, test, stage, and roll back an AI quality regression.

## Phase 5: Experiential shell (4-6 weeks, parallel after core proves value)

- Build homepage startup universe, interaction-led story, and honest simulation.
- Build login portal and onboarding model assembly.
- Add scene fallbacks, adaptive quality, accessibility, and automated canvas verification.
- Rework the visual system across work surfaces.

**Gate:** the experience improves idea submission and first-mission activation without harming performance or accessibility.

## Explicit prioritization

Do not build the ambitious 3D homepage first. It can create desire, but it cannot create retention. Build the decision/evidence/mission loop first, validate that founders repeatedly use it, then let the homepage demonstrate the real product behavior.

---

# 16. Architecture migration from the current repository

## Reuse

- FastAPI service structure and ownership-scoped access patterns.
- PostgreSQL, SQLAlchemy, Alembic, structured Pydantic contracts.
- Agent run durability, retry metadata, provider abstraction, and demo fallback.
- Next.js, React Query, Zustand, Framer Motion, and role-aware shell foundations.
- Existing generated artifacts as migration inputs and export formats.

## Replace

- Fixed `PIPELINE_STAGES` orchestration with decision-specific workflow templates and dynamic routing.
- Project-as-form with startup onboarding and evolving startup state.
- Execution plan JSON blob and generic task-state map with relational missions, steps, evidence gates, and outcomes.
- Fixed confidence values with computed evidence and verifier confidence.
- Recent-chat context assembly with typed memory retrieval.
- Admin aggregate endpoint with operational domain APIs.
- Static activity and polling-only experience with typed event streaming.

## Add carefully

- An outbox/event layer before proliferating automation.
- Connector and tool gateways with centralized permissions.
- Evidence normalization and provenance before claiming live intelligence.
- Evaluation infrastructure before admins can freely change prompts.
- Workflow engine only when long-running approvals and compensation outgrow Celery.
- Three.js only in isolated, dynamically loaded experience modules.

---

# 17. Non-goals and guardrails

- Do not simulate autonomous execution when no tool action occurred.
- Do not expose private model chain-of-thought; expose concise rationale, evidence, disagreement, and verification instead.
- Do not build social feeds, vanity founder scores, generic community, or an agent marketplace before the core loop works.
- Do not produce a pitch deck as a substitute for customer evidence.
- Do not let 3D reduce input responsiveness, accessibility, legibility, or mobile viability.
- Do not create separate screens because every database entity "needs CRUD."
- Do not let admin users edit production prompts without evaluation, staged rollout, and rollback.
- Do not optimize engagement by increasing chat volume or notifications.
- Do not present demo, estimate, or model recall as current evidence.

---

# 18. Acceptance criteria for the redesigned product

The redesign is real when a founder can:

1. Enter a rough idea and receive adaptive interrogation rather than a form.
2. See assumptions separated from known facts.
3. Start a specific evidence mission with owner, deadline, threshold, and stop condition.
4. Use connected tools to perform meaningful parts of the mission.
5. Inspect current sources and agent disagreement.
6. Make a durable decision linked to evidence and expected outcome.
7. Turn that decision into an instrumented build or launch workflow.
8. Have product/revenue events update startup state automatically.
9. Receive proactive Gemini help based on material changes, not generic reminders.
10. Review whether prior decisions and agent confidence were correct.

The admin product is real when an operator can:

1. Trace a poor recommendation to source, prompt, model, and tool context.
2. Reproduce it in an evaluation case.
3. test a correction against quality, cost, latency, and safety baselines.
4. Stage and roll back the change.
5. Identify affected customers and stale downstream state.
6. Understand real revenue and gross margin by plan and outcome.

Until those loops exist, additional polish should be treated as presentation work, not product transformation.
