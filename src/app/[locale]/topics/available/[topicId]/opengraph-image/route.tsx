import React from 'react';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import { defaultLanguage, siteDescription, siteKeywords, siteTitle } from '@/config/env';
import { getT, TAwaitedLocaleProps } from '@/i18n';
import { getTopicMetadata } from '@/features/topics';

// export const runtime = 'edge';

type TAwaitedProps = TAwaitedLocaleProps<{ topicId: string }>;

const defaultTextStyles: React.CSSProperties = {
  display: 'flex',
  color: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  // 2 strings max
  lineHeight: '1.5',
  maxHeight: '3em',
};

export async function GET(request: NextRequest, { params }: TAwaitedProps) {
  try {
    const { topicId, locale = defaultLanguage } = await params;

    const t = await getT({ locale });

    // Use absolute URL to the template image in the public directory
    const imageUrl = new URL(
      '/static/opengraph-image/topic-opengraph-image-template.png',
      request.url,
    ).toString();

    const topicMetadata = await getTopicMetadata({
      locale,
      topicId,
      titlePrefix: t('Pages.WorkoutTopicGoTitle'),
    });

    const title = topicMetadata.title || t('Pages.RootTitle') || siteTitle;
    const description = topicMetadata.description || t('Pages.RootDescription') || siteDescription;
    const keywords = topicMetadata.keywords || t('Pages.RootKeywords') || siteKeywords;

    // eslint-disable-next-line no-console
    console.log('[TOPICS:OPENGRAPH_IMAGE]', 'Generating opengraph image', {
      title,
      description,
      keywords,
      topicMetadata,
      imageUrl,
      topicId,
      locale,
    });

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            position: 'relative',
            padding: '80px',
            paddingBottom: '30px',
            gap: '20px',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              ...defaultTextStyles,
              fontSize: '54px',
              fontWeight: 'bold',
            }}
          >
            {title}
          </div>
          {!!description && (
            <div
              style={{
                ...defaultTextStyles,
                fontSize: '40px',
                opacity: '0.5',
              }}
            >
              {description}
            </div>
          )}
          {!!keywords && (
            <div
              style={{
                ...defaultTextStyles,
                fontSize: '32px',
                fontWeight: 'bold',
                opacity: '0.5',
              }}
            >
              {keywords}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    // eslint-disable-next-line no-console
    console.error('[TOPICS:OPENGRAPH_IMAGE]', 'Failed to generate opengraph image', {
      errorMessage,
      errorStack,
      error,
    });
    debugger; // eslint-disable-line no-debugger

    return new Response(`Failed to generate image: ${errorMessage}\nStack: ${errorStack}`, {
      status: 500,
    });
  }
}
