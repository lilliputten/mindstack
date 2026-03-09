import * as React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/constants';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<
  HTMLInputElement,
  InputProps & { type?: React.HTMLInputTypeAttribute; className?: string }
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        isDev && '__Input', // DEBUG
        'flex',
        'h-10',
        // 'w-full',
        'rounded-md',
        'border',
        'border-input',
        // 'bg-transparent',
        'bg-background/50',
        'px-3',
        'py-2',
        'ring-offset-background',
        'file:border-0',
        'file:bg-transparent',
        // 'file:text-sm',
        'file:font-medium',
        'placeholder:text-foreground/10',
        'transition',
        // 'hover:bg-background',
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
});
Input.displayName = 'Input';

export { Input };
