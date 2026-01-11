'use client';

import React from 'react';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { isDev } from '@/constants';
import { useMediaQuery } from '@/hooks';

import { ConfirmForm, TConfirmFormProps } from './ConfirmForm';

interface TConfirmModalProps
  extends Pick<
    TConfirmFormProps,
    | 'actionsClassName'
    | 'confirmButtonVariant'
    | 'confirmButtonText'
    | 'confirmButtonBusyText'
    | 'cancelButtonText'
    | 'confirmButtonIcon'
    | 'cancelButtonVariant'
    | 'actionsClassName'
    | 'handleConfirm'
    | 'handleClose'
    | 'isPending'
    | 'isDone'
  > {
  children?: TReactNode;
  className?: string;
  dialogDescription?: TReactNode;
  dialogTitle: TReactNode;
  isVisible: boolean;
}

export function ConfirmModal(props: TConfirmModalProps) {
  const {
    children,
    className,
    actionsClassName,
    dialogDescription,
    dialogTitle,
    handleClose,
    handleConfirm,
    isPending,
    isDone,
    isVisible,
    confirmButtonVariant,
    confirmButtonText,
    confirmButtonBusyText,
    confirmButtonIcon,
    cancelButtonText,
    cancelButtonVariant,
  } = props;
  const { isMobile } = useMediaQuery();

  return (
    <Modal
      isVisible={isVisible}
      hideModal={handleClose}
      className={cn(
        isDev && '__ConfirmModal', // DEBUG
        'pb-4 text-theme-foreground',
        // '[&_button[data-id=close]]:text-theme-foreground', // Example: reaching & customizing the nested close button
        isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__ConfirmModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-6 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle
          className={cn(
            isDev && '__ConfirmModal_DialogTitle', // DEBUG
            'truncate',
          )}
        >
          {dialogTitle}
        </DialogTitle>
        <DialogDescription className="sr-only" aria-hidden="true" hidden>
          {dialogDescription}
        </DialogDescription>
      </div>
      <ConfirmForm
        className={cn(
          isDev && '__ConfirmModal_Form', // DEBUG
          'flex flex-col p-6 text-foreground',
        )}
        actionsClassName={actionsClassName}
        handleConfirm={handleConfirm}
        handleClose={handleClose}
        isPending={isPending}
        isDone={isDone}
        confirmButtonVariant={confirmButtonVariant}
        confirmButtonText={confirmButtonText}
        confirmButtonBusyText={confirmButtonBusyText}
        confirmButtonIcon={confirmButtonIcon}
        cancelButtonText={cancelButtonText}
        cancelButtonVariant={cancelButtonVariant}
      >
        {children}
      </ConfirmForm>
    </Modal>
  );
}
