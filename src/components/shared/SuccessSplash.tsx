'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

interface SuccessSplashProps {
  title: string;
  className?: string;
  isInactive?: boolean;
  children?: React.ReactNode;
}

export function SuccessSplash({ title, children, className, isInactive }: SuccessSplashProps) {
  return (
    <div
      className={cn(
        isDev && '__SuccessSplash', // DEBUG
        'inset-0 flex flex-col items-center justify-center gap-4 transition',
        'my-2 bg-background transition',
        isInactive && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <Icons.CheckCircle className="mt-2 size-16 text-green-500" />
      <div className="flex flex-col gap-4 text-center">
        <h3 className="text-xl font-semibold text-green-500">{title}</h3>
        <p className="content-text">{children}</p>
      </div>
    </div>
  );
}
