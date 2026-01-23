'use client';

import { TPropsWithClassName } from '@/lib/types/react';
import { cn } from '@/lib/utils';
import { isDev } from '@/config';

export interface TSidebarBlockProps extends TPropsWithClassName {
  onPrimary?: boolean;
  onSidebar?: boolean;
  align?: 'center' | 'end' | 'start';
  onClickEffect?: () => void;
}

export function SidebarWrapper(props: TSidebarBlockProps & { children: React.ReactNode }) {
  const { className, children } = props;
  return (
    <div
      className={cn(
        isDev && '__SidebarWrapper', // DEBUG
        'flex w-full flex-col gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarMenuItem(
  props: TSidebarBlockProps & {
    // onSelect?: (event: Event) => void;
    onSelect?: (ev: React.MouseEvent) => void;
    children: React.ReactNode;
    asChild?: boolean;
    disabled?: boolean;
  },
) {
  const { className, children, onSelect, disabled } = props;
  return (
    <div
      className={cn(
        isDev && '__SidebarMenuItem', // DEBUG
        disabled && 'pointer-events-none opacity-50',
        'rounded-sm px-2 py-1.5',
        'text-white hover:bg-white hover:text-theme-700',
        className,
      )}
      onClick={onSelect}
    >
      {children}
    </div>
  );
}
