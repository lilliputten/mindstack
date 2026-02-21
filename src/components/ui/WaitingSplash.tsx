'use client';

import React from 'react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';

interface TWaitingSplashProps {
  show?: boolean;
  theme?: string;
  className?: string;
}

export function WaitingSplash(props: TWaitingSplashProps) {
  const { show, theme: userTheme, className } = props;
  const hidden = !show;
  const { resolvedTheme } = useTheme();
  const theme = userTheme != undefined ? userTheme : resolvedTheme;
  const isLight = theme !== 'dark';
  return (
    <div
      className={cn(
        isDev && '__WaitingSplash', // DEBUG
        isDev && (hidden ? '__WaitingSplash_Hidden' : '__WaitingSplash_Visible'), // DEBUG
        'absolute',
        'inset-0',
        'flex',
        'flex-col',
        'items-center',
        'content-center',
        'justify-center',
        'transition',
        'duration-1000',
        hidden && 'pointer-events-none opacity-0',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__WaitingSplash_Backdrop', // DEBUG
          'absolute',
          'inset-0',
          'opacity-80',
          isLight ? 'bg-background-light' : 'bg-background-dark',
        )}
      />
      <Icons.Spinner
        className={cn(
          isDev && '__WaitingSplash_Spinner', // DEBUG
          'size-8',
          'animate-spin',
        )}
        // color={isLight ? foreground-lightColor : foreground-darkColor} // XXX: Use theme color?
      />
    </div>
  );
}
