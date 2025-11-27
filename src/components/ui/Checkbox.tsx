'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

import { TGenericIcon } from '../shared/IconTypes';

type TRoot = typeof CheckboxPrimitive.Root;

const Checkbox = React.forwardRef<
  React.ElementRef<TRoot>,
  React.ComponentPropsWithoutRef<TRoot> & {
    icon?: TGenericIcon;
    indicatorClassName?: string;
  }
>((allProps, ref) => {
  const { className, icon: Icon = Check, indicatorClassName, ...props } = allProps;
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        isDev && '__Checkbox', // DEBUG
        'peer',
        'size-4',
        'shrink-0',
        'rounded-sm',
        'border',
        'border-input',
        'ring-offset-background',
        'hover:ring-2 hover:ring-theme-500/50',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
        'data-[state=checked]:border-theme', // Original checkbox styling
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          isDev && '__Checkbox_Indicator', // DEBUG
          'flex',
          'items-center',
          'justify-center',
          'text-theme', // Original checkbox styling
          indicatorClassName,
        )}
      >
        <Icon className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
