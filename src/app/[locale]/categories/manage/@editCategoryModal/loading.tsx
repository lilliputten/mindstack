'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev, manageCategoriesRoute } from '@/config';

export default function EditCategoryModalLoading() {
  const pathname = usePathname();

  // Check if we're on an edit route (contains an ID)
  const checkPath = '/edit';
  if (pathname?.endsWith(checkPath)) {
    const prevChunk = pathname.substring(0, pathname.length - checkPath.length);
    // Check if the previous path ends with manageCategoriesRoute
    if (prevChunk.endsWith(manageCategoriesRoute)) {
      // Import and return the actual loading component only when needed
      return (
        <GenericSkeleton
          className={cn(
            isDev && '__ManageCategoriesListSkeleton_editCategoryModal', // DEBUG
          )}
        />
      );
    }
  }

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
