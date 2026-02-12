import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplash, BusySplashWithInfo, ErrorSplash, SuccessSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TNewQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { PreviewQuestions } from '@/widgets/questions';

export interface TProps {
  handleClose?: () => void;
  backToForm?: () => void;
  className?: string;
  topicId: TTopicId; // Is it required here?
  error?: string;
  isGenerating?: boolean;
  generatedQuestions?: TNewQuestion[];
  saveQuestions?: () => unknown;
  editQuestions?: () => unknown;
}

export function GeneratedScreen(props: TProps) {
  const {
    className,
    handleClose,
    backToForm,
    // topicId,
    error,
    isGenerating,
    generatedQuestions,
    saveQuestions,
    editQuestions,
  } = props;
  const [isLeaving, setLeaving] = React.useState(false);
  const t = useT();

  const isBusy = isLeaving || isGenerating;

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
        isDev && '__GeneratedScreen', // DEBUG
        'flex w-full flex-col gap-4',
        className,
      )}
    >
      {
        /* Is generating */ isGenerating ? (
          <BusySplashWithInfo
            title={t('GenerateQuestionsModal.GeneratingQuestions')}
            className="px-6"
          >
            <span className="content-truncate">
              {t('GenerateQuestionsModal.GeneratingQuestionsInfo')}
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
          <ErrorSplash className="px-6" title={t('GenerateQuestionsModal.NoQuestionsGenerated')} />
        ) : (
          <SuccessSplash
            title={t('GenerateQuestionsModal.QuestionsAlreadyGeneratedTitle')}
            className="px-6"
            contentClassName="conent-truncate flex flex-col gap-4"
          >
            <h3 className="content-truncate text-lg font-semibold text-theme">
              {t('GenerateQuestionsModal.GeneratedQuestionsCount', {
                generatedQuestionsCount: generatedQuestions.length,
              })}
            </h3>
            {/* Display preview of the added questions */}
            <PreviewQuestions
              questions={generatedQuestions}
              className="content-truncate flex flex-col gap-2 text-sm"
            />
          </SuccessSplash>
        )
      }

      {/* Actions */}
      <div
        className={cn(
          isDev && '__GeneratedScreen_Actions', // DEBUG
          'content-truncate flex w-full flex-wrap gap-2',
          'justify-center',
        )}
      >
        {/* Options for generated questions... */}
        {!isGenerating && !!generatedQuestions?.length && (
          <>
            {
              /* Option 1: saveQuestions */ !!saveQuestions && (
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
              )
            }
            {
              /* Option 2: editQuestions */ !!editQuestions && (
                <Button
                  className="content-truncate flex gap-2"
                  onClick={() => {
                    setLeaving(true);
                    editQuestions();
                  }}
                  variant={!isLeaving ? 'theme' : 'ghost'}
                  disabled={isBusy}
                >
                  <Icons.Edit className="size-4 shrink-0" />
                  <span className="truncate">{t('GenerateQuestionsModal.EditTheData')}</span>
                </Button>
              )
            }
          </>
        )}

        {/* Return to the form */}
        {backToForm && (
          <Button variant="ghost" onClick={backToForm} className="content-truncate gap-2">
            <Icons.ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{t('GenerateQuestionsModal.BackToForm')}</span>
          </Button>
        )}
        {/* Close */}
        <Button variant="ghost" onClick={onClose} className="content-truncate gap-2">
          <Icons.Close className="size-4 shrink-0" />
          <span className="truncate">{isGenerating ? t('Cancel') : t('Close')}</span>
        </Button>
      </div>

      {/* LoadingSplash */}
      <BusySplash
        className={cn(
          isDev && '__GeneratedScreen_LoadingSplash', // DEBUG
        )}
        isBusy={isBusy && !isGenerating}
      />
    </div>
  );
}
