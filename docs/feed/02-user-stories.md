# Public Feed V1 User Stories

## US-01 Visitor sees latest feed items
As a public visitor, I want to see the latest feed events when I open the page so I can understand current developments quickly.

### Acceptance criteria
- On first load, frontend requests `GET /api/feed/events?limit=30` (or configured page size).
- The list renders `summary` as primary content.
- The list renders `topic` and formatted `event_time` as secondary metadata.
- The render order matches API response order for the fetched set.

## US-02 Visitor sees loading state
As a visitor, I need visible loading feedback while data is being fetched.

### Acceptance criteria
- Initial fetch shows a loading state before data renders.
- Loading state is cleared once success or error resolves.
- Load-more uses a distinct loading indicator for the button/action.

## US-03 Visitor sees empty state
As a visitor, I want a clear empty state when no events are available.

### Acceptance criteria
- If `items` is empty on first-page success, an empty state message appears.
- Empty state is not shown while loading.

## US-04 Visitor sees error state and can recover
As a visitor, I want to understand when loading fails and retry.

### Acceptance criteria
- Initial-load failure shows error message and retry action.
- Retry triggers a fresh first-page request.
- Existing events remain visible if later poll/load-more calls fail.

## US-05 Visitor can load older items
As a visitor, I want to request older feed events to continue browsing history.

### Acceptance criteria
- "Load more" appears only when `next_cursor` exists.
- Clicking "Load more" sends `cursor=next_cursor` with current topic and limit.
- Older unseen items append in backend order.
- Existing ids are updated in place, not duplicated.

## US-06 Client upserts by id on refresh/poll
As a visitor, I want refreshed data to keep the feed accurate without duplicate cards.

### Acceptance criteria
- Polling and refresh merge by `id`.
- If incoming item id already exists, summary/topic/time values are replaced.
- Duplicate cards are never created for the same id.

## US-07 Updated event content replaces existing row
As a visitor, I want corrected event text/topic/time to replace stale content.

### Acceptance criteria
- When same id arrives with changed `summary`, `topic`, or `event_time`, UI row updates.
- Existing row position follows merge rules (head refresh reorder only for refreshed set; load-more keeps existing position for duplicates).

## US-08 Event time formatting is consistent
As a visitor, I want event times shown in a readable consistent format.

### Acceptance criteria
- Valid timestamps display as `HH:mm, dd/MM/yyyy`.
- ISO-8601 with timezone is supported.
- Compatibility format `YYYY-MM-DD HH:mm:ss.SSS` is supported and interpreted as UTC.
- Timestamp parsing/formatting logic is centralized in one utility layer.

## US-09 Topic filtering is available
As a visitor, I want to filter the feed by topic to focus on relevant events.

### Acceptance criteria
- Topic control provides `All` plus backend topic enum options.
- Changing topic resets pagination and fetches first page for that topic.
- Polling and load-more honor selected topic.

## US-10 Polling keeps the feed fresh
As a visitor, I want feed updates without refreshing the browser.

### Acceptance criteria
- Polling runs every 60 seconds by default (configurable).
- Polling requests first page for active topic.
- Polling upserts by id and preserves merge ordering rules.

## US-11 Page is usable on mobile and desktop
As a visitor on phone or desktop, I want a readable, touch-friendly feed from one codebase.

### Acceptance criteria
- Mobile layout (around 375px) has readable cards and tap targets.
- Desktop layout (around 1280px) uses available width effectively.
- No critical interaction depends on hover.
- Same app source handles both device classes.
