import { isDev } from '@/config';
import { secondMs } from '@/constants';

export const paymentPollDelay = isDev ? secondMs * 30 : secondMs * 30;
