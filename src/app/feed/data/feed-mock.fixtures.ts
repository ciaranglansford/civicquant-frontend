import { FEED_TOPICS } from '../feed.constants';
import { FeedEventDto, FeedTopic } from '../feed.models';

const BASE_EVENT_TIME_UTC = Date.UTC(2026, 2, 11, 19, 0, 0);

export const MOCK_FEED_EVENTS: FeedEventDto[] = Array.from({ length: 72 }, (_, index) => {
  const id = 1400 - index;
  const topic = FEED_TOPICS[index % FEED_TOPICS.length];
  const eventTime = new Date(BASE_EVENT_TIME_UTC - index * 5 * 60 * 1000);

  return {
    id,
    summary: `Mock feed event #${id}: ${topic.replace('_', ' ')} update generated for local development.`,
    topic,
    event_time: index % 2 === 0 ? toLegacyTimestamp(eventTime) : eventTime.toISOString(),
    impact_score: mockImpactScore(topic, index),
  };
});

function mockImpactScore(topic: FeedTopic, index: number): number {
  const baseByTopic: Record<FeedTopic, number> = {
    macro_econ: 82,
    central_banks: 84,
    equities: 73,
    credit: 76,
    rates: 80,
    fx: 71,
    commodities: 74,
    crypto: 77,
    war_security: 90,
    geopolitics: 83,
    company_specific: 68,
    other: 62,
  };

  const variation = index % 7;
  return Math.min(99, Math.max(35, baseByTopic[topic] + variation));
}

function toLegacyTimestamp(value: Date): string {
  const yyyy = value.getUTCFullYear().toString();
  const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = value.getUTCDate().toString().padStart(2, '0');
  const hh = value.getUTCHours().toString().padStart(2, '0');
  const mm = value.getUTCMinutes().toString().padStart(2, '0');
  const ss = value.getUTCSeconds().toString().padStart(2, '0');
  const ms = value.getUTCMilliseconds().toString().padStart(3, '0');

  return `${yyyy}-${month}-${day} ${hh}:${mm}:${ss}.${ms}`;
}
