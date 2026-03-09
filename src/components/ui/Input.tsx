import * as React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  uiSize?: 'default' | 'sm';
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, uiSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          isDev && '__Input', // DEBUG
          'flex',
          'rounded-md border border-input',
          'bg-background/50',
          'h-10 px-3 py-2',
          uiSize === 'sm' && 'h-8 px-2 py-1 text-sm',
          'ring-offset-background',
          'file:border-0',
          'file:bg-transparent',
          'file:font-medium',
          'placeholder:text-foreground/10',
          'transition',
          'hover:ring-2 hover:ring-theme-500/50',
          'focus-visible:bg-background',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-ring',
          'focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          'disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
