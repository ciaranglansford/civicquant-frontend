import { FeedTopic } from './feed.models';

export const FEED_TOPICS: FeedTopic[] = [
  'macro_econ',
  'central_banks',
  'equities',
  'credit',
  'rates',
  'fx',
  'commodities',
  'crypto',
  'war_security',
  'geopolitics',
  'company_specific',
  'other',
];

export const FEED_TOPIC_LABELS: Record<FeedTopic, string> = {
  macro_econ: 'Macro Econ',
  central_banks: 'Central Banks',
  equities: 'Equities',
  credit: 'Credit',
  rates: 'Rates',
  fx: 'FX',
  commodities: 'Commodities',
  crypto: 'Crypto',
  war_security: 'War / Security',
  geopolitics: 'Geopolitics',
  company_specific: 'Company Specific',
  other: 'Other',
};

export const DEFAULT_FEED_PAGE_SIZE = 30;
export const MAX_FEED_PAGE_SIZE = 100;
export const DEFAULT_POLLING_MS = 60_000;
