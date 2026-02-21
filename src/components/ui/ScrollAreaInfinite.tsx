import React from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

interface TScrollAreaInfiniteProps extends React.ComponentProps<typeof ScrollArea> {
  className?: string; // Already defined in `ScrollArea`
  containerClassName?: string;
  // Fetch params...
  /** Data to control update event hadlers */
  effectorData: unknown;
  fetchNextPage: () => Promise<unknown>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}

export function ScrollAreaInfinite(props: TScrollAreaInfiniteProps) {
  const {
    children,
    className,
    containerClassName,
    // Fetch params...
    effectorData,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    // Rest params...
    ...rest
  } = props;

  // Infinite scroll support...
  const scrollNodeRef = React.useRef<HTMLDivElement>(null);
  const containerNodeRef = React.useRef<HTMLDivElement>(null);

  const checkIfScrolledToTheEnd = React.useCallback(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage || typeof window === 'undefined') {
      return;
    }
    const scrollNode = scrollNodeRef.current;
    const containerNode = containerNodeRef.current;
    if (!scrollNode || !containerNode) {
      return;
    }
    const scrollBottom = scrollNode.getBoundingClientRect().bottom;
    const containerBottom = containerNode.getBoundingClientRect().bottom;
    // TODO: Use parameters/constants
    const extraGap = window.innerHeight / 2;
    const scrollIsPossible = containerBottom <= scrollBottom + extraGap;
    if (scrollIsPossible) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isLoading, isFetchingNextPage]);

  React.useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIfScrolledToTheEnd);
      window.addEventListener('orientationchange', checkIfScrolledToTheEnd);
      return () => {
        window.removeEventListener('resize', checkIfScrolledToTheEnd);
        window.removeEventListener('orientationchange', checkIfScrolledToTheEnd);
      };
    }
  }, [checkIfScrolledToTheEnd]);

  React.useLayoutEffect(() => {
    checkIfScrolledToTheEnd();
  }, [effectorData, checkIfScrolledToTheEnd]);

  return (
    <ScrollArea
      {...rest}
      ref={scrollNodeRef}
      onScrollEvent={checkIfScrolledToTheEnd}
      className={cn(
        isDev && '__ScrollAreaInfinite', // DEBUG
        className,
      )}
    >
      <div
        ref={containerNodeRef}
        className={cn(
          isDev && '__ScrollAreaInfinite_Container', // DEBUG
          containerClassName,
        )}
      >
        {children}
        {hasNextPage && (
          <div
            className={cn(
              isDev && '__ScrollAreaInfinite_Spinner', // DEBUG
              'pointer-events-none flex w-full items-center justify-center p-2 opacity-25 transition',
              !isFetchingNextPage && 'opacity-0',
            )}
          >
            <Icons.Spinner className={cn('size-6', isFetchingNextPage && 'animate-spin')} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
