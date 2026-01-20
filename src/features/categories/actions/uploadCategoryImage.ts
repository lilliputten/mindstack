'use server';

import { put } from '@vercel/blob';
import sharp from 'sharp';

import { getErrorText, nFormatter } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';

import {
  categoryImageAllowedTypes,
  categoryImageQuality,
  categoryImageSizeBytesLimit,
  categoryImageSizePixels,
} from '../constants';

export type TUploadCategoryImageResult = Awaited<ReturnType<typeof uploadCategoryImage>>;

export async function uploadCategoryImage(formData: FormData) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    const isAdmin = user?.role === 'ADMIN';

    if (!userId) {
      throw new Error('Authentication error');
    }

    if (!isAdmin) {
      throw new Error('Access denied');
    }

    const file = formData.get('image') as File;

    if (!file) {
      throw new Error('No image file provided');
    }

    // Validate file size
    if (file.size > categoryImageSizeBytesLimit) {
      const formattedSizeLimit = nFormatter(categoryImageSizeBytesLimit);
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
        width: categoryImageSizePixels,
        height: categoryImageSizePixels,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: categoryImageQuality })
      .toBuffer();

    // Upload to Vercel Blob
    const result = await put(file.name, optimizedBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });
    const { url } = result;

    return {
      success: true,
      data: { url },
    };
  } catch (error) {
    const details = getErrorText(error);
    // eslint-disable-next-line no-console
    console.error('[uploadCategoryImage]', details, {
      error,
    });
    debugger; // eslint-disable-line no-debugger
    throw error;
  }
}
