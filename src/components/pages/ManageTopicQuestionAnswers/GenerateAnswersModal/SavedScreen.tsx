import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplash, BusySplashWithInfo, SuccessSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TAvailableAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { PreviewAnswers } from '@/widgets/answers';

export interface TProps {
  handleClose?: () => void;
  startOverCallback?: () => void;
  className?: string;
  questionId: TQuestionId; // Is it required here?
  error?: string;
  isSaving?: boolean;
  savedAnswers?: TAvailableAnswer[];
}

export function SavedScreen(props: TProps) {
  const {
    className,
    handleClose,
    startOverCallback,
    // questionId,
    error,
    isSaving,
    savedAnswers,
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
        isDev && '__SavedScreen', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      {
        /* Is adding */ isSaving ? (
          <BusySplashWithInfo title={t('GenerateAnswersModal.SavingAnswersTitle')} className="px-6">
            {/* <span className="content-truncate">{t('GenerateAnswersModal.SavingAnswersInfo')}</span> */}
          </BusySplashWithInfo>
        ) : /* Error */ error || !savedAnswers ? (
          <div className="flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/20 p-3 py-2 text-sm">
            <Icons.Warning className="mr-1 size-4 text-red-500 opacity-50" />
            <span className="text-red-500">
              {error || t('GenerateAnswersModal.NoAnswersHasBeenSaved')}
            </span>
          </div>
        ) : (
          <SuccessSplash
            title={t('GenerateAnswersModal.AnswersAlreadySavedTitle')}
            className="px-6"
            contentClassName="conent-truncate flex flex-col gap-4"
          >
            <h3 className="content-truncate text-lg font-semibold text-theme">
              {t('GenerateAnswersModal.SavedAnswersCount', {
                savedAnswersCount: savedAnswers.length,
              })}
            </h3>
            {/* Display preview of the added answers */}
            <PreviewAnswers
              answers={savedAnswers}
              className="content-truncate flex flex-col gap-2 text-sm"
            />
          </SuccessSplash>
        )
      }

      {/* Actions */}
      <div
        className={cn(
          isDev && '__SavedScreen_Actions', // DEBUG
          'content-truncate flex w-full flex-wrap gap-2',
          'justify-center',
        )}
      >
        {/* Return to the form */}
        {startOverCallback && (
          <Button variant="ghost" onClick={startOverCallback} className="content-truncate gap-2">
            <Icons.ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{t('GenerateAnswersModal.StartOver')}</span>
          </Button>
        )}
        {/* Close */}
        <Button
          variant={isSaving ? 'ghost' : 'theme'}
          onClick={onClose}
          className="content-truncate gap-2"
        >
          <Icons.Close className="size-4 shrink-0" />
          <span className="truncate">{isSaving ? t('Cancel') : t('Close')}</span>
        </Button>
      </div>

      {/* LoadingSplash */}
      <BusySplash
        className={cn(
          isDev && '__SavedScreen_LoadingSplash', // DEBUG
        )}
        isBusy={isBusy && !isSaving}
      />
    </div>
  );
}
