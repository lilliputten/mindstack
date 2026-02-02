import * as React from 'react';

import { useInvalidateReactQueryKeys } from '@/lib/data';
import { aiGenerationsStatusQueryKey } from '@/features/ai-generations/query-hooks';

import { sendUserAIRequest, TAIRequestOptions } from '../actions';
import { TAITextQueryData } from '../types';
import { TPlainMessage } from '../types/messages';

export function useUserAIRequest() {
  const invalidateKeys = useInvalidateReactQueryKeys();
  /** A hook to send AI query, calls server action `sendUserAIRequest`, see for reference */
  const userAIRequest = React.useCallback(
    async (messages: TPlainMessage[], opts: TAIRequestOptions = {}) => {
      const queryData: TAITextQueryData = await sendUserAIRequest(messages, opts);
      invalidateKeys([aiGenerationsStatusQueryKey]);
      return queryData;
    },
    [invalidateKeys],
  );
  return userAIRequest;
}
