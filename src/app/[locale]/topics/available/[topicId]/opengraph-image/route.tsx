import { NextRequest } from 'next/server';

import { defaultLanguage } from '@/config/env';
import { getErrorText } from '@/lib/helpers';
import { TAwaitedLocaleProps } from '@/i18n';
import { renderTopicOpengraphImage } from '@/features/topics';

// export const runtime = 'edge';

type TAwaitedProps = TAwaitedLocaleProps<{ topicId: string }>;

/** Cache for N hours */
const hourSecs = 3600;
const cacheMaxAge = 1 * hourSecs;
const cacheStaleWhileRevalidate = 24 * hourSecs;

export async function GET(request: NextRequest, { params }: TAwaitedProps) {
  const { topicId, locale = defaultLanguage } = await params;

  try {
    const jpegBuffer = await renderTopicOpengraphImage({
      locale,
      topicId,
      baseUrl: request.url, // PUBLIC_URL
    });

    const cacheHeadersEntry = `public, immutable, no-transform, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheStaleWhileRevalidate}`;

    // Return a Response with the correct headers
    const headers = new Headers();
    headers.set('Content-Type', 'image/jpeg');
    headers.set('Cache-Control', cacheHeadersEntry);
    headers.set('CDN-Cache-Control', cacheHeadersEntry);

    return new Response(new Uint8Array(jpegBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    const errorMessage = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[opengraph-image/route]', 'Failed to generate opengraph image', {
      errorMessage,
      error,
      topicId,
      locale,
    });
    debugger; // eslint-disable-line no-debugger

    return new Response(`Failed to generate image: ${errorMessage}`, {
      status: 500,
    });
  }
}
