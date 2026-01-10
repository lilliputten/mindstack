import { InlineKeyboard } from 'grammy';

import { getT, localeNames } from '@/i18n';
import { localesList } from '@/i18n/types';
import { TCommandContext } from '@/features/bot/core/botTypes';
import { getBot } from '@/features/bot/core/getBot';
import { getContextLocale } from '@/features/bot/helpers/getContextLocale';

const bot = getBot();

bot.command('language', async (ctx: TCommandContext) => {
  const locale = getContextLocale(ctx);
  const t = await getT({ locale });
  const keyboard = new InlineKeyboard();
  localesList.forEach((locale) => {
    const text = localeNames[locale];
    keyboard.text(text, `select-language-${locale}`); // (ctx) => ctx.reply('You pressed A!'));
  });
  await ctx.reply(t('Bot.SelectLanguage'), {
    reply_markup: keyboard,
  });
});

// Select language callbacks
localesList.forEach(async (locale) => {
  bot.callbackQuery(`select-language-${locale}`, async (ctx) => {
    const session = ctx.session;
    const t = await getT({ locale });
    const localeText = localeNames[locale];
    const text = t('Bot.LanguageChangedFor') + ' ' + localeText;
    session.language_code = locale;
    await ctx.answerCallbackQuery({
      text,
    });
    await ctx.editMessageReplyMarkup();
    // await initBotCommands(locale, ctx);
    await ctx.reply(text);
  });
});
