import React from 'react';
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query';

import { TAvailableTopicsResultsQueryData } from '@/lib/types/react-query';
import { getErrorText } from '@/lib/helpers';
import { composeUrlQuery } from '@/lib/helpers/urls';
import { TGetAvailableTopicByIdParams } from '@/lib/zod-schemas';
import { defaultStaleTime } from '@/constants';
import { getAvailableTopicById } from '@/features/topics/actions';
import { TAvailableTopic } from '@/features/topics/types';

interface TUseAvailableTopicByIdProps extends TGetAvailableTopicByIdParams {
  /** availableTopicsQueryKey - A query key from `useAvailableTopics` */
  availableTopicsQueryKey?: QueryKey;
}

const staleTime = defaultStaleTime;

/** Get topic data from cached `useAvailableTopics` query data or fetch it now */
export function useAvailableTopicById(props: TUseAvailableTopicByIdProps) {
  const queryClient = useQueryClient();
  // const invalidateKeys = useInvalidateReactQueryKeys();
  const { availableTopicsQueryKey, id: topicId, ...queryProps } = props;

  /* Use partrial query url as a part of the query key */
  const queryUrlHash = React.useMemo(() => composeUrlQuery(queryProps), [queryProps]);

  const queryKey = React.useMemo<QueryKey>(
    () => ['available-topic', topicId, queryUrlHash],
    [queryUrlHash, topicId],
  );

  // Check cached infinite query data first
  const availableTopicsData: TAvailableTopicsResultsQueryData | undefined =
    availableTopicsQueryKey &&
    queryClient.getQueryData<TAvailableTopicsResultsQueryData>(availableTopicsQueryKey);

  // Try to find the topic in cached infinite pages
  const cachedTopic = availableTopicsData?.pages
    .flatMap((page) => page.items)
    .find((topic) => topic.id === topicId);

  const isCached = !!cachedTopic;

  // Only fetch if the topic is not cached
  const query = useQuery<TAvailableTopic>({
    queryKey,
    staleTime, // Data validity period
    queryFn: async (_params) => {
      try {
        /* // OPTION 1: Using route api fetch
         * const url = appendUrlQueries(`/api/topics/${topicId}`, queryUrlHash);
         * const result = await handleApiResponse<TAvailableTopic>(fetch(url), {
         *   onInvalidateKeys: invalidateKeys,
         *   debugDetails: {
         *     initiator: 'useAvailableTopicById',
         *     action: 'getAvailableTopicById',
         *     url,
         *     queryProps,
         *     topicId,
         *   },
         * });
         * return result.data as TAvailableTopic;
         */
        // OPTION 2: Using server function
        return await getAvailableTopicById({ id: topicId, ...queryProps });
      } catch (error) {
        const errDetails = getErrorText(error); // error instanceof APIError ? error.details : null;
        const humanMsg = 'Cannot load topic data';
        // eslint-disable-next-line no-console
        console.error('[useAvailableTopicById:queryFn]', humanMsg, {
          errDetails,
          error,
          queryProps,
          topicId,
        });
        // eslint-disable-next-line no-debugger
        debugger;
        // toast.error(humanMsg);
        throw new Error(humanMsg);
      }
    },
    enabled: !!topicId && !isCached, // Disable query if already cached
  });

  return {
    topic: cachedTopic ?? query.data,
    isCached,
    queryKey,
    queryClient,
    ...query,
  };
}
