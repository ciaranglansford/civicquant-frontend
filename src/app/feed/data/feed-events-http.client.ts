import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DEFAULT_FEED_PAGE_SIZE, MAX_FEED_PAGE_SIZE } from '../feed.constants';
import { FeedEventsQuery, FeedEventsResponseDto } from '../feed.models';
import { FeedEventsClient } from './feed-events.client';

@Injectable({ providedIn: 'root' })
export class FeedEventsHttpClient implements FeedEventsClient {
  private readonly http = inject(HttpClient);

  getEvents(query: FeedEventsQuery): Observable<FeedEventsResponseDto> {
    let params = new HttpParams().set('limit', normalizeLimit(query.limit).toString());

    if (query.cursor) {
      params = params.set('cursor', query.cursor);
    }

    if (query.topic) {
      params = params.set('topic', query.topic);
    }

    return this.http.get<FeedEventsResponseDto>(buildFeedEventsUrl(), { params });
  }
}

export function normalizeLimit(value: number | undefined): number {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_FEED_PAGE_SIZE;
  }

  return Math.min(MAX_FEED_PAGE_SIZE, Math.max(1, Math.floor(value)));
}

function buildFeedEventsUrl(): string {
  const baseUrl = environment.apiBaseUrl.trim().replace(/\/+$/, '');
  return baseUrl ? `${baseUrl}/api/feed/events` : '/api/feed/events';
}
