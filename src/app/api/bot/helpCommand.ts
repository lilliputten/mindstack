import { TLocale } from '@/i18n/types';
import { TCommandContext } from '@/features/bot/core/botTypes';
import { getBotCommands } from '@/features/bot/helpers/getBotCommands';
import { getContextLocale } from '@/features/bot/helpers/getContextLocale';

export async function helpCommand(ctx: TCommandContext) {
  const locale = getContextLocale(ctx);
  const botCommands = await getBotCommands(locale as TLocale);
  const cmdsList = botCommands.map(({ command, description }) => `/${command} - ${description}`);
  return await ctx.reply(
    [
      // Commands list...
      '*AVAILABLE COMMANDS:*',
      cmdsList.join('\n'),
    ].join('\n\n'),
    { parse_mode: 'Markdown' },
  );
}
