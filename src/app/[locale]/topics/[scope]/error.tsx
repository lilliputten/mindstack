'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';
import { useManageTopicsStore } from '@/stores/ManageTopicsStoreProvider';

// Error boundaries must be Client Components
// @see https://nextjs.org/docs/app/getting-started/error-handling

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { manageScope } = useManageTopicsStore();
  const routePath = `/topics/${manageScope}`;
  const router = useRouter();

  const goToTopicsRoot = React.useCallback(() => {
    const { href } = window.location;
    router.push(routePath);
    setTimeout(() => {
      // If still on the same page after trying to go back, fallback to a hard reload
      if (document.visibilityState === 'visible' && href === window.location.href) {
        window.location.href = routePath;
      }
    }, 200);
  }, [router, routePath]);

  const extraActions = (
    <>
      {routePath && (
        <>
          <Button onClick={goToTopicsRoot} className="flex gap-2">
            <Icons.Topics className="size-4" />
            <span>To the topics list</span>
          </Button>
          {/*
          <Link href={routePath} className={cn(buttonVariants({ variant: 'default' }), 'flex gap-2')}>
            <Icons.Topics className="size-4" />
            <span>To the topics list</span>
          </Link>
          */}
        </>
      )}
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
