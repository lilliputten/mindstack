'use server';

import { del } from '@vercel/blob';

export async function deleteCategoryImage(imageUrl: string | null | undefined) {
  // Only delete if it's a blob URL (not external URLs)
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('.vercel-storage.com')) {
    try {
      await del(imageUrl);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[deleteCategoryImage] Error deleting image:', error);
      // Don't throw error for image deletion failures - the category can still be deleted
    }
  }

  return { success: true };
}
