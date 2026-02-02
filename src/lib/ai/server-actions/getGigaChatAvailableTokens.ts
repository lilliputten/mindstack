import { GigaChat as GigaChatDirect } from 'gigachat-node';
import { IBalance } from 'gigachat-node/interfaces/balance';

import { GIGACHAT_CREDENTIALS, GIGACHAT_MODEL } from '@/config/envServer';

export async function getGigaChatAvailableTokens() {
  try {
    const directClient = new GigaChatDirect({
      clientSecretKey: GIGACHAT_CREDENTIALS,
      model: GIGACHAT_MODEL,
      isIgnoreTSL: true,
      isPersonal: true,
      autoRefreshToken: true,
      imgOn: false,
    });

    const balance: { balance: IBalance[] } = await directClient.getBalance();
    const balances = balance.balance;
    const currentBalance = balances.find((item) => item.usage === GIGACHAT_MODEL);
    return currentBalance?.value;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[get-available-tokens] ❌ Error:', error);
    debugger; // eslint-disable-line no-debugger
    // throw error;
  }
}
