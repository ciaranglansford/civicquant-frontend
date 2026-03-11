import { FeedEventViewModel } from '../feed.models';
import { mergeHeadOrder, mergeLoadMoreOrder, upsertById } from './feed-merge.util';

function item(id: number, summary: string): FeedEventViewModel {
  return {
    id,
    summary,
    topic: 'macro_econ',
    topicLabel: 'Macro Econ',
    eventTimeRaw: '2026-03-01 20:28:48.000',
    eventTimeIso: '2026-03-01T20:28:48.000Z',
    eventTimeLabel: '20:28, 01/03/2026',
  };
}

describe('feed-merge.util', () => {
  it('upserts incoming events by id', () => {
    const existing = new Map<number, FeedEventViewModel>([[10, item(10, 'old')]]);

    const merged = upsertById(existing, [item(10, 'new'), item(9, 'new 9')]);

    expect(merged.get(10)?.summary).toBe('new');
    expect(merged.get(9)?.summary).toBe('new 9');
  });

  it('merges head order by placing incoming ids first', () => {
    expect(mergeHeadOrder([10, 9, 8], [11, 10])).toEqual([11, 10, 9, 8]);
  });

  it('merges load-more order by appending only unseen ids', () => {
    expect(mergeLoadMoreOrder([11, 10, 9], [9, 8, 7])).toEqual([11, 10, 9, 8, 7]);
  });
});
