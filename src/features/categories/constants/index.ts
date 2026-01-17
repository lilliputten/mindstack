// Category image constants

import { minuteMs } from '@/constants';

/** Category image optimization settings */
export const categoryImageConfig = {
  /** Maximum category image size (in pixels) */
  size: 300,
  /** Quality setting for image optimization (0-100) */
  quality: 80,
} as const;

/** Category image file size limit in bytes */
export const categoryImageSizeLimit = 500 * 1024; // 500KB

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
