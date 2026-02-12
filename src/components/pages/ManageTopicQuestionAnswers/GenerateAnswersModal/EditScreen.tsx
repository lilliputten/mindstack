import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplash, BusySplashWithInfo, ErrorSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TNewAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { PreviewAnswers } from '@/widgets/answers';

export interface TProps {
  handleClose?: () => void;
  startOverCallback?: () => void;
  className?: string;
  questionId: TQuestionId; // Is it required here?
  error?: string;
  isSaving?: boolean;
  generatedAnswers?: TNewAnswer[];
  saveAnswers: () => unknown;
}

export function EditScreen(props: TProps) {
  const {
    className,
    handleClose,
    startOverCallback,
    // questionId,
    error,
    isSaving,
    generatedAnswers,
    saveAnswers,
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
          <BusySplashWithInfo title={t('GenerateAnswersModal.SavingAnswersTitle')} className="px-6">
            <span className="content-truncate">
              {t('GenerateAnswersModal.AnswersAreSavingNow')}
            </span>
          </BusySplashWithInfo>
        ) : /* Error */ error || !generatedAnswers ? (
          <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
            <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
            <span className="text-red-500">
              {error || t('GenerateAnswersModal.NoAnswersHasBeenSaved')}
            </span>
          </div>
        ) : !generatedAnswers?.length ? (
          <ErrorSplash className="px-6" title={t('GenerateAnswersModal.AnswersToEditTitle')} />
        ) : (
          <div className="conent-truncate mb-2 flex flex-col gap-4 px-6">
            <h3 className="content-truncate text-center text-lg font-semibold text-theme">
              {t('GenerateAnswersModal.EditAnswersCount', {
                generatedAnswersCount: generatedAnswers.length,
              })}
            </h3>
            {/* Display preview of the added answers */}
            <PreviewAnswers
              answers={generatedAnswers}
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
        {/* Options for generated answers... */}
        {!isSaving && !!generatedAnswers?.length && (
          <>
            {/* Option 1: saveAnswers */}
            <Button
              className="content-truncate flex gap-2"
              onClick={() => {
                setLeaving(true);
                saveAnswers();
              }}
              variant={!isLeaving ? 'theme' : 'ghost'}
              disabled={isBusy}
            >
              <Icons.Save className="size-4 shrink-0" />
              <span className="truncate">{t('GenerateAnswersModal.SaveAnswers')}</span>
            </Button>
          </>
        )}

        {/* Return to the form */}
        {startOverCallback && (
          <Button variant="ghost" onClick={startOverCallback} className="content-truncate gap-2">
            <Icons.ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{t('GenerateAnswersModal.StartOver')}</span>
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
