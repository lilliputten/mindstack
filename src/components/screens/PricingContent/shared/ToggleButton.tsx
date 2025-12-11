'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

interface ToggleButtonProps {
  debugId?: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  buttonWidth: number;
}

export function ToggleButton({
  debugId,
  children,
  isActive,
  onClick,
  className,
  buttonWidth = 28,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        isDev && ['__ToggleButton', debugId].filter(Boolean).join('_'), // DEBUG
        'relative z-10 px-6 py-2 text-sm font-medium transition-colors',
        'flex items-center justify-center',
        'rounded-md',
        'hover:bg-theme-600/10',
        `w-${buttonWidth}`,
        isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
