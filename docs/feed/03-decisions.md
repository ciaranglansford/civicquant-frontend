# Public Feed V1 Decisions

## ADR-001: Rendering strategy
- Status: Accepted
- Decision: Use client-rendered Angular app shell for v1 (no SSR).
- Rationale: Public feed payload is lightweight and eventual consistency is acceptable; CSR reduces implementation complexity and delivery risk.
- Consequences: Faster v1 delivery; SEO/first-paint improvements from SSR are deferred.

## ADR-002: Framework and architecture
- Status: Accepted
- Decision: Build one Angular responsive web app for both desktop and mobile.
- Rationale: Repository was empty; project requirements prefer Angular when no existing frontend framework exists.
- Consequences: Single codebase for phone + desktop, lower maintenance than separate native apps.

## ADR-003: Data source boundary
- Status: Accepted
- Decision: Frontend consumes only `GET /api/feed/events`; it never consumes ingest APIs or raw messages.
- Rationale: Feed events are the canonical deduplicated downstream unit.
- Consequences: Frontend avoids semantic dedupe responsibilities and ingest-layer coupling.

## ADR-004: Ordering policy
- Status: Accepted
- Decision: Preserve backend ordering for each fetched set and use deterministic merge rules around that order.
- Rationale: Backend has authoritative event ordering context (for example `last_updated_at DESC, id DESC` assumptions).
- Consequences: Frontend does not introduce custom sorting heuristics.

## ADR-005: Client state and cache approach
- Status: Accepted
- Decision: Use local service state (Map + ordered id list) without external global state library.
- Rationale: v1 scope is narrow; custom service is simpler and testable.
- Consequences: Adequate for v1; can evolve to larger state architecture if scope expands.

## ADR-006: Timestamp contract handling
- Status: Accepted
- Decision: Prefer timezone-aware ISO-8601; support compatibility format `YYYY-MM-DD HH:mm:ss.SSS` interpreted as UTC; centralize parse/format.
- Rationale: Backend currently stores naive datetimes in events/extractions and may not emit timezone-aware values yet.
- Consequences: Compatibility works now, but timezone ambiguity remains a contract risk until backend emits explicit timezone offsets.

## ADR-007: Polling approach
- Status: Accepted
- Decision: Poll first page every 60 seconds by default using environment config.
- Rationale: Feed is not real-time critical for v1 and polling is simpler than websocket/SSE.
- Consequences: Slightly stale between intervals is acceptable for v1.

## ADR-008: Local development fallback
- Status: Accepted
- Decision: Use explicit environment-gated mock provider when backend feed endpoint is unavailable locally.
- Rationale: Backend reference code in `civicquant-telegram` currently does not expose `/api/feed/events` in this checkout.
- Consequences: Frontend delivery is unblocked while preserving production API path behavior.

## ADR-009: Responsive web over native app approaches
- Status: Accepted
- Decision: Build one mobile-first responsive web experience, defer PWA/native packaging.
- Rationale: Requirement targets quick delivery to desktop + phone from same source code.
- Consequences: Native/offline enhancements are future improvements, not v1 blockers.
