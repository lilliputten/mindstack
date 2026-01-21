'use server';

import { put } from '@vercel/blob';
import sharp from 'sharp';

import { getErrorText, nFormatter } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';
import { getT } from '@/i18n';

import {
  categoryImageAllowedTypes,
  categoryImageAllowedTypesString,
  categoryImageQuality,
  categoryImageSizeBytesLimit,
  categoryImageSizePixels,
} from '../constants';

export type TUploadCategoryImageResult = Awaited<ReturnType<typeof uploadCategoryImage>>;

export async function uploadCategoryImage(formData: FormData) {
  try {
    const t = await getT();
    const user = await getCurrentUser();
    const userId = user?.id;
    // const isAdmin = user?.role === 'ADMIN';

    // Allow images upload only for athorized users
    if (!userId) {
      throw new Error(t('AuthenticationError'));
    }

    const file = formData.get('image') as File;

    if (!file) {
      throw new Error(t('UploadCategoryImage.NoImageFileProvidedError'));
    }

    // Validate file size
    if (file.size > categoryImageSizeBytesLimit) {
      const formattedSizeLimit = nFormatter(categoryImageSizeBytesLimit);
      throw new Error(
        t('UploadCategoryImage.ImageSizeLimitError', { sizeLimit: `${formattedSizeLimit}B` }),
      );
    }

    // Validate file type
    if (
      !categoryImageAllowedTypes.includes(file.type as (typeof categoryImageAllowedTypes)[number])
    ) {
      throw new Error(
        t('UploadCategoryImage.InvalidImageTypeError', {
          allowedTypes: categoryImageAllowedTypesString,
        }),
      );
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
