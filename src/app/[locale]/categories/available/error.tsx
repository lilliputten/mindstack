'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/shared';
import { PageError } from '@/components/shared/PageError';
import { availableCategoriesRoute } from '@/config';
import { isDev } from '@/constants';

// Error boundaries must be Client Components
// @see https://nextjs.org/docs/app/getting-started/error-handling

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const goToCategoriesRoot = React.useCallback(() => {
    const { href } = window.location;
    router.push(availableCategoriesRoute);
    setTimeout(() => {
      // If still on the same page after trying to go back, fallback to a hard reload
      if (document.visibilityState === 'visible' && href === window.location.href) {
        window.location.href = availableCategoriesRoute;
      }
    }, 200);
  }, [router]);

  const extraActions = (
    <>
      <Button onClick={goToCategoriesRoot} className="flex gap-2">
        <Icons.Categories className="size-4" />
        <span>Available categories</span>
      </Button>
    </>
  );

  return (
    <PageError
      className={cn(
        isDev && '__categories_error', // DEBUG
      )}
      error={error}
      reset={reset}
      extraActions={extraActions}
    />
  );
}
