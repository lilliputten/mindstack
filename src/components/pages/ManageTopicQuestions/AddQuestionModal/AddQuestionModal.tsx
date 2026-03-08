'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { isDev } from '@/constants';
import { useDocumentTitle, useMediaQuery } from '@/hooks';

import { AddQuestionForm, TAddQuestionFormProps, TFormData } from './AddQuestionForm';

interface TProps
  extends Pick<
    TAddQuestionFormProps,
    'onClose' | 'isPending' | 'goToAddedQuestion' | 'closeImmediatelly'
  > {
  className?: string;
  isVisible: boolean;
  onDone: (fromData: TFormData) => void;
}

export function AddQuestionModal(props: TProps) {
  const { className, isVisible, onClose, onDone, isPending, goToAddedQuestion, closeImmediatelly } =
    props;

  const t = useT();

  const { isMobile } = useMediaQuery();

  useDocumentTitle(t('AddQuestionModal.ModalTitle'));

  const handleAddQuestion = React.useCallback(
    (formData: TFormData) => {
      onDone(formData);
      return Promise.resolve();
    },
    [onDone],
  );

  return (
    <Modal
      isVisible={isVisible}
      hideModal={onClose}
      className={cn(
        isDev && '__AddQuestionModal', // DEBUG
        'flex flex-col gap-0 text-theme-foreground',
        !isMobile && 'max-h-[90%]',
        isPending && '[&>*]:pointer-events-none [&>*]:opacity-50',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__AddQuestionModal_Header', // DEBUG
          !isMobile && 'max-h-[90vh]',
          'flex flex-col border-b bg-theme px-6 py-4 text-theme-foreground',
        )}
      >
        <DialogTitle className="DialogTitle">{t('AddQuestionModal.DialogTitle')}</DialogTitle>
        <DialogDescription aria-hidden="true" hidden>
          {t('AddQuestionModal.DialogDescription')}
        </DialogDescription>
      </div>
      <ScrollArea
        className={cn(
          isDev && '__AddQuestionModal_Scroll', // DEBUG
        )}
      >
        <AddQuestionForm
          handleAddQuestion={handleAddQuestion}
          className="flex flex-col p-6 text-foreground"
          onClose={onClose}
          isPending={isPending}
          goToAddedQuestion={goToAddedQuestion}
          closeImmediatelly={closeImmediatelly}
        />
      </ScrollArea>
    </Modal>
  );
}
