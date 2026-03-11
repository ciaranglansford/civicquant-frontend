import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';

import { FeedTopic } from '../feed.models';
import { FEED_TOPIC_OPTIONS } from '../feed-topic.util';
import { FeedStateService } from '../state/feed-state.service';

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
  }
}
