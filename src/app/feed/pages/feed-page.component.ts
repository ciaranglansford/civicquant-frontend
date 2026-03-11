import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';

import { FeedEventViewModel, FeedTopic } from '../feed.models';
import { FEED_TOPIC_OPTIONS } from '../feed-topic.util';
import { FeedStateService } from '../state/feed-state.service';

interface MarketTicker {
  symbol: string;
  name: string;
  price: string;
  changePct24h: string;
  basis: string;
  source: string;
}

@Component({
  selector: 'app-feed-page',
  imports: [AsyncPipe],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedPageComponent implements OnInit, OnDestroy {
  private readonly feedStateService = inject(FeedStateService);

  readonly state$ = this.feedStateService.state$;
  readonly topicOptions = FEED_TOPIC_OPTIONS;

  readonly marketTickers: MarketTicker[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '$67,240',
      changePct24h: '+1.84%',
      basis: '24h',
      source: 'Internal pricing source',
    },
    {
      symbol: 'XAU',
      name: 'Gold (oz)',
      price: '$2,168',
      changePct24h: '+0.42%',
      basis: '24h',
      source: 'Internal pricing source',
    },
    {
      symbol: 'SPX',
      name: 'S&P 500',
      price: '5,126',
      changePct24h: '-0.31%',
      basis: '24h',
      source: 'Internal pricing source',
    },
    {
      symbol: 'CL1',
      name: 'Oil (WTI)',
      price: '$79.12',
      changePct24h: '-0.56%',
      basis: '24h',
      source: 'Internal pricing source',
    },
  ];

  selectedEventId: number | null = null;

  ngOnInit(): void {
    this.feedStateService.start();
  }

  ngOnDestroy(): void {
    this.feedStateService.stop();
  }

  onRetry(): void {
    this.feedStateService.retry();
  }

  onLoadMore(): void {
    this.feedStateService.loadMore();
  }

  onTopicChange(value: string): void {
    const nextTopic = value ? (value as FeedTopic) : null;
    this.feedStateService.setTopic(nextTopic);
    this.selectedEventId = null;
  }

  onSelectEvent(eventId: number): void {
    this.selectedEventId = this.selectedEventId === eventId ? null : eventId;
  }

  getBreakingEvents(items: FeedEventViewModel[]): FeedEventViewModel[] {
    return items.filter((item) => item.impactScore > 80).slice(0, 16);
  }

  getSelectedEvent(items: FeedEventViewModel[]): FeedEventViewModel | null {
    if (this.selectedEventId === null) {
      return null;
    }

    return items.find((item) => item.id === this.selectedEventId) ?? null;
  }

  buildBlogHeadlines(item: FeedEventViewModel | null, selectedTopic: FeedTopic | null): string[] {
    const topic = selectedTopic ?? item?.topic ?? 'macro_econ';
    const summary = item?.summary ?? 'Latest market-moving event from the live feed.';

    return [
      `What today's ${topic.replace('_', ' ')} signal means for positioning`,
      `Morning brief: ${summary}`,
      'Three key implications and what to watch next session',
    ];
  }

  buildNewsHeadlines(item: FeedEventViewModel | null, selectedTopic: FeedTopic | null): string[] {
    const topic = selectedTopic ?? item?.topic ?? 'macro_econ';
    const summary = item?.summary ?? 'Developing event from CivicQuant live desk.';

    return [
      `Live update: ${topic.replace('_', ' ')} developments`,
      summary,
      'Context: latest reaction, timeline, and what comes next',
    ];
  }
}

