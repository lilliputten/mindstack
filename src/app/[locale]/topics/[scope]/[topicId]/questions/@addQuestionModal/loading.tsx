'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export default function AddQuestionModalLoading() {
  const pathname = usePathname();

  // Only show loading skeleton if we're on the add route
  if (pathname?.endsWith('/add')) {
    // Import and return the actual loading component only when needed
    return (
      <GenericSkeleton
        className={cn(
          isDev && '__AddQuestionModalLoading', // DEBUG
        )}
      />
    );
  }

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
