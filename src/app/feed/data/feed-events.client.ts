import { Observable } from 'rxjs';

import { FeedEventsQuery, FeedEventsResponseDto } from '../feed.models';

export interface FeedEventsClient {
  getEvents(query: FeedEventsQuery): Observable<FeedEventsResponseDto>;
}
