# Feed V1 Handoff

## Final implementation summary
Implemented a production-sensible Angular v1 public feed page that consumes only `GET /api/feed/events` and supports:
- first-page fetch (`limit=30` default, env-configurable)
- id-based upsert merge
- backend-order-preserving merge behavior
- cursor pagination with "Load more"
- topic filter (backend enum values)
- 60-second polling (env-configurable)
- loading, empty, error, and recoverable inline-error states
- centralized timestamp parse/format adapter
- responsive mobile-first layout for phone + desktop
- env-gated mock data source for local development fallback.

## How to run locally
1. Install dependencies (if needed):
   - `npm.cmd install`
2. Start dev server:
   - `npm.cmd start`
3. Build production bundle:
   - `npm.cmd run build`
4. Run tests:
   - `npm.cmd run test -- --watch=false --browsers=ChromeHeadless` (`16/16` passing)

## Environment/config needed
Configured in `src/environments/environment.ts` and `src/environments/environment.development.ts`:
- `apiBaseUrl`
- `feedPollingMs` (default `60000`)
- `feedPageSize` (default `30`)
- `feedMockEnabled` (default `false`)

### Local mock mode
- Set `feedMockEnabled: true` in development environment to use deterministic fixture data when backend endpoint is unavailable.
- Mock mode is explicit and does not alter production path.

## Manual responsive checks status
- Automated/unit validation is complete, but interactive manual viewport checks were not executed in this headless CLI session.
- Pending manual verification in browser devtools at approximately 375px, 768px, and 1280px widths.

## Known gaps and assumptions
- Backend reference checkout (`civicquant-telegram`) currently does not expose `/api/feed/events` in routers; frontend was implemented against agreed V1 contract.
- Compatibility timestamp format `YYYY-MM-DD HH:mm:ss.SSS` is treated as UTC to reduce ambiguity.
- Display currently formats using UTC clock components (`HH:mm, dd/MM/yyyy`) for deterministic contract compatibility.

## Future improvements
1. Add component template tests for fine-grained UI states.
2. Add HTTP client tests for exact query serialization.
3. Add pagination controls for "back to top" or lazy append UX refinements.
4. Add richer accessibility checks (focus order, ARIA announcements, contrast audit).

## If/when SSR is added later
- Keep current service/data boundaries and move first-page data fetch to server route resolver.
- Ensure polling remains client-only after hydration.
- Revisit cache headers and transfer state to avoid duplicate first fetch.

## If backend moves `event_time` to strict ISO-8601 with timezone
- Keep parser utility as single integration point and simplify by deprecating legacy parser branch.
- Remove compatibility tests once backend contract is fully migrated.
- Keep display formatter unchanged unless product requires locale-time output.

## If PWA support is added later
- Add Angular service worker for offline shell and cache strategy.
- Keep feed API network-first with stale fallback for public timeline.
- Add installability metadata/icons and offline fallback messaging.



