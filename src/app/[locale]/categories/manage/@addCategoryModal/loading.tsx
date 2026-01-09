'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev, manageCategoriesRoute } from '@/config';

export default function AddCategoryModalLoading() {
  const pathname = usePathname();

  // Only show loading skeleton if we're on the add route
  const checkPath = '/add';
  if (pathname?.endsWith(checkPath)) {
    const prevChunk = pathname.substring(0, pathname.length - checkPath.length);
    // Check if the previous path ends with manageCategoriesRoute
    if (prevChunk.endsWith(manageCategoriesRoute)) {
      // Import and return the actual loading component only when needed
      return (
        <GenericSkeleton
          className={cn(
            isDev && '__ManageCategoriesListSkeleton_addCategoryModal', // DEBUG
          )}
        />
      );
    }
  }

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
