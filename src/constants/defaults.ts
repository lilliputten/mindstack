import { minuteMs } from './datetime';
import { isDev } from './isDev';

export const defaultItemsLimit = isDev ? 10 : 50;
export const defaultStaleTime = minuteMs * 10;
export const longStaleTime = minuteMs * 30;
