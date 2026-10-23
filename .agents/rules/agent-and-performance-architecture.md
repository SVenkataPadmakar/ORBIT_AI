# Rule: Production Agent Orchestration & Next.js Interaction Performance

## 1. No Mock/Hardcoded Agent Stubs
- All multi-agent workflows must compile into real executable StateGraphs (e.g., LangGraph) with typed Pydantic artifacts.
- Deterministic calculation tools (`estimate_market_size`, `validate_ddl_schema`, `calculate_unit_economics`) must be used to ground model outputs and verify assertions.
- Agents must never output decorative or hardcoded strings where real computation, database schemas, or API contracts are expected.

## 2. Next.js Modular Loading & Navigation Responsiveness
- Large workspace hubs containing 5+ heavy domain panels (charts, canvases, orbital visualizations, D3 nodes) must NEVER be statically imported in a single page component.
- Always use `next/dynamic` with `ssr: false` or component-level suspense:
  ```typescript
  const HeavyComponent = dynamic(() => import("./heavy-component"), {
    ssr: false,
    loading: () => <WorkspaceSkeleton />
  });
  ```
- Configure `optimizePackageImports` in `next.config.ts` for heavy icon and animation libraries (`lucide-react`, `recharts`, `framer-motion`).

## 3. Global Event Listeners & UI Thread Hygiene
- Document-level listeners (e.g., custom cursors, mouse trackers) must never re-bind on state changes.
- Use mutable `useRef` for listener state callbacks or CSS custom properties `--mouse-x`, `--mouse-y` to prevent main-thread layout thrashing during button clicks and route transitions.
