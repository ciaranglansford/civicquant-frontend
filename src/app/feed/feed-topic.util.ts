import { FEED_TOPICS, FEED_TOPIC_LABELS } from './feed.constants';
import { FeedTopic } from './feed.models';

export interface FeedTopicOption {
  value: FeedTopic;
  label: string;
}

export const FEED_TOPIC_OPTIONS: FeedTopicOption[] = FEED_TOPICS.map((topic) => ({
  value: topic,
  label: FEED_TOPIC_LABELS[topic],
}));

export function toFeedTopicLabel(topic: FeedTopic): string {
  return FEED_TOPIC_LABELS[topic] ?? topic;
}
