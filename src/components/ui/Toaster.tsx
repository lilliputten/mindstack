'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

import { cn } from '@/lib/utils';

import { Spinner } from '../shared/Icons';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="group"
      toastOptions={{
        // closeButton: false,
        classNames: {
          toast: cn(
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg',
            // '[&[data-type="loading"]>[data-close-button="true"]]:hidden', // Hide close buttons for 'loading' toasts, as they can't handle `onDismiss` actions
            // '[&[data-type]>[data-cancel="true"]]:hidden', // [&[data-type="loading"]>[data-cancel="true"]]:block', // Hide cancel buttons for 'non-loading' toasts
          ),
          description: 'group-[.toast]:text-muted-foreground',
          // actionButton: 'group-[.toast]:bg-theme group-[.toast]:text-theme-foreground',
          // cancelButton: 'bg-red-500',
          // closeButton: 'flex [&[data-type="loading"]]:flex',
          loading: 'animate-spin',
        },
      }}
      icons={{
        loading: <Spinner className="size-4 animate-spin opacity-50" />,
      }}
      {...props}
    />
  );
};
