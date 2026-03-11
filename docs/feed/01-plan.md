# Public Feed V1 Plan

## Feature goal
Deliver a public-facing, responsive feed page that renders deduplicated feed events from `GET /api/feed/events` for both mobile and desktop users from one Angular codebase.

## Assumptions
- `C:\Users\ciara\civicquant-frontend` is the target frontend repo and is currently a fresh Angular app scaffold.
- Backend contract for the frontend is `GET /api/feed/events` with `items` and `next_cursor`.
- Backend remains authoritative for deduplication, filtering invalid summaries, and ordering.
- Backend topic values align with `Topic` literals observed in `civicquant-telegram/app/schemas.py`.
- Backend may temporarily emit `event_time` in non-ISO format (`YYYY-MM-DD HH:mm:ss.SSS`) without timezone.

## Constraints
- Do not consume ingest endpoints or raw messages in frontend rendering.
- Preserve backend response ordering for fetched sets.
- Use cursor-based pagination via opaque `next_cursor`.
- Keep architecture simple for v1:
  - client-rendered Angular app
  - no SSR
  - no websocket/SSE
  - no global state framework unless needed.

## Architecture and stack choice
- Framework: Angular 19 standalone app (repo was empty; Angular selected per requirement).
- Delivery: Single responsive web app (mobile-first, desktop-capable).
- Rendering: Client-side data fetch and render.
- SSR status: Not used in v1 to minimize complexity and delivery risk for a lightweight public feed.
- Native apps status: Not chosen; one responsive codebase satisfies phone + desktop requirement faster.

## Data flow
1. Feed page initializes.
2. State service fetches first page with `limit=30` (configurable).
3. Response DTOs map into view models through a timestamp adapter.
4. State merges by id and updates ordered list for rendering.
5. UI renders cards in state order.
6. Polling refreshes first page every 60 seconds (configurable).
7. "Load more" requests with `cursor` and merges older events.
8. Optional topic filter updates query and resets pagination scope.

## State strategy
- Local service store with:
  - `itemsById: Map<number, FeedEventViewModel>`
  - `orderedIds: number[]`
  - `nextCursor`
  - `loading`, `loadingMore`, `error`, `empty`, `selectedTopic`.
- Merge rules:
  - Head refresh (initial/poll): incoming ids become top segment in backend order; previous non-overlapping ids stay after.
  - Load more: append only unseen ids in backend order; update duplicates in place without moving order.
  - Upsert always replaces item payload by id.

## Polling strategy
- Default poll interval: `60000` ms from environment config.
- Poll runs on first-page query for active topic.
- Poll is skipped during active fetch to avoid overlapping requests.

## Pagination strategy
- Use opaque `next_cursor` from API response.
- Include current topic filter in paginated requests.
- Disable/hidden "Load more" when `next_cursor` is absent.

## Timestamp handling strategy
- Isolate parsing and formatting in a dedicated utility layer.
- Preferred contract: ISO-8601 with timezone (example `2026-03-01T20:28:48.000Z`).
- Compatibility support: parse `YYYY-MM-DD HH:mm:ss.SSS` as UTC.
- UI output format: `HH:mm, dd/MM/yyyy`.
- Invalid timestamps degrade gracefully to a safe placeholder display.

## Error handling approach
- First page failure shows error state with retry.
- Poll failure does not wipe existing list; state retains prior items.
- Load-more failure shows recoverable error while preserving loaded items.
- Empty state shown only when no items and no loading/error blocking state.

## Rollout risks
- **Contract gap risk:** Current checked-out `civicquant-telegram` code does not yet expose `/api/feed/events`.
- **Timestamp ambiguity risk:** Non-timezone timestamps can be misinterpreted across systems/timezones.
- **Integration drift risk:** Backend response fields may evolve (for example moving from `summary_1_sentence` internals to feed-specific `summary` is expected but should be validated).

## Implementation sequence
1. Scaffold Angular app + base routing/config.
2. Define feed contract types and topic enum mapping.
3. Build timestamp adapter utility and tests.
4. Build feed API client + env-gated mock provider.
5. Build merge utilities + tests.
6. Build feed state service (fetch, poll, pagination, upsert).
7. Build responsive feed UI (list, states, filter, load more).
8. Add unit/component tests.
9. Validate build/tests and finalize docs/handoff.
