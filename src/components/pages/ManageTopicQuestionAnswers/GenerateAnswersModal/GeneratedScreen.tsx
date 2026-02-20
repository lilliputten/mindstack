import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplashWithInfo, ErrorSplash, Icons } from '@/components/shared';
import { isDev } from '@/constants';
import { TNewAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';
import { PreviewAnswers } from '@/widgets/answers';

export interface TGeneratedScreenProps {
  startOverCallback?: () => void;
  handleCancel?: () => void;
  className?: string;
  topicId: TTopicId; // Is it required here?
  questionId: TQuestionId; // Is it required here?
  isSaving?: boolean;
  generatedAnswers?: TNewAnswer[];
  saveAnswers?: () => unknown;
  editAnswers?: () => unknown;
}

export function GeneratedScreen(props: TGeneratedScreenProps) {
  const {
    className,
    handleCancel,
    startOverCallback,
    isSaving,
    generatedAnswers,
    editAnswers,
    saveAnswers,
  } = props;
  const t = useT();

  const CancelIcon = isSaving ? Icons.X : Icons.Undo2;

  return (
    <div
      className={cn(
        isDev && '__GeneratedScreen', // DEBUG
        'flex w-full flex-col gap-6',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__GeneratedScreen_Wrapper', // DEBUG
          'relative transition',
        )}
      >
        <div
          className={cn(
            isDev && '__GeneratedScreen_WrapperContent', // DEBUG
            'flex w-full flex-col justify-center gap-4',
            'min-h-24',
            isSaving && 'opacity-20',
          )}
        >
          {!generatedAnswers?.length ? (
            <ErrorSplash className="px-6" title={t('GenerateAnswersModal.NoAnswersGenerated')} />
          ) : (
            <div className="conent-truncate flex flex-col gap-4">
              <h3 className="content-truncate flex items-center gap-4 text-xl font-semibold text-theme">
                <Icons.WandSparkles className="shring-0 size-8 text-green-500" />
                <span className="content-truncate flex-1">
                  {t('GenerateAnswersModal.GeneratedAnswersCount', {
                    count: generatedAnswers.length,
                  })}
                  :
                </span>
              </h3>
              {/* Display preview of the added answers */}
              <PreviewAnswers
                answers={generatedAnswers}
                className="content-truncate flex w-full flex-col gap-2 overflow-hidden text-sm"
              />
            </div>
          )}
        </div>
        {/* Generating splash */}
        <BusySplashWithInfo
          title={t('GenerateAnswersModal.SavingAnswers')}
          className={cn(
            isDev && '__GeneratedScreen_BusySplash', // DEBUG
            'absolute',
          )}
          isBusy={isSaving}
        />
      </div>

      {/* Actions */}
      <div
        className={cn(
          isDev && '__GeneratedScreen_Actions', // DEBUG
          'content-truncate flex w-full flex-wrap gap-2',
        )}
      >
        {/* Options for generated answers... */}
        {!isSaving && !!generatedAnswers?.length && (
          <>
            {
              /* Option 1: saveAnswers */ !!saveAnswers && (
                <Button
                  className="content-truncate flex gap-2"
                  onClick={() => {
                    saveAnswers();
                  }}
                  variant={!isSaving ? 'success' : 'ghost'}
                  disabled={isSaving}
                >
                  <Icons.Save className="size-4 shrink-0" />
                  <span className="truncate">{t('Save')}</span>
                </Button>
              )
            }
            {
              /* Option 2: editAnswers */ !!editAnswers && (
                <Button
                  className="content-truncate flex gap-2"
                  onClick={() => {
                    editAnswers();
                  }}
                  variant={!isSaving ? 'theme' : 'ghost'}
                  disabled={isSaving}
                >
                  <Icons.Edit className="size-4 shrink-0" />
                  <span className="truncate">{t('GenerateAnswersModal.EditTheData')}</span>
                </Button>
              )
            }
          </>
        )}

        {/* Return to the form */}
        {!isSaving && startOverCallback && (
          <Button variant="ghost" onClick={startOverCallback} className="content-truncate gap-2">
            <CancelIcon className="size-4 shrink-0" />
            <span className="truncate">{isSaving ? t('Cancel') : t('StartOver')}</span>
          </Button>
        )}
        {isSaving && handleCancel && (
          <Button
            variant="ghost"
            onClick={(ev) => {
              ev.preventDefault();
              handleCancel();
            }}
            className="content-truncate gap-2"
          >
            <Icons.Close className="size-4 shrink-0" />
            <span className="truncate">{t('Cancel')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
