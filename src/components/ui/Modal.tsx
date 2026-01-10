'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { Drawer } from 'vaul';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { isDev } from '@/constants';
import { useMediaQuery } from '@/hooks';

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  isVisible?: boolean;
  // NOTE: It's possible to use any of these forms: toggleModal or hideModal (it will only close action from inside the modal component)
  hideModal?: () => void;
  toggleModal?: React.Dispatch<React.SetStateAction<boolean>>;
  // toggleModal?: (v: boolean) => void; // toggleModal?: Dispatch<SetStateAction<boolean>>;
  desktopOnly?: boolean;
  preventDefaultClose?: boolean;
  title?: string;
  hiddenTitle?: boolean;
  description?: string;
}

export function Modal({
  children,
  className,
  isVisible,
  toggleModal,
  hideModal,
  desktopOnly,
  preventDefaultClose,
  title,
  hiddenTitle,
  description,
}: ModalProps) {
  const t = useT();
  const closeModal = ({ dragged }: { dragged?: boolean } = {}) => {
    if (preventDefaultClose && !dragged) {
      return;
    }
    // fire hideModal event if provided
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    hideModal && hideModal();

    // if toggleModal is defined, use it to close modal
    if (toggleModal) {
      toggleModal(false);
    }
  };
  const { isMobile } = useMediaQuery();

  if (isMobile && !desktopOnly) {
    return (
      <Drawer.Root
        open={hideModal || toggleModal ? isVisible : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal({ dragged: true });
          }
        }}
      >
        <Drawer.Overlay
          className={cn(
            'bg-black/30', // Dark background (should be synced in both dialog and modal)
            'fixed inset-0 z-40 backdrop-blur-sm',
          )}
        />
        <Drawer.Portal>
          <Drawer.Content
            className={cn(
              isDev && '__modal_Drawer_Content',
              'fixed',
              'inset-x-0',
              'inset-y-0',
              'z-50 overflow-hidden',
              'border bg-background',
              className,
            )}
          >
            {children}
            <DialogPrimitive.Close
              data-id="close"
              title={t('Close')}
              className={cn(
                'absolute',
                'right-4',
                'top-4',
                'rounded-sm',
                'opacity-70',
                'ring-offset-background',
                'transition-opacity',
                'hover:opacity-100',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-ring',
                'focus:ring-offset-2',
                'disabled:pointer-events-none',
                // 'data-[state=open]:bg-accent',
                // 'data-[state=open]:text-muted-foreground',
              )}
            >
              <X className="size-4" />
              <span className="sr-only">{t('Close')}</span>
            </DialogPrimitive.Close>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  const titleNode = <DialogTitle>{title}</DialogTitle>;
  const showTitle = !hiddenTitle && !!title;
  const descriptionNode = <DialogDescription>{description}</DialogDescription>;

  return (
    <Dialog
      open={hideModal || toggleModal ? isVisible : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          isDev && '__DialogContent',
          'overflow-hidden p-0 md:rounded-2xl md:border',
          // 'md:max-w-md',
          className,
        )}
      >
        {showTitle && titleNode}
        <VisuallyHidden>
          {!showTitle && titleNode}
          {descriptionNode}
        </VisuallyHidden>
        {children}
      </DialogContent>
    </Dialog>
  );
}
