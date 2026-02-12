import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplash, BusySplashWithInfo, ErrorSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TNewQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { PreviewQuestions } from '@/widgets/questions';

export interface TProps {
  handleClose?: () => void;
  startOverCallback?: () => void;
  className?: string;
  error?: string;
  isSaving?: boolean;
  topicId: TTopicId; // Is it required here?
  generatedQuestions?: TNewQuestion[];
  saveQuestions: () => unknown;
}

export function EditScreen(props: TProps) {
  const {
    className,
    handleClose,
    startOverCallback,
    // topicId,
    error,
    isSaving,
    generatedQuestions,
    saveQuestions,
  } = props;
  const [isLeaving, setLeaving] = React.useState(false);
  const t = useT();

  const isBusy = isLeaving || isSaving;

  const onClose = (ev: React.MouseEvent) => {
    setLeaving(true);
    if (handleClose) {
      handleClose();
    }
    ev.preventDefault();
  };

  return (
    <div
      className={cn(
        isDev && '__EditScreen', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      {
        /* Is saving */ isSaving ? (
          <BusySplashWithInfo
            title={t('GenerateQuestionsModal.SavingQuestionsTitle')}
            className="px-6"
          >
            <span className="content-truncate">
              {t('GenerateQuestionsModal.QuestionsAreSavingNow')}
            </span>
          </BusySplashWithInfo>
        ) : /* Error */ error || !generatedQuestions ? (
          <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
            <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
            <span className="text-red-500">
              {error || t('GenerateQuestionsModal.NoQuestionsHasBeenSaved')}
            </span>
          </div>
        ) : !generatedQuestions?.length ? (
          <ErrorSplash className="px-6" title={t('GenerateQuestionsModal.QuestionsToEditTitle')} />
        ) : (
          <div className="conent-truncate mb-2 flex flex-col gap-4 px-6">
            <h3 className="content-truncate text-center text-lg font-semibold text-theme">
              {t('GenerateQuestionsModal.EditQuestionsCount', {
                generatedQuestionsCount: generatedQuestions.length,
              })}
            </h3>
            {/* Display preview of the added questions */}
            <PreviewQuestions
              questions={generatedQuestions}
              className="content-truncate flex flex-col gap-2 text-sm"
            />
          </div>
        )
      }

      {/* Actions */}
      <div
        className={cn(
          isDev && '__EditScreen_Actions', // DEBUG
          'content-truncate flex w-full flex-wrap gap-2',
          'justify-center',
        )}
      >
        {/* Options for generated questions... */}
        {!isSaving && !!generatedQuestions?.length && (
          <>
            {/* Option 1: saveQuestions */}
            <Button
              className="content-truncate flex gap-2"
              onClick={() => {
                setLeaving(true);
                saveQuestions();
              }}
              variant={!isLeaving ? 'theme' : 'ghost'}
              disabled={isBusy}
            >
              <Icons.Save className="size-4 shrink-0" />
              <span className="truncate">{t('GenerateQuestionsModal.SaveQuestions')}</span>
            </Button>
          </>
        )}

        {/* Return to the form */}
        {startOverCallback && (
          <Button variant="ghost" onClick={startOverCallback} className="content-truncate gap-2">
            <Icons.ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{t('GenerateQuestionsModal.StartOver')}</span>
          </Button>
        )}
        {/* Close */}
        <Button variant="ghost" onClick={onClose} className="content-truncate gap-2">
          <Icons.Close className="size-4 shrink-0" />
          <span className="truncate">{isSaving ? t('Cancel') : t('Close')}</span>
        </Button>
      </div>

      {/* LoadingSplash */}
      <BusySplash
        className={cn(
          isDev && '__EditScreen_LoadingSplash', // DEBUG
        )}
        isBusy={isBusy && !isSaving}
      />
    </div>
  );
}
