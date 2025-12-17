'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

interface ToggleContainerProps {
  debugId?: string;
  children: React.ReactNode;
  activeIndex: number;
  className?: string;
  buttonWidthEm: number;
}

export function ToggleContainer({
  debugId,
  children,
  activeIndex,
  className,
  buttonWidthEm = 8,
}: ToggleContainerProps) {
  return (
    <div
      className={cn(
        isDev && ['__ToggleContainer', debugId].filter(Boolean).join('_'), // DEBUG
        'relative inline-flex rounded-lg bg-theme/10 p-1',
        className,
      )}
    >
      {children}
      <div
        data-active-index={activeIndex}
        style={
          {
            '--translate-x': `${buttonWidthEm * activeIndex}em`,
          } as React.CSSProperties
        }
        className={cn(
          'absolute top-1 h-9 rounded-md bg-theme transition-transform duration-200',
          'w-[calc(50%-4px)]',
          'translate-x-[var(--translate-x)]',
        )}
      />
    </div>
  );
}
