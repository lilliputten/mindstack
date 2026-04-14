'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & { size?: 'default' | 'sm' }
>(({ className, size, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      isDev && '__Label', // DEBUG
      labelVariants(),
      size === 'sm' && 'text-xs',
      className,
    )}
    // className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
