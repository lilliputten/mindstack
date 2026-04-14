'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

interface TProps {
  className?: string;
  children: React.ReactNode;
  noFrame?: boolean;
}

export function InfoFrame(props: TProps) {
  const { className, noFrame, children } = props;
  const showFrame = !noFrame;

  return (
    <div
      className={cn(
        isDev && '__InfoFrame', // DEBUG
        'flex items-center gap-4 gap-y-1',
        'content-truncate rounded-md text-sm',
        showFrame && 'border',
        showFrame && 'border-theme-600/5',
        showFrame && 'bg-theme-600/5',
        showFrame && 'p-3',
        showFrame && 'py-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
