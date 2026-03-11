import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FeedEventsQuery, FeedEventsResponseDto } from '../feed.models';
import { FeedEventsClient } from './feed-events.client';
import { normalizeLimit } from './feed-events-http.client';
import { MOCK_FEED_EVENTS } from './feed-mock.fixtures';

@Injectable({ providedIn: 'root' })
export class FeedEventsMockClient implements FeedEventsClient {
  getEvents(query: FeedEventsQuery): Observable<FeedEventsResponseDto> {
    const limit = normalizeLimit(query.limit);
    const topicFiltered = query.topic
      ? MOCK_FEED_EVENTS.filter((item) => item.topic === query.topic)
      : MOCK_FEED_EVENTS;

    const offset = decodeCursor(query.cursor);
    const items = topicFiltered.slice(offset, offset + limit);
    const nextOffset = offset + items.length;

    return of({
      items,
      next_cursor: nextOffset < topicFiltered.length ? encodeCursor(nextOffset) : null,
    }).pipe(delay(150));
  }
}

function encodeCursor(offset: number): string {
  return `cursor_${offset.toString(36)}`;
}

function decodeCursor(cursor: string | undefined): number {
  if (!cursor) {
    return 0;
  }

  const match = /^cursor_([0-9a-z]+)$/i.exec(cursor);
  if (!match) {
    return 0;
  }

  const parsed = Number.parseInt(match[1], 36);
  return Number.isNaN(parsed) ? 0 : parsed;
}
