'use server';

import { getErrorText } from '@/lib/helpers';
import { TLocale } from '@/i18n/types';

import DocsContentEn from './DocsContentEn.md';

const contentMap: Record<string, string> = {
  en: DocsContentEn,
};

export type TContentData = { content: string };

export async function getContent(locale: TLocale): Promise<TContentData> {
  try {
    const content = contentMap[locale] || contentMap.en;
    if (!content) {
      throw new Error(`Content not found for locale: ${locale}`);
    }
    return { content } satisfies TContentData;
  } catch (error) {
    const errorMessage = getErrorText(error);
    const nextMessage = ['Failed to load content', errorMessage].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[getContent]', nextMessage, {
      error,
      locale,
    });
    // debugger; // eslint-disable-line no-debugger
    throw new Error(nextMessage);
  }
}
