'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

interface TProps {
  title?: string;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  isBusy?: boolean;
  children?: React.ReactNode;
}

export function BusySplashWithInfo({
  title,
  children,
  className,
  titleClassName,
  contentClassName,

  isBusy = true,
}: TProps) {
  return (
    <div
      className={cn(
        isDev && '__BusySplashWithInfo', // DEBUG
        'inset-0 flex flex-col items-center justify-center gap-4 transition',
        'duration-1000',
        !isBusy && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <Icons.Spinner className="mt-2 size-12 animate-spin text-theme-500/50" />
      <div className="flex flex-col gap-4 text-center">
        {title && <h3 className={cn('text-base font-semibold', titleClassName)}>{title}</h3>}
        {children && <div className={cn('content-text', contentClassName)}>{children}</div>}
      </div>
    </div>
  );
}
