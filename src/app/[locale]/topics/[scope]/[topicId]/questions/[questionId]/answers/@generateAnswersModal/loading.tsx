'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export default function GenerateAnswersModalLoading() {
  const pathname = usePathname();

  // Only show loading skeleton if we're on the generate route
  if (pathname?.endsWith('/generate')) {
    // Import and return the actual loading component only when needed
    return (
      <GenericSkeleton
        className={cn(
          isDev && '__GenerateAnswersModalLoading', // DEBUG
        )}
      />
    );
  }

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
