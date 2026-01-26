import { Metadata } from 'next';

import { truncateMarkdown } from '@/lib/helpers';

import { getAvailableTopicById } from '../actions';
import { TAvailableTopic, TTopicId } from '../types';

interface TTopicMetadata {
  locale?: string;
  topicId: TTopicId;
  titlePrefix?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string;
}

/** Server function to create html, oath, twitter and other meta data tags */
export async function getTopicMetadata(params: TTopicMetadata) {
  const {
    // locale = defaultLanguage,
    topicId,
    titlePrefix,
    defaultTitle,
    defaultDescription,
    defaultKeywords,
  } = params;

  let topic: TAvailableTopic | undefined;
  try {
    topic = await getAvailableTopicById({ id: topicId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getTopicMetadata]', {
      error,
      topicId,
    });
    debugger; // eslint-disable-line no-debugger
    // NOTE: Do nothing on error: just use the default page title
  }

  const title =
    [
      // Combine page title
      titlePrefix,
      topic?.name,
    ]
      .filter(Boolean)
      .join(': ') || defaultTitle;
  const description = topic?.description
    ? truncateMarkdown(topic?.description, 300)
    : defaultDescription;
  const keywords = topic?.keywords || defaultKeywords;

  return {
    title,
    description,
    keywords,
  } satisfies Partial<Metadata>;
}
