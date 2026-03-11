import { FeedEventViewModel } from '../feed.models';

export function upsertById(
  existing: Map<number, FeedEventViewModel>,
  incoming: FeedEventViewModel[],
): Map<number, FeedEventViewModel> {
  const next = new Map(existing);

  for (const item of incoming) {
    next.set(item.id, item);
  }

  return next;
}

export function mergeHeadOrder(existingIds: number[], incomingIds: number[]): number[] {
  const incomingSet = new Set(incomingIds);
  const retainedIds = existingIds.filter((id) => !incomingSet.has(id));
  return [...incomingIds, ...retainedIds];
}

export function mergeLoadMoreOrder(existingIds: number[], incomingIds: number[]): number[] {
  const existingSet = new Set(existingIds);
  const appended = incomingIds.filter((id) => !existingSet.has(id));
  return [...existingIds, ...appended];
}
