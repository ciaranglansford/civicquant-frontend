export type FeedTopic =
  | 'macro_econ'
  | 'central_banks'
  | 'equities'
  | 'credit'
  | 'rates'
  | 'fx'
  | 'commodities'
  | 'crypto'
  | 'war_security'
  | 'geopolitics'
  | 'company_specific'
  | 'other';

export interface FeedEventDto {
  id: number;
  summary: string;
  topic: FeedTopic;
  event_time: string;
}

export interface FeedEventsResponseDto {
  items: FeedEventDto[];
  next_cursor: string | null;
}

export interface FeedEventsQuery {
  limit: number;
  cursor?: string;
  topic?: FeedTopic;
}

export interface FeedEventViewModel {
  id: number;
  summary: string;
  topic: FeedTopic;
  topicLabel: string;
  eventTimeRaw: string;
  eventTimeIso: string | null;
  eventTimeLabel: string;
}

export interface FeedViewState {
  items: FeedEventViewModel[];
  nextCursor: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  empty: boolean;
  selectedTopic: FeedTopic | null;
}
