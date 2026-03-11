# Feed V1 Test Plan

## Objectives
Validate that the public feed renders event data from `GET /api/feed/events` correctly, preserves backend ordering, upserts by id, and remains usable across mobile and desktop layouts.

## Unit tests

### Timestamp parsing/formatting
- File: `src/app/feed/time/feed-time.util.spec.ts`
- Cases:
  - Parse ISO timestamp with timezone (`2026-03-01T20:28:48.000Z`).
  - Parse compatibility timestamp (`2026-03-01 20:28:48.000`) as UTC.
  - Reject invalid timestamp strings.
  - Format valid timestamp to `HH:mm, dd/MM/yyyy`.
  - Fallback formatting for null/invalid (`Unknown time`).

### Merge/upsert behavior
- File: `src/app/feed/state/feed-merge.util.spec.ts`
- Cases:
  - Upsert replaces existing item payload by id.
  - Head-refresh merge puts incoming ids first and retains remaining order.
  - Load-more merge appends unseen ids only.

### Feed state behavior
- File: `src/app/feed/state/feed-state.service.spec.ts`
- Cases:
  - Initial `start()` fetch uses first-page query and renders in backend order.
  - Topic change resets scope and queries with selected topic.
  - Load-more appends older events while updating duplicate ids in place.
  - Polling every 60 seconds performs head-refresh merge.
  - Initial fetch error sets recoverable error state.

## Component/integration-level verification

### Implemented coverage
- App root boots correctly (`src/app/app.component.spec.ts`).
- Feed state tests cover interactions across service and merge/path logic.

### Optional future coverage
- Add component template tests for feed page rendering states (loading/empty/error/load-more button visibility).
- Add HTTP client tests for query param serialization (`limit`, `cursor`, `topic`) and URL base handling.

## Manual verification checklist

### Core behavior
- [ ] Open app and confirm first page loads with latest events.
- [ ] Confirm each card shows summary, topic label, and formatted event time.
- [ ] Confirm `event_time` displays as `HH:mm, dd/MM/yyyy`.
- [ ] Confirm list order matches backend/API response order.

### Loading/empty/error states
- [ ] Confirm loading state appears before initial data.
- [ ] Confirm empty state appears when `items` is empty.
- [ ] Confirm error state appears on initial request failure and retry works.
- [ ] Confirm inline recoverable error appears when poll/load-more fails while items already exist.

### Pagination and merge
- [ ] Click "Load more" and confirm older items append.
- [ ] Confirm duplicate ids from older page do not duplicate cards.
- [ ] Confirm duplicate ids from poll refresh update existing content.
- [ ] Confirm head refresh keeps incoming ids on top while retaining existing order below.

### Topic filter
- [ ] Change topic and confirm list resets and refetches with selected topic.
- [ ] Confirm polling and load-more requests continue using selected topic.

### Responsive behavior
- [ ] Mobile width (~375px): readable cards, no clipped text, touch-friendly controls.
- [ ] Tablet width (~768px): balanced spacing and metadata readability.
- [ ] Desktop width (~1280px): efficient horizontal usage without hover-only dependencies.

## Executed validation results (this implementation)
- `npm.cmd run build` -> **PASS**
- `npm.cmd run test -- --watch=false --browsers=ChromeHeadless` -> **PASS** (`16/16` tests)

## Manual responsive execution status (2026-03-11)
- Not executed interactively in this CLI run because no GUI viewport emulator is available here.
- Responsive behavior was validated by stylesheet and breakpoint review (mobile default, @media (min-width: 760px) for tablet/desktop).
- Required follow-up: run a browser-based manual check at ~375px, ~768px, and ~1280px and capture notes/screenshots.

## Key edge cases
- Ambiguous non-timezone timestamps handled in centralized parser as UTC.
- Polling and pagination overlap guarded by in-flight checks.
- Invalid/malformed API timestamp values handled with non-crashing fallback display.




