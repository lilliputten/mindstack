import * as React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

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
        isDev && '__ErrorPlaceHolder', // DEBUG
        'flex flex-1 items-center justify-center rounded-lg border border-dashed p-8 text-center shadow-sm animate-in fade-in-50',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          isDev && '__ErrorPlaceHolder_Container', // DEBUG
          'flex flex-col items-center gap-4 text-center',
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
          isDev && '__ErrorPlaceHolderIcon', // DEBUG
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
  return (
    <h3
      className={cn(
        isDev && '__ErrorPlaceHolderTitle', // DEBUG
        'font-heading text-2xl font-bold',
        className,
      )}
      {...props}
    />
  );
};

type ErrorPlaceHolderDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

ErrorPlaceHolder.Description = function ErrorPlaceHolderDescription({
  className,
  ...props
}: ErrorPlaceHolderDescriptionProps) {
  return (
    <p
      className={cn(
        isDev && '__ErrorPlaceHolderDescription', // DEBUG
        'text-center font-normal leading-6',
        className,
      )}
      {...props}
    />
  );
};
