import React from 'react';

import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

export function FormSection({ children, className }: TPropsWithChildrenAndClassName) {
  return (
    <div
      className={cn(
        isDev && '__FormSection', // DEBUG
        'flex w-full flex-1 flex-col gap-6 py-2 md:w-[45%]',
        className,
      )}
    >
      {children}
    </div>
  );
}
