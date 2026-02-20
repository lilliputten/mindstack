'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared';
import { isDev } from '@/config';

interface TProps {
  title?: string;
  className?: string;
  isInactive?: boolean;
  children?: React.ReactNode;
}

export function ErrorSplash({ title, children, className, isInactive }: TProps) {
  return (
    <div
      className={cn(
        isDev && '__ErrorSplash', // DEBUG
        'inset-0 flex flex-col items-center justify-center gap-4 transition',
        'my-2 bg-background transition',
        isInactive && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <Icons.Warning className="mt-2 size-12 text-red-500" />
      <div className="flex flex-col gap-4 text-center">
        {title && <h3 className="text-xl font-semibold text-red-500">{title}</h3>}
        {children && <div className="content-text">{children}</div>}
      </div>
    </div>
  );
}
