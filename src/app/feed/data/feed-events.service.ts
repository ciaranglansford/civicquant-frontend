import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FeedEventsQuery, FeedEventsResponseDto } from '../feed.models';
import { FeedEventsHttpClient } from './feed-events-http.client';
import { FeedEventsMockClient } from './feed-events-mock.client';

@Injectable({ providedIn: 'root' })
export class FeedEventsService {
  private readonly httpClient = inject(FeedEventsHttpClient);
  private readonly mockClient = inject(FeedEventsMockClient);

  getEvents(query: FeedEventsQuery): Observable<FeedEventsResponseDto> {
    if (environment.feedMockEnabled) {
      return this.mockClient.getEvents(query);
    }

    return this.httpClient.getEvents(query);
  }
}
