import { QueryKey } from '@tanstack/react-query';

import { TGetResults, TGetResultsInfiniteQueryData } from '@/lib/types/api';
import { TAllUsedKeys, TQueryClient } from '@/lib/types/react-query';

/** Stringify react-query data key (unknown[] -> string)
 * Should return the same value as provided by `query.queryHash`
 */
export function stringifyQueryKey(queryKey: QueryKey) {
  return JSON.stringify(queryKey);
  // return String(queryKey);
}

/** Return query key hash without the final square bracket, to match all similar list hashes */
export function makeQueryKeyPrefix(queryKey: QueryKey | string) {
  if (typeof queryKey === 'string') {
    return queryKey;
  }
  const hash = JSON.stringify(queryKey);
  return hash.endsWith(']') ? hash.substring(0, hash.length - 1) : hash;
}

/** Extract & deduplicate topics by their IDs */
export function getUnqueItemsList<TItem extends { id: TId }, TId = string>(
  results?: TGetResults<TItem>[],
) {
  if (!results) return [];
  // Deduplicate topics by their ID
  const uniqueTopicsMap = new Set<TId>();
  return results
    .flatMap((page) => page?.items)
    .filter((page) => {
      if (page?.id && !uniqueTopicsMap.has(page.id)) {
        uniqueTopicsMap.add(page.id);
        return true;
      }
    });
}

/** Add a new item record to cached pages */
export function addNewItemToQueryCache<TItem>(
  queryClient: TQueryClient,
  queryKey: QueryKey,
  newTopic: TItem,
  toStart?: boolean,
) {
  return queryClient.setQueryData<TGetResultsInfiniteQueryData<TItem>>(queryKey, (oldData) => {
    if (!oldData) return oldData;
    const lastPageIndex = oldData.pages.length - 1;
    let totalCount = 0;
    const pages: TGetResults<TItem>[] = oldData.pages.map((page, index) => {
      if (toStart && index === 0) {
        page = { ...page, items: [newTopic, ...page.items] };
      } else if (!toStart && index === lastPageIndex) {
        page = { ...page, items: [...page.items, newTopic] };
      }
      totalCount += page.items.length;
      return page;
    });
    const updatedPages = pages.map((page) => ({ ...page, totalCount }));
    return { ...oldData, pages: updatedPages };
  });
}

/** Delete an item from cached pages by id */
export function deleteItemFromQueryCache<TItem extends { id: TId }, TId = string>(
  queryClient: TQueryClient,
  queryKey: QueryKey,
  topicIdToDelete: TId,
) {
  return queryClient.setQueryData<TGetResultsInfiniteQueryData<TItem>>(queryKey, (oldData) => {
    if (!oldData) return oldData;
    let totalCount = 0;
    const pages: TGetResults<TItem>[] = oldData.pages.map((page) => {
      const items = page.items.filter((topic) => topic.id !== topicIdToDelete);
      totalCount += items.length;
      return { ...page, items };
    });
    const updatedPages = pages.map((page) => ({ ...page, totalCount }));
    return { ...oldData, pages: updatedPages };
  });
}

/** Update an item in cached pages by id */
export function updateItemInQueryCache<TItem extends { id: TId }, TId = string>(
  queryClient: TQueryClient,
  queryKey: QueryKey,
  updatedTopic: TItem,
) {
  return queryClient.setQueryData<TGetResultsInfiniteQueryData<TItem>>(queryKey, (oldData) => {
    if (!oldData) return oldData;
    const updatedId = updatedTopic.id;
    const pages: TGetResults<TItem>[] = oldData.pages.map((page) => {
      if (!page.items.find(({ id }) => id === updatedId)) {
        return page;
      }
      const items = page.items.map((topic) =>
        topic.id === updatedTopic.id ? updatedTopic : topic,
      );
      return { ...page, items };
    });
    return { ...oldData, pages };
  });
}

/** Invalidate all used keys except the provided ones */
export function invalidateAllUsedKeysExcept(
  queryClient: TQueryClient,
  excludeKeys?: QueryKey[],
  allUsedKeys?: TAllUsedKeys,
) {
  const excludeKeysStr =
    Array.isArray(excludeKeys) && excludeKeys.length ? excludeKeys.map(stringifyQueryKey) : [];
  queryClient.invalidateQueries({
    predicate: (query) => {
      const { queryHash } = query;
      // const queryHash = stringifyQueryKey(query.queryKey);
      const invalidate =
        !excludeKeysStr.includes(queryHash) &&
        (!allUsedKeys ||
          Object.values(allUsedKeys).some((key) => stringifyQueryKey(key) === queryHash));
      return !!invalidate;
    },
  });
}

/** Invalidate all keys with given prefixes.
 * Use `makeQueryKeyPrefix` to create given query prefixes.
 * @param {TQueryClient} queryClient: TQueryClient
 * @param {string[]} queryPrefixes
 * @param {string[]} [exceptQueries] - Don't invalidate these queries (by query keys or hashes)
 */
export function invalidateKeysByPrefixes(
  queryClient: TQueryClient,
  queryPrefixes: string[],
  exceptQueries?: (QueryKey | string)[],
) {
  const exceptHashes = exceptQueries?.map((k) =>
    typeof k === 'string' ? k : stringifyQueryKey(k),
  );
  queryClient.invalidateQueries({
    predicate: (query) => {
      // const queryHash = stringifyQueryKey(query.queryKey); // NOTE: An alternate way to get a hash
      const { queryHash } = query;
      if (exceptHashes && exceptHashes.includes(queryHash)) {
        // This query is protected
        return false;
      }
      const invalidate = queryPrefixes.find((prefix) => queryHash.startsWith(prefix));
      return !!invalidate;
    },
  });
}
