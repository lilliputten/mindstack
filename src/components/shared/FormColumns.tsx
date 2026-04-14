import React from 'react';

import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

export function FormColumns({ children, className }: TPropsWithChildrenAndClassName) {
  return (
    <div
      className={cn(
        isDev && '__FormColumns', // DEBUG
        'flex w-full flex-col gap-6 md:flex-row',
        className,
      )}
    >
      {children}
    </div>
  );
}
