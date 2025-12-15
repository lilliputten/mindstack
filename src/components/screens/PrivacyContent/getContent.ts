'use server';

import { getErrorText } from '@/lib/helpers';
import { TLocale } from '@/i18n/types';

import PrivacyContentEn from './PrivacyContentEn.md';
import PrivacyContentEs from './PrivacyContentEs.md';
import PrivacyContentRu from './PrivacyContentRu.md';

const contentMap: Record<string, string> = {
  en: PrivacyContentEn,
  es: PrivacyContentEs,
  ru: PrivacyContentRu,
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
    const nextMessage = ['Failed to load privacy content', errorMessage].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[getContent]', nextMessage, { error, locale });
    throw new Error(nextMessage);
  }
}
