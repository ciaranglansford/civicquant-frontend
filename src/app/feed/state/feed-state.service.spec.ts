import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';

import { FeedEventsResponseDto, FeedEventDto, FeedEventsQuery, FeedViewState } from '../feed.models';
import { FeedEventsService } from '../data/feed-events.service';
import { FeedStateService } from './feed-state.service';

type QueuedResult = FeedEventsResponseDto | Subject<FeedEventsResponseDto>;

class FeedEventsServiceStub {
  private responses: QueuedResult[] = [];
  private errors = 0;

  readonly queries: FeedEventsQuery[] = [];

  queueResponse(response: FeedEventsResponseDto): void {
    this.responses.push(response);
  }

  queuePending(subject: Subject<FeedEventsResponseDto>): void {
    this.responses.push(subject);
  }

  queueError(): void {
    this.errors += 1;
  }

  getEvents(query: FeedEventsQuery): Observable<FeedEventsResponseDto> {
    this.queries.push(query);

    if (this.errors > 0) {
      this.errors -= 1;
      return throwError(() => new Error('network failure'));
    }

    const next = this.responses.shift() ?? { items: [], next_cursor: null };
    if (next instanceof Subject) {
      return next.asObservable();
    }

    return of(next);
  }
}

describe('FeedStateService', () => {
  let service: FeedStateService;
  let feedServiceStub: FeedEventsServiceStub;
  let latestState: FeedViewState;

  beforeEach(() => {
    feedServiceStub = new FeedEventsServiceStub();

    TestBed.configureTestingModule({
      providers: [
        FeedStateService,
        {
          provide: FeedEventsService,
          useValue: feedServiceStub,
        },
      ],
    });

    service = TestBed.inject(FeedStateService);
    latestState = {
      items: [],
      nextCursor: null,
      loading: false,
      loadingMore: false,
      error: null,
      empty: false,
      selectedTopic: null,
    };

    service.state$.subscribe((state) => {
      latestState = state;
    });
  });

  afterEach(() => {
    service.stop();
  });

  it('loads first page on start and preserves backend order', () => {
    feedServiceStub.queueResponse({
      items: [event(12), event(11)],
      next_cursor: 'cursor_2',
    });

    service.start();

    expect(latestState.items.map((item) => item.id)).toEqual([12, 11]);
    expect(latestState.nextCursor).toBe('cursor_2');
    expect(latestState.loading).toBeFalse();
    expect(feedServiceStub.queries[0]).toEqual({ limit: 30, topic: undefined });
  });

  it('resets scope and applies topic query when topic changes', () => {
    feedServiceStub.queueResponse({
      items: [event(12), event(11)],
      next_cursor: 'cursor_2',
    });
    feedServiceStub.queueResponse({
      items: [event(7, 'crypto', 'topic filtered')],
      next_cursor: null,
    });

    service.start();
    service.setTopic('crypto');

    expect(feedServiceStub.queries[1]).toEqual({ limit: 30, topic: 'crypto' });
    expect(latestState.selectedTopic).toBe('crypto');
    expect(latestState.items.map((item) => item.id)).toEqual([7]);
  });

  it('ignores stale responses after topic changes during in-flight requests', () => {
    const firstRequest = new Subject<FeedEventsResponseDto>();

    feedServiceStub.queuePending(firstRequest);
    feedServiceStub.queueResponse({
      items: [event(77, 'crypto', 'fresh topic item')],
      next_cursor: null,
    });

    service.start();
    service.setTopic('crypto');

    firstRequest.next({
      items: [event(99, 'macro_econ', 'stale result')],
      next_cursor: null,
    });
    firstRequest.complete();

    expect(latestState.selectedTopic).toBe('crypto');
    expect(latestState.items.map((item) => item.id)).toEqual([77]);
    expect(latestState.items.find((item) => item.id === 99)).toBeUndefined();
  });

  it('appends older pages while upserting duplicate ids in place', () => {
    feedServiceStub.queueResponse({
      items: [event(12, 'macro_econ', 'a'), event(11, 'macro_econ', 'b')],
      next_cursor: 'cursor_2',
    });
    feedServiceStub.queueResponse({
      items: [event(11, 'macro_econ', 'b updated'), event(10, 'macro_econ', 'c')],
      next_cursor: null,
    });

    service.start();
    service.loadMore();

    expect(latestState.items.map((item) => item.id)).toEqual([12, 11, 10]);
    expect(latestState.items.find((item) => item.id === 11)?.summary).toContain('b updated');
  });

  it('includes topic and cursor in load-more query after topic selection', () => {
    feedServiceStub.queueResponse({
      items: [event(30, 'crypto'), event(29, 'crypto')],
      next_cursor: 'cursor_2',
    });
    feedServiceStub.queueResponse({
      items: [event(28, 'crypto')],
      next_cursor: null,
    });

    service.setTopic('crypto');
    service.loadMore();

    expect(feedServiceStub.queries[0]).toEqual({ limit: 30, topic: 'crypto' });
    expect(feedServiceStub.queries[1]).toEqual({
      limit: 30,
      cursor: 'cursor_2',
      topic: 'crypto',
    });
    expect(latestState.items.map((item) => item.id)).toEqual([30, 29, 28]);
  });

  it('polls every 60s and performs head-refresh merge', fakeAsync(() => {
    feedServiceStub.queueResponse({
      items: [event(12), event(11)],
      next_cursor: 'cursor_2',
    });
    feedServiceStub.queueResponse({
      items: [event(13, 'macro_econ', 'new top'), event(12, 'macro_econ', 'updated')],
      next_cursor: 'cursor_2',
    });

    service.start();
    tick(60_000);

    expect(latestState.items.map((item) => item.id)).toEqual([13, 12, 11]);
    expect(latestState.items.find((item) => item.id === 12)?.summary).toContain('updated');
  }));

  it('exposes recoverable error state when first fetch fails', () => {
    feedServiceStub.queueError();

    service.start();

    expect(latestState.error).toContain('Could not load feed events');
    expect(latestState.items).toEqual([]);
  });
});

function event(id: number, topic: FeedEventDto['topic'] = 'macro_econ', summary?: string): FeedEventDto {
  return {
    id,
    topic,
    summary: summary ?? `event ${id}`,
    event_time: '2026-03-01 20:28:48.000',
  };
}

