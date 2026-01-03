import * as React from 'react';

import { cn } from '@/lib/utils';

import { TGenericIcon } from './IconTypes';

type ErrorPlaceHolderProps = React.HTMLAttributes<HTMLDivElement>;

export function ErrorPlaceHolder({
  className,
  containerClassName,
  children,
  ...props
}: ErrorPlaceHolderProps & { containerClassName?: string }) {
  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-center rounded-lg border border-dashed p-8 text-center shadow-sm animate-in fade-in-50',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-6 text-center',
          // 'max-w-[420px]',
          containerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ErrorPlaceHolderIconProps {
  /*extends IconProps*/ /*extends Partial<React.SVGProps<SVGSVGElement>>*/ icon: TGenericIcon;
  className?: string;
  iconClassName?: string;
  ref?: ((instance: SVGSVGElement | null) => void) | React.RefObject<SVGSVGElement> | null;
}

ErrorPlaceHolder.Icon = function ErrorPlaceHolderIcon({
  icon: Icon,
  className,
  iconClassName,
  ...props
}: ErrorPlaceHolderIconProps) {
  if (Icon) {
    return (
      <div
        className={cn(
          'bg-error-stripes flex size-20 items-center justify-center rounded-full text-white',
          className,
        )}
      >
        <Icon className={cn('size-10', iconClassName)} {...props} />
      </div>
    );
  }
};

type ErrorPlaceHolderTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

ErrorPlaceHolder.Title = function ErrorPlaceHolderTitle({
  className,
  ...props
}: ErrorPlaceHolderTitleProps) {
  return <h3 className={cn('mt-2 font-heading text-2xl font-bold', className)} {...props} />;
};

type ErrorPlaceHolderDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

ErrorPlaceHolder.Description = function ErrorPlaceHolderDescription({
  className,
  ...props
}: ErrorPlaceHolderDescriptionProps) {
  return (
    <p
      className={cn(
        'mb-5 mt-1.5 text-center text-sm font-normal leading-6 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
