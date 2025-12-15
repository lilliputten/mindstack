'use server';

import { getErrorText } from '@/lib/helpers';
import { TLocale } from '@/i18n';

import TermsContentEn from './TermsContentEn.md';
import TermsContentEs from './TermsContentEs.md';
import TermsContentRu from './TermsContentRu.md';

const contentMap: Record<string, string> = {
  en: TermsContentEn,
  es: TermsContentEs,
  ru: TermsContentRu,
};

export async function getContent(locale: TLocale) {
  try {
    const content = contentMap[locale] || contentMap.en;
    if (!content) {
      throw new Error(`Content not found for locale: ${locale}`);
    }
    return { content };
  } catch (error) {
    const errorMessage = getErrorText(error);
    const nextMessage = ['Failed to load terms content', errorMessage].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[getContent]', nextMessage, { error, locale });
    throw new Error(nextMessage);
  }
}
