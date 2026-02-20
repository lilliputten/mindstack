import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplashWithInfo, ErrorSplash, Icons } from '@/components/shared';
import { isDev } from '@/constants';
import { TNewQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';
import { PreviewQuestions } from '@/widgets/questions';

export interface TProps {
  startOverCallback?: () => void;
  className?: string;
  isSaving?: boolean;
  topicId: TTopicId; // Is it required here?
  generatedQuestions?: TNewQuestion[];
  saveQuestions: () => unknown;
  handleCancel?: () => void;
}

export function EditScreen(props: TProps) {
  const {
    className,
    startOverCallback,
    // topicId,
    isSaving,
    generatedQuestions,
    saveQuestions,
    handleCancel,
  } = props;
  const t = useT();

  const CancelIcon = isSaving ? Icons.X : Icons.Undo2;

  return (
    <div
      className={cn(
        isDev && '__EditScreen', // DEBUG
        'flex w-full flex-col gap-6',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__EditScreen_Wrapper', // DEBUG
          'relative transition',
        )}
      >
        <div
          className={cn(
            isDev && '__EditScreen_WrapperContent', // DEBUG
            'flex w-full flex-col justify-center gap-4',
            'min-h-24',
            isSaving && 'opacity-20',
          )}
        >
          {!generatedQuestions?.length ? (
            <ErrorSplash className="px-6" title={t('GenerateQuestionsModal.NoQuestionsToEdit')} />
          ) : (
            <div className="conent-truncate flex flex-col gap-4">
              <h3 className="content-truncate text-xl font-semibold text-theme">
                {t('GenerateQuestionsModal.EditQuestionsCount', {
                  count: generatedQuestions.length,
                })}
                :
              </h3>
              {/* Display preview of the added questions */}
              <PreviewQuestions
                questions={generatedQuestions}
                className="content-truncate flex flex-col gap-2 text-sm"
              />
            </div>
          )}
        </div>
        {/* Generating splash */}
        <BusySplashWithInfo
          title={t('GenerateQuestionsModal.SavingQuestions')}
          className={cn(
            isDev && '__EditScreen_BusySplash', // DEBUG
            'absolute',
          )}
          isBusy={isSaving}
        />
      </div>

      {/* Actions */}
      <div
        className={cn(
          isDev && '__EditScreen_Actions', // DEBUG
          'content-truncate flex w-full flex-wrap gap-2',
        )}
      >
        {/* Options for generated questions... */}
        {!isSaving && !!generatedQuestions?.length && (
          <>
            {/* Option 1: saveQuestions */}
            <Button
              className="content-truncate flex gap-2"
              onClick={() => {
                saveQuestions();
              }}
              variant={!isSaving ? 'success' : 'ghost'}
              disabled={isSaving}
            >
              <Icons.Save className="size-4 shrink-0" />
              <span className="truncate">{t('GenerateQuestionsModal.SaveQuestions')}</span>
            </Button>
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
