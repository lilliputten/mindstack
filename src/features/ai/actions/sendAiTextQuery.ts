'use server';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { GigaChatCallOptions } from 'langchain-gigachat';

import { getAiClient } from '@/lib/ai/getAiClient';
import { defaultAiClientType } from '@/lib/ai/types/TAiClientType';
import { getErrorText } from '@/lib/helpers';

import { TPlainMessage } from '../types/messages';
import { TAIQuerDebugDataId, TAIQueryOptions } from '../types/TAIQueryOptions';
import { TAITextQueryData } from '../types/TAITextQueryData';

type TGenericMessage = HumanMessage | SystemMessage;

async function getDebugDataContent(debugData: TAIQuerDebugDataId) {
  switch (debugData) {
    case 'answers-query-data-01':
      return await import('./sample-data/GenerateQuestions/answers-query-data-01.json');
    case 'questions-query-data-02':
      return await import('./sample-data/GenerateQuestions/questions-query-data-02.json');
    case 'questions-query-data-01':
    default:
      return await import('./sample-data/GenerateQuestions/questions-query-data-01.json');
  }
}

export async function sendAiTextQuery(messages: TPlainMessage[], opts: TAIQueryOptions = {}) {
  const { clientType = defaultAiClientType, debugData } = opts;
  if (debugData) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const data = await getDebugDataContent(debugData);
      return data.default as TAITextQueryData;
    } catch (error) {
      const details = getErrorText(error);
      const message = 'Cannot load debug data';
      // eslint-disable-next-line no-console
      console.error('[sendAiTextQuery] ❌ Error:', [message, details].join(': '), { error });
      debugger; // eslint-disable-line no-debugger
      throw error;
    }
  }
  try {
    const prepartedMessages: TGenericMessage[] = messages.map(({ role: type, content: text }) => {
      if (type === 'system') {
        return new SystemMessage(text);
      }
      return new HumanMessage(text);
    });
    const client = await getAiClient(clientType);
    const options = {
      model: client.model,
    } satisfies GigaChatCallOptions;
    const res = await client.invoke(prepartedMessages, options);
    const {
      content,
      name,
      additional_kwargs,
      response_metadata,
      id,
      tool_calls,
      invalid_tool_calls,
      usage_metadata,
    } = res;
    const data: TAITextQueryData = {
      content,
      name,
      additional_kwargs,
      response_metadata,
      id,
      tool_calls,
      invalid_tool_calls,
      usage_metadata,
    };
    return data;
  } catch (error) {
    const details = getErrorText(error);
    const message = 'Cannot receive and process AI generated data';
    // eslint-disable-next-line no-console
    console.error('[sendAiTextQuery] ❌ Error:', [message, details].join(': '), {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
