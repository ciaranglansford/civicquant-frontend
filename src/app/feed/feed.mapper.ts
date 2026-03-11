import { FeedEventDto, FeedEventViewModel } from './feed.models';
import { toFeedTopicLabel } from './feed-topic.util';
import { formatFeedEventTime, parseFeedEventTime } from './time/feed-time.util';

export function mapFeedEventDtoToViewModel(event: FeedEventDto): FeedEventViewModel {
  const parsedDate = parseFeedEventTime(event.event_time);

  return {
    id: event.id,
    summary: event.summary,
    topic: event.topic,
    topicLabel: toFeedTopicLabel(event.topic),
    impactScore: normalizeImpactScore(event.impact_score),
    eventTimeRaw: event.event_time,
    eventTimeIso: parsedDate ? parsedDate.toISOString() : null,
    eventTimeLabel: formatFeedEventTime(parsedDate),
  };
}

function normalizeImpactScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}
