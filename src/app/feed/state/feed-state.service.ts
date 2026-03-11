import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { DEFAULT_POLLING_MS } from '../feed.constants';
import { mapFeedEventDtoToViewModel } from '../feed.mapper';
import {
  FeedEventViewModel,
  FeedEventsResponseDto,
  FeedTopic,
  FeedViewState,
} from '../feed.models';
import { FeedEventsService } from '../data/feed-events.service';
import { normalizeLimit } from '../data/feed-events-http.client';
import { mergeHeadOrder, mergeLoadMoreOrder, upsertById } from './feed-merge.util';

const INITIAL_FEED_STATE: FeedViewState = {
  items: [],
  nextCursor: null,
  loading: false,
  loadingMore: false,
  error: null,
  empty: false,
  selectedTopic: null,
};

@Injectable({ providedIn: 'root' })
export class FeedStateService implements OnDestroy {
  private readonly feedEventsService = inject(FeedEventsService);
  private readonly pageSize = normalizeLimit(environment.feedPageSize);
  private readonly pollMs = normalizePollingMs(environment.feedPollingMs);

  private readonly stateSubject = new BehaviorSubject<FeedViewState>(INITIAL_FEED_STATE);

  readonly state$ = this.stateSubject.asObservable();

  private itemsById = new Map<number, FeedEventViewModel>();
  private orderedIds: number[] = [];
  private pollingSubscription?: Subscription;
  private activeHeadRequests = 0;
  private isLoadMoreRequestInFlight = false;
  private headRequestRevision = 0;

  start(): void {
    if (this.pollingSubscription) {
      return;
    }

    this.fetchFirstPage(false, false);
    this.pollingSubscription = interval(this.pollMs).subscribe(() => {
      if (this.isHeadRequestInFlight() || this.isLoadMoreRequestInFlight) {
        return;
      }

      this.fetchFirstPage(true, false);
    });
  }

  stop(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }

  ngOnDestroy(): void {
    this.stop();
    this.stateSubject.complete();
  }

  setTopic(topic: FeedTopic | null): void {
    if (topic === this.stateSubject.value.selectedTopic) {
      return;
    }

    this.itemsById.clear();
    this.orderedIds = [];

    this.patchState({
      selectedTopic: topic,
      items: [],
      nextCursor: null,
      loading: true,
      loadingMore: false,
      error: null,
      empty: false,
    });

    this.fetchFirstPage(false, true);
  }

  retry(): void {
    this.fetchFirstPage(false, true);
  }

  loadMore(): void {
    if (this.isHeadRequestInFlight() || this.isLoadMoreRequestInFlight) {
      return;
    }

    const currentState = this.stateSubject.value;
    if (!currentState.nextCursor) {
      return;
    }

    this.isLoadMoreRequestInFlight = true;
    this.patchState({ loadingMore: true, error: null });

    this.feedEventsService
      .getEvents({
        limit: this.pageSize,
        cursor: currentState.nextCursor,
        topic: currentState.selectedTopic ?? undefined,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.isLoadMoreRequestInFlight = false;
        }),
      )
      .subscribe({
        next: (response) => {
          const normalized = normalizeFeedResponse(response);
          const incoming = normalized.items.map(mapFeedEventDtoToViewModel);
          this.itemsById = upsertById(this.itemsById, incoming);
          this.orderedIds = mergeLoadMoreOrder(
            this.orderedIds,
            incoming.map((item) => item.id),
          );

          this.patchState({
            items: this.materializeItems(),
            nextCursor: normalized.next_cursor,
            loadingMore: false,
            loading: false,
            error: null,
            empty: this.orderedIds.length === 0,
          });
        },
        error: () => {
          this.patchState({
            loadingMore: false,
            loading: false,
            error: 'Could not load older events. Please retry.',
            empty: this.orderedIds.length === 0,
          });
        },
      });
  }

  private fetchFirstPage(isPoll: boolean, force: boolean): void {
    if (this.isHeadRequestInFlight() && !force) {
      return;
    }

    const revision = ++this.headRequestRevision;
    this.activeHeadRequests += 1;

    if (!isPoll) {
      this.patchState({ loading: true, error: null });
    }

    this.feedEventsService
      .getEvents({
        limit: this.pageSize,
        topic: this.stateSubject.value.selectedTopic ?? undefined,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.activeHeadRequests = Math.max(0, this.activeHeadRequests - 1);
        }),
      )
      .subscribe({
        next: (response) => {
          if (revision !== this.headRequestRevision) {
            return;
          }

          const normalized = normalizeFeedResponse(response);
          const incoming = normalized.items.map(mapFeedEventDtoToViewModel);

          this.itemsById = upsertById(this.itemsById, incoming);
          this.orderedIds = mergeHeadOrder(
            this.orderedIds,
            incoming.map((item) => item.id),
          );

          this.patchState({
            items: this.materializeItems(),
            nextCursor: normalized.next_cursor,
            loading: false,
            loadingMore: false,
            error: null,
            empty: this.orderedIds.length === 0,
          });
        },
        error: () => {
          if (revision !== this.headRequestRevision) {
            return;
          }

          this.patchState({
            loading: false,
            loadingMore: false,
            error: 'Could not load feed events. Please retry.',
            empty: this.orderedIds.length === 0,
            items: this.materializeItems(),
          });
        },
      });
  }

  private isHeadRequestInFlight(): boolean {
    return this.activeHeadRequests > 0;
  }

  private materializeItems(): FeedEventViewModel[] {
    return this.orderedIds
      .map((id) => this.itemsById.get(id))
      .filter((item): item is FeedEventViewModel => item !== undefined);
  }

  private patchState(partial: Partial<FeedViewState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }
}

function normalizeFeedResponse(response: FeedEventsResponseDto): FeedEventsResponseDto {
  const items = Array.isArray(response.items) ? response.items : [];
  const nextCursor = typeof response.next_cursor === 'string' ? response.next_cursor : null;

  return {
    items,
    next_cursor: nextCursor,
  };
}

function normalizePollingMs(value: number): number {
  if (!value || Number.isNaN(value) || value < 1_000) {
    return DEFAULT_POLLING_MS;
  }

  return Math.floor(value);
}
