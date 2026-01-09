import * as React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

import { TGenericIcon } from './IconTypes';

type EmptyPlaceholderProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  framed?: boolean;
};

export function EmptyPlaceholder({
  padded = true,
  framed = true,
  className,
  children,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        isDev && '__EmptyPlaceholder', // DEBUG
        // 'flex flex-1 items-center justify-center text-center shadow-sm animate-in fade-in-50',
        'flex flex-1 items-center justify-center rounded-lg border border-dashed text-center shadow-sm animate-in fade-in-50',
        padded && 'p-6',
        framed && 'rounded-lg border border-dashed',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          isDev && '__EmptyPlaceholder_Container', // DEBUG
          'overflow_hidden w-full',
          // 'flex max-w-[420px] flex-col items-center text-center',
          'flex flex-col items-center gap-4 text-center',
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface EmptyPlaceholderIconProps /*extends Partial<React.SVGProps<SVGSVGElement>>*/ {
  icon: TGenericIcon;
  className?: string;
  iconClassName?: string;
  ref?: ((instance: SVGSVGElement | null) => void) | React.RefObject<SVGSVGElement> | null;
}

EmptyPlaceholder.Icon = function EmptyPlaceholderIcon({
  icon: Icon,
  className,
  iconClassName,
  ...props
}: EmptyPlaceholderIconProps) {
  if (!Icon) {
    return null;
  }
  return (
    <div
      className={cn(
        isDev && '__EmptyPlaceholder_Icon', // DEBUG
        'flex size-20 items-center justify-center rounded-full bg-muted',
        // 'bg-error-stripes flex size-20 items-center justify-center rounded-full text-white',
        className,
      )}
    >
      <Icon className={cn('size-10', iconClassName)} {...props} />
    </div>
  );
};

type EmptyPlaceholderTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({
  className,
  ...props
}: EmptyPlaceholderTitleProps) {
  return (
    <h3
      className={cn(
        isDev && '__EmptyPlaceholder_Title', // DEBUG
        'mt-5 font-heading text-2xl font-bold',
        className,
      )}
      {...props}
    />
  );
};

type EmptyPlaceholderDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlaceholderDescriptionProps) {
  return (
    <p
      className={cn(
        isDev && '__EmptyPlaceholder_Description', // DEBUG
        'mb-5 mt-1.5 text-center text-sm font-normal leading-6 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
