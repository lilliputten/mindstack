'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

interface TProps {
  title?: string;
  className?: string;
  contentClassName?: string;
  isInactive?: boolean;
  children?: React.ReactNode;
}

export function SuccessSplash({
  title,
  children,
  className,
  contentClassName = 'content-text',
  isInactive,
}: TProps) {
  return (
    <div
      className={cn(
        isDev && '__SuccessSplash', // DEBUG
        'inset-0 flex flex-col items-center justify-center gap-4 transition',
        'my-2 transition',
        // 'bg-background',
        isInactive && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <Icons.CheckCircle className="mt-2 size-12 text-green-500" />
      <div className="content-truncate flex flex-col gap-4 text-center">
        {title && <h3 className="text-xl font-semibold text-green-500">{title}</h3>}
        {children && <div className={contentClassName}>{children}</div>}
      </div>
    </div>
  );
}
