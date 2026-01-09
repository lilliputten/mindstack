'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export default function SelectLanguageModalLoading() {
  const pathname = usePathname();

  // Only show loading skeleton if we're on the select-language route
  if (pathname?.endsWith('/select-language')) {
    // Import and return the actual loading component only when needed
    return (
      <GenericSkeleton
        className={cn(
          isDev && '__SelectLanguageModalLoading', // DEBUG
        )}
      />
    );
  }

  // Return null when not on the active route to prevent skeleton from showing
  return null;
}
