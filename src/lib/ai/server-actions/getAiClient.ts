import { ChatCloudflareWorkersAI, CloudflareWorkersAIInput } from '@langchain/cloudflare';
import { BaseLanguageModelParams } from '@langchain/core/language_models/base';
import { BaseChatModelParams } from '@langchain/core/language_models/chat_models';
import { GigaChatClientConfig } from 'gigachat';
import { GigaChat, GigaChatCallOptions, GigaChatInput } from 'langchain-gigachat';

import { defaultAIGenerationTemperature } from '@/config/env';
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  GIGACHAT_CREDENTIALS,
  GIGACHAT_MODEL,
} from '@/config/envServer';
import { getHttpsAgent } from '@/lib/ai';

import { defaultAiClientType, TAiClientType } from '../types/TAiClientType';

export type TGigaChatClient = GigaChat<GigaChatCallOptions>;
export type TCloudflareClient = ChatCloudflareWorkersAI;
export type TAiClient = GigaChat<GigaChatCallOptions> | TCloudflareClient;

const cachedClients: Partial<Record<string, TAiClient>> = {};

// const maxTokens = 50; // Don't use low values: it'j just cutting the answer in the middle

export async function getAiClient(
  clientType: 'GigaChat',
  temperature?: number,
): Promise<TGigaChatClient>;
// eslint-disable-next-line no-redeclare
export async function getAiClient(
  clientType: 'Cloudflare',
  temperature?: number,
): Promise<TCloudflareClient>;
// eslint-disable-next-line no-redeclare
export async function getAiClient(
  clientType?: TAiClientType,
  temperature?: number,
): Promise<TAiClient>;
// eslint-disable-next-line no-redeclare
export async function getAiClient(
  clientType: TAiClientType = defaultAiClientType,
  temperature: number = defaultAIGenerationTemperature,
) {
  const idKey = [clientType, temperature].filter(Boolean).join('-');
  if (cachedClients[idKey]) {
    return cachedClients[idKey];
  }
  let client: TAiClient | undefined;
  try {
    if (clientType === 'Cloudflare') {
      // Cloudflare
      client = new ChatCloudflareWorkersAI({
        model: '@cf/meta/llama-3.1-8b-instruct', // Default value
        cloudflareAccountId: CLOUDFLARE_ACCOUNT_ID,
        cloudflareApiToken: CLOUDFLARE_API_TOKEN,
        // Pass a custom base URL to use Cloudflare AI Gateway
        // baseUrl: `https://gateway.ai.cloudflare.com/v1/{YOUR_ACCOUNT_ID}/{GATEWAY_NAME}/workers-ai/`,
      } satisfies CloudflareWorkersAIInput & BaseLanguageModelParams);
    } else if (clientType === 'GigaChat') {
      // GigaChat
      client = new GigaChat({
        credentials: GIGACHAT_CREDENTIALS,
        model: GIGACHAT_MODEL,
        useApiForTokens: true, // enable token counting via API
        httpsAgent: getHttpsAgent(),
        temperature,
        // maxTokens,
        verbose: true,
      } satisfies GigaChatClientConfig & GigaChatInput & BaseChatModelParams);
    }
    if (!client) {
      throw new Error(`Cannot create an ai client for "{clientType}".`);
    }
    cachedClients[idKey] = client;
    return client;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getAiClient] ❌ Error:', error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
