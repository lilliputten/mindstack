import { CommandGroup, commands } from '@grammyjs/commands';
import { PrismaAdapter } from '@grammyjs/storage-prisma';
import { Bot, session } from 'grammy';

import { BOT_TOKEN } from '@/config/envServer';
import { prisma } from '@/lib/db';
import { getErrorText } from '@/lib/helpers';
import { isDev } from '@/config';

import { BotContext, SessionData, TBot } from './botTypes';

const cachedBots: Record<string, TBot> = {};

export const botCommands = new CommandGroup();

/* Bot is a logging mostly. Don't wait for a quite long time */
const timeoutSeconds = isDev ? 5 : 10;

export function getBot(token: string = BOT_TOKEN) {
  if (cachedBots[token]) {
    return cachedBots[token];
  }
  try {
    // const bot = new Bot(token);
    // @see constructor(token: string, config?: BotConfig<C>);
    const bot = new Bot<BotContext>(token, {
      client: {
        timeoutSeconds: timeoutSeconds,
      },
    });
    bot.use(commands());
    bot.use(botCommands);
    bot.use(
      session({
        initial: (): SessionData => ({
          // Default sesion contents...
          language_code: undefined,
        }),
        storage: new PrismaAdapter<SessionData>(prisma.telegramSession),
      }),
    );
    // Store the created bot
    cachedBots[token] = bot;
    return bot;
  } catch (error) {
    const errMsg = ['Bot creation error', getErrorText(error)].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[src/features/bot/core/getBot.ts]', errMsg, {
      error,
      token,
    });
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
}
