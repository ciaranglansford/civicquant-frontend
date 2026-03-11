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
    eventTimeRaw: event.event_time,
    eventTimeIso: parsedDate ? parsedDate.toISOString() : null,
    eventTimeLabel: formatFeedEventTime(parsedDate),
  };
}
