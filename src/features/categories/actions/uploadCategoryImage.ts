'use server';

import { put } from '@vercel/blob';
import { getTranslations } from 'next-intl/server';
import sharp from 'sharp';

import { nFormatter } from '@/lib/helpers/strings';
import { getCurrentUser } from '@/lib/session';

import {
  categoryImageAllowedTypes,
  categoryImageConfig,
  categoryImageSizeLimit,
} from '../constants';

export type TUploadCategoryImageResult = Awaited<ReturnType<typeof uploadCategoryImage>>;

export async function uploadCategoryImage(formData: FormData) {
  const t = await getTranslations('errors');

  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    const isAdmin = user?.role === 'ADMIN';

    if (!userId) {
      throw new Error(t('authError'));
    }

    if (!isAdmin) {
      throw new Error(t('accessDenied'));
    }

    const file = formData.get('image') as File;

    if (!file) {
      throw new Error('No image file provided');
    }

    // Validate file size
    if (file.size > categoryImageSizeLimit) {
      const formattedSizeLimit = nFormatter(categoryImageSizeLimit);
      throw new Error(`Image size must be less than ${formattedSizeLimit}B`);
    }

    // Validate file type
    if (
      !categoryImageAllowedTypes.includes(file.type as (typeof categoryImageAllowedTypes)[number])
    ) {
      throw new Error('Invalid image type. Allowed types: JPEG, PNG, WebP, GIF');
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image with sharp
    const optimizedBuffer = await sharp(buffer)
      .resize({
        width: categoryImageConfig.maxWidth,
        height: categoryImageConfig.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: categoryImageConfig.quality })
      .toBuffer();

    // Upload to Vercel Blob
    const { url } = await put(file.name, optimizedBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    return {
      success: true,
      data: { url },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[uploadCategoryImage] Error:', error);
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
