'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

interface ToggleContainerProps {
  debugId?: string;
  children: React.ReactNode;
  activeIndex: number;
  className?: string;
  buttonWidth: number;
}

export function ToggleContainer({
  debugId,
  children,
  activeIndex,
  className,
  buttonWidth = 28,
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
        className={cn(
          'absolute top-1 h-9 rounded-md bg-theme transition-transform duration-200',
          'w-[calc(50%-4px)]',
          `translate-x-${buttonWidth * activeIndex}`,
        )}
      />
    </div>
  );
}
