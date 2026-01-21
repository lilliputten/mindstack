'use client';

import React from 'react';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import * as Icons from '@/components/shared/Icons';
import { TGenericIcon } from '@/components/shared/IconTypes';
import { isDev } from '@/constants';

export interface TConfirmFormProps {
  handleConfirm: () => unknown;
  handleClose?: () => void;
  className?: string;
  actionsClassName?: string;
  isPending?: boolean;
  isDone?: boolean;
  children?: TReactNode;
  confirmButtonVariant?: React.ComponentProps<typeof Button>['variant'];
  cancelButtonVariant?: React.ComponentProps<typeof Button>['variant'];
  confirmButtonText?: string;
  confirmButtonBusyText?: string;
  confirmButtonIcon?: TGenericIcon;
  cancelButtonText?: string;
}

export function ConfirmForm(props: TConfirmFormProps) {
  const {
    children,
    className,
    actionsClassName,
    handleConfirm,
    handleClose,
    isPending,
    isDone,
    confirmButtonVariant = 'theme',
    cancelButtonVariant = 'ghost',
    confirmButtonText = 'Ok',
    confirmButtonBusyText,
    confirmButtonIcon = Icons.Check,
    cancelButtonText = 'Cancel',
  } = props;

  const onClose = (ev: React.MouseEvent) => {
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  const Icon = isPending ? Icons.Spinner : confirmButtonIcon;
  const buttonText =
    !isPending || !confirmButtonBusyText ? confirmButtonText : confirmButtonBusyText;

  return (
    <div
      className={cn(
        isDev && '__ConfirmForm', // DEBUG
        'flex w-full flex-col gap-6',
        className,
      )}
    >
      {children}
      {/* Actions */}
      <div
        className={cn(
          isDev && '__ConfirmForm_Actions', // DEBUG
          'flex w-full flex-wrap gap-4',
          actionsClassName,
        )}
      >
        {!isDone && (
          <Button
            type="submit"
            variant={confirmButtonVariant}
            className="text-truncate gap-2"
            onClick={handleConfirm}
          >
            <Icon className={cn('size-4', isPending && 'animate-spin')} />{' '}
            <span className="truncate">{buttonText}</span>
          </Button>
        )}
        <Button variant={cancelButtonVariant} onClick={onClose} className="text-truncate gap-2">
          <Icons.Close className="size-4" />
          <span className="truncate">{cancelButtonText}</span>
        </Button>
      </div>
    </div>
  );
}
