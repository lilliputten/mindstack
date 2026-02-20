'use client';

import React from 'react';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { Button, ButtonProps } from '@/components/ui/Button';
import { Icons } from '@/components/shared';
import { IconProps, TGenericIcon } from '@/components/shared/IconTypes';
import { isDev, TRoutePath } from '@/config';

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
    className: passedButtonClassName,
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
      {textContent && !isIcon && <span className="max-w-50 truncate">{textContent}</span>}
    </>
  );
  const variant = isDisabled ? 'ghost' : buttonVariant;
  const buttonClassName = cn(
    'flex justify-start items-center gap-2 truncate',
    passedButtonClassName,
  );
  if (href) {
    return (
      <Button
        id={id}
        className={cn(
          isDev && '__ActionButton_WithLink', // DEBUG
          buttonClassName,
        )}
        onClick={onClick}
        disabled={isDisabled}
        variant={variant}
        {...restButtonProps}
      >
        <Link
          id={id}
          href={href as TRoutePath}
          className={cn(
            isDev && '__ActionButton_Link', // DEBUG
            buttonClassName,
          )}
        >
          {buttonContent}
        </Link>
      </Button>
    );
  }
  return (
    <Button
      id={id}
      className={cn(
        isDev && '__ActionButton_Only', // DEBUG
        buttonClassName,
      )}
      onClick={onClick}
      disabled={isDisabled}
      variant={variant}
      {...restButtonProps}
    >
      {buttonContent}
    </Button>
  );
}
