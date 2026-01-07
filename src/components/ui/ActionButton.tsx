'use client';

import React from 'react';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button, ButtonProps, buttonVariants } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { IconProps, TGenericIcon } from '@/components/shared/IconTypes';
import { TRoutePath } from '@/config';
import { Link } from '@/i18n/routing';

export interface TActionItem extends Omit<ButtonProps, 'content'> {
  id: string;
  content?: TReactNode;
  pending?: boolean;
  hidden?: boolean;
  onClick?: () => void;
  href?: string;
  icon?: TGenericIcon;
  iconProps?: IconProps;
}

export function ActionButton(props: TActionItem) {
  const {
    id,
    pending,
    disabled,
    variant: buttonVariant = 'ghost',
    icon,
    content: textContent,
    iconProps = {},
    onClick,
    href,
    className: buttonClassName,
    ...restButtonProps
  } = props;
  const { className: iconClassName, ...restIconProps } = iconProps;
  const Icon = pending ? Icons.Spinner : icon;
  const isDisabled = pending || disabled;
  const isIcon = restButtonProps.size === 'icon';
  const buttonContent = (
    <>
      {Icon && (
        <Icon
          className={cn(
            isIcon ? 'size-5' : 'size-4 opacity-50',
            pending && 'animate-spin',
            iconClassName,
          )}
          {...restIconProps}
        />
      )}
      {textContent && !isIcon && <span className="flex flex-1 truncate">{textContent}</span>}
    </>
  );
  const variant = isDisabled ? 'ghost' : buttonVariant;
  const className = cn('flex gap-2', buttonClassName);
  if (href) {
    return (
      <Link
        id={id}
        href={href as TRoutePath}
        className={cn(buttonVariants({ variant, ...restButtonProps }), className)}
      >
        {buttonContent}
      </Link>
    );
  }
  return (
    <Button
      id={id}
      className={className}
      onClick={onClick}
      disabled={isDisabled}
      variant={variant}
      {...restButtonProps}
    >
      {buttonContent}
    </Button>
  );
}
