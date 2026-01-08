// Category image constants

/** Category image optimization settings */
export const categoryImageConfig = {
  /** Maximum width for category image */
  maxWidth: 300,
  /** Maximum height for category image */
  maxHeight: 300,
  /** Quality setting for image optimization (0-100) */
  quality: 80,
} as const;

/** Category image file size limit in bytes (5MB) */
export const categoryImageSizeLimit = 5 * 1024 * 1024;

/** Allowed MIME types for category images */
export const categoryImageAllowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
