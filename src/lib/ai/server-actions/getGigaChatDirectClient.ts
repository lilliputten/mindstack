// import { GigaChat } from 'gigachat';
import { GigaChat as GigaChatDirect } from 'gigachat-node';

import { GIGACHAT_CREDENTIALS, GIGACHAT_MODEL } from '@/config/envServer';

import { getHttpsAgent } from './getHttpsAgent';

let cachedClient: GigaChatDirect | undefined;

// Create client instance
export function getGigaChatDirectClient() {
  if (cachedClient) {
    return cachedClient;
  }
  let client: GigaChatDirect | undefined;
  try {
    // GigaChat
    client = new GigaChatDirect({
      clientSecretKey: GIGACHAT_CREDENTIALS,
      model: GIGACHAT_MODEL,
      isIgnoreTSL: true,
      isPersonal: true,
      autoRefreshToken: true,
      imgOn: false,
      httpsAgent: getHttpsAgent(),
    });

    if (!client) {
      throw new Error(`Cannot create a GigaChat client.`);
    }
    cachedClient = client;
    return client;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getGigaChatDirectClient] ❌ Error:', error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
