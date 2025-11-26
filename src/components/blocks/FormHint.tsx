import React from 'react';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isDev } from '@/config';

interface FormHintProps extends TPropsWithClassName {
  children?: React.ReactNode;
}

export function FormHint({ children, className }: FormHintProps) {
  if (!children) {
    return null;
  }
  return (
    <div
      className={cn(
        isDev && '__FormHint', // DEBUG
        'relative text-sm opacity-50',
        className,
      )}
    >
      {children}
    </div>
  );
}
