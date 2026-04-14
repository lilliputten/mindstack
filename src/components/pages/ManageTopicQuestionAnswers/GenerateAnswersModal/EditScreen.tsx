import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { BusySplashWithInfo, ErrorSplash, InfoFrame } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TSaveDataParams } from '@/entities/HeadlessEditor/useHeadlessEditorState';
import { AnswersEditorCore } from '@/features/answers/components/AnswersEditor/AnswersEditorCore';
import { TNewOrOldAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';

export interface TEditScreenProps {
  startOverCallback?: () => void;
  className?: string;
  isReady?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  topicId: TTopicId;
  questionId: TQuestionId;
  answers?: TNewOrOldAnswer[];
  handleCancel?: () => void;
  /** Callback to save data via parent component */
  saveData?: (saveParams: TSaveDataParams<TNewOrOldAnswer>) => Promise<TNewOrOldAnswer[]>;
  reloadAnswers?: () => void;
  setHasAnswersChanged: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditScreen(props: TEditScreenProps) {
  const {
    className,
    startOverCallback,
    isReady,
    isLoading,
    isSaving,
    answers,
    handleCancel,
    saveData,
    topicId,
    questionId,
    reloadAnswers,
    setHasAnswersChanged,
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
          'relative',
        )}
      >
        <div
          className={cn(
            isDev && '__EditScreen_WrapperContent', // DEBUG
            'flex w-full flex-col justify-center gap-4 transition',
            isSaving && 'opacity-50',
          )}
        >
          {!answers?.length ? (
            <ErrorSplash className="px-6" title={t('GenerateAnswersModal.NoAnswersToEdit')} />
          ) : (
            <div className={cn('conent-truncate flex flex-col gap-4')}>
              <InfoFrame className="items-start gap-2">
                <Icons.Info className="my-1 size-4 shrink-0 text-theme-500 opacity-50" />
                <MarkdownText>{t('GenerateAnswersModal.EditHelpMarkdownText')}</MarkdownText>
              </InfoFrame>
              <AnswersEditorCore
                topicId={topicId}
                questionId={questionId}
                answers={answers}
                saveData={saveData}
                reloadData={reloadAnswers}
                calculateChanges
                setHeadlessEditorState={(state) => setHasAnswersChanged(state.hasChanges)}
                isReady={isReady}
                isLoading={isLoading}
                // isSaving={isSaving}
              />
            </div>
          )}
        </div>
        {/* Saving splash */}
        <BusySplashWithInfo
          title={t('GenerateAnswersModal.SavingAnswers')}
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
