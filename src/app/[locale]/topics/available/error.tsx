'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { availableTopicsRoute } from '@/config';
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

  const goToTopicsRoot = React.useCallback(() => {
    const { href } = window.location;
    router.push(availableTopicsRoute);
    setTimeout(() => {
      // If still on the same page after trying to go back, fallback to a hard reload
      if (document.visibilityState === 'visible' && href === window.location.href) {
        window.location.href = availableTopicsRoute;
      }
    }, 200);
  }, [router]);

  const extraActions = (
    <>
      <Button onClick={goToTopicsRoot} className="flex gap-2">
        <Icons.Topics className="size-4" />
        <span>Available topics</span>
      </Button>
    </>
  );

  return (
    <PageError
      className={cn(
        isDev && '__topics_error', // DEBUG
      )}
      error={error}
      reset={reset}
      extraActions={extraActions}
    />
  );
}
