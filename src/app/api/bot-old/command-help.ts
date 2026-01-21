import { getT } from '@/i18n';
import { TCommandContext } from '@/features/bot/core/botTypes';
import { getBot } from '@/features/bot/core/getBot';
import { getContextLocale } from '@/features/bot/helpers/getContextLocale';

const bot = getBot();

bot.command('help', async (ctx: TCommandContext) => {
  const locale = getContextLocale(ctx);
  const t = await getT({ locale, namespace: 'Bot' });
  await ctx.reply(t('help'));
});
