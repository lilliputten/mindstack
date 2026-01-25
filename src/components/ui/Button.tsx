import * as React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  cn(
    'inline-flex',
    'items-center',
    'justify-center',
    'text-sm',
    'font-medium',
    'focus-visible:outline-none',
    // 'focus-visible:ring-2',
    // 'focus-visible:ring-ring',
    // 'focus-visible:ring-offset-2',
    'disabled:opacity-30',
    'disabled:cursor-default',
    'disabled:pointer-events-none',
    // 'ring-offset-background',
    'select-none',
    'transition',
  ),
  {
    variants: {
      variant: {
        default: '__default bg-theme text-theme-foreground hover:bg-theme/90',
        primary: 'bg-primary text-primary-foreground hover:bg-primary-600',
        theme: 'bg-theme text-theme-foreground hover:bg-theme-600',
        temeInverted: 'bg-white text-theme-600 hover:bg-theme-200 hover:text-theme-700',
        destructive: 'bg-destructive hover:opacity-90 text-destructive-foreground',
        success: 'bg-success hover:opacity-90 text-success-foreground',
        outline: 'border border-input hover:bg-theme/20', // hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'hover:bg-theme/20 active:bg-theme active:text-theme-foreground',
        ghostForm: cn(
          'border',
          'border-input',
          'bg-background/50',
          'ring-offset-background',
          'hover:bg-theme/20',
          'hover:ring-2 hover:ring-theme-500/50',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-ring',
          'focus:ring-offset-2',
          'active:bg-theme active:text-theme-foreground',
        ),
        // ghostBlue: 'hover:bg-blue-300/20 hover:text-accent-foreground active:bg-blue-500',
        // ghostDark: 'hover:bg-black/20 hover:text-accent-foreground',
        // ghostGray: 'hover:bg-gray-500/15 hover:text-accent-foreground',
        // ghostOnPrimary: 'text-primary-foreground hover:bg-primary-600/50',
        ghostOnTheme: 'text-theme hover:bg-theme-600/50',
        link: 'text-theme underline-offset-4 hover:underline',
        disabled: 'cursor-default border border-input bg-transparent text-foreground opacity-30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10 [&>svg]:m-auto',
        iconSm: 'size-8 [&>svg]:m-auto',
      },
      rounded: {
        default: 'rounded-md',
        sm: 'rounded-sm',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export type TButtonVariants = React.ComponentProps<typeof Button>['variant'];
