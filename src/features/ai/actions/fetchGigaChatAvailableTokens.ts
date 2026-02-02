'use server';

import { IBalance } from 'gigachat-node/interfaces/balance';

import { GIGACHAT_MODEL } from '@/config/envServer';
import { getGigaChatDirectClient } from '@/lib/ai';

export async function fetchGigaChatAvailableTokens() {
  try {
    const directClient = getGigaChatDirectClient();
    const balance: { balance: IBalance[] } = await directClient.getBalance();
    const balances = balance.balance;
    const currentBalance = balances.find((item) => item.usage === GIGACHAT_MODEL);
    return { currentBalance: currentBalance?.value, balances };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[get-available-tokens] ❌ Error:', error);
    debugger; // eslint-disable-line no-debugger
    // throw error;
  }
}
