'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    values?: number[];
    indicatorClassNames?: string[];
  }
>(({ className, value, values, indicatorClassName, indicatorClassNames, ...props }, ref) => {
  const valuesList = values || [value || 0];
  const indicatorClassNamesList = indicatorClassNames || [indicatorClassName || 0];
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        isDev && '__Progress', // DEBUG
        'relative flex h-4 w-full overflow-hidden rounded-full bg-secondary',
        className,
      )}
      {...props}
    >
      {valuesList.map((value, idx) => (
        <ProgressPrimitive.Indicator
          key={String(idx)}
          className={cn(
            isDev && '__Progress_Indicator', // DEBUG
            'h-full bg-theme transition-all',
            indicatorClassName !== indicatorClassNamesList[idx] && indicatorClassName,
            indicatorClassNamesList[idx],
          )}
          style={{
            width: `${value || 0}%`,
          }}
        />
      ))}
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
