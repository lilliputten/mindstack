'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export default function DeleteTopicModalLoading() {
  const pathname = usePathname();

  // Only show loading skeleton if we're on the delete route
  if (pathname?.endsWith('/delete')) {
    // Import and return the actual loading component only when needed
    return (
      <GenericSkeleton
        className={cn(
          isDev && '__DeleteTopicModalLoading', // DEBUG
        )}
      />
    );
  }

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
