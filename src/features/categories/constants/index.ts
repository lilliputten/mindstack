import { blobBodySizeLimitMb, minuteMs } from '@/constants';

// Category image constants

/** Maximum category image size (in pixels, it'll be downscaled on the server) */
export const categoryImageSizePixels = 300;

/** Quality setting for image optimization (0-100) */
export const categoryImageQuality = 80;

/** Category image file size limit in bytes */
export const categoryImageSizeBytesLimit = blobBodySizeLimitMb * 1024 * 1024; // Physical image file size limit

// NOTE: There is a NVercel Blob default limit to 1MB
// Uncaught Exception: Error: Body exceeded 1 MB limit.
// To configure the body size limit for Server Actions, see: https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit

/** Allowed MIME types for category images */
export const categoryImageAllowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
export type TCategoryImageAllowedTypes = (typeof categoryImageAllowedTypes)[number];

export const categoryImageAllowedTypesString = 'JPEG, PNG, WebP, GIF';

/** Allow to suggest categories once in a period */
export const allowSuggestCategoriesIn = 30 * minuteMs;
