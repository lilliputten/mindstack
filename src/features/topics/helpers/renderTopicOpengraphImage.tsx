'use server';

import React from 'react';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';

import { defaultLanguage, siteDescription, siteKeywords, siteTitle } from '@/config/env';
import { getErrorText } from '@/lib/helpers';
import { getT } from '@/i18n';
import { getTopicMetadata, TTopicId } from '@/features/topics';

const imageWidth = 1200;
const imageHeight = 630;

const defaultTextStyles: React.CSSProperties = {
  display: 'flex',
  color: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  // 2 lines max
  lineHeight: '1.25',
  maxHeight: '2.5em',
};

interface TOpengraphImageParams {
  locale?: string;
  topicId: TTopicId;
  baseUrl: string;
}

export async function renderTopicOpengraphImage(params: TOpengraphImageParams) {
  const { topicId, locale = defaultLanguage, baseUrl } = params;

  try {
    const t = await getT({ locale });

    // Use absolute URL to the template image in the public directory
    const imageUrl = new URL(
      '/static/opengraph-image/topic-opengraph-image-template.png',
      baseUrl,
    ).toString();

    const topicMetadata = await getTopicMetadata({
      locale,
      topicId,
      // titlePrefix: t('Pages.WorkoutTopicGoTitle'),
    });

    const title = topicMetadata.title || t('Pages.RootTitle') || siteTitle;
    const description = topicMetadata.description || t('Pages.RootDescription') || siteDescription;
    const keywords = topicMetadata.keywords || t('Pages.RootKeywords') || siteKeywords;

    const imageResponse = new ImageResponse(
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
            gap: '2em',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              ...defaultTextStyles,
              fontSize: '56px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>
          {!!description && (
            <div
              style={{
                ...defaultTextStyles,
                fontSize: '48px',
                opacity: '0.5',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {description}
            </div>
          )}
          {!!keywords && (
            <div
              style={{
                ...defaultTextStyles,
                gap: '0.25em',
                fontSize: '36px',
                flexWrap: 'wrap',
                // 2 lines max
                lineHeight: '1.25',
                maxHeight: '3em',
              }}
            >
              {keywords.split(',').map((s, n) => (
                <span
                  key={n}
                  style={{
                    ...defaultTextStyles,
                    padding: '0 0.5em',
                    borderRadius: '0.25em',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 'bold',
                    color: '#113',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
      {
        width: imageWidth,
        height: imageHeight,
      },
    );

    // 2. Convert the ImageResponse to an ArrayBuffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Use sharp to convert the PNG buffer to JPEG
    const jpegBuffer = await sharp(buffer)
      .jpeg({ quality: 85 }) // Adjust quality as needed (0-100)
      .toBuffer();

    return jpegBuffer;
  } catch (error) {
    const errorMessage = getErrorText(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    // eslint-disable-next-line no-console
    console.error('[renderTopicOpengraphImage]', 'Failed to generate opengraph image', {
      errorMessage,
      errorStack,
      error,
      topicId,
      locale,
      baseUrl,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
