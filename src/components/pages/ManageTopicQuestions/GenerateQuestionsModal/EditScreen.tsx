import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { BusySplashWithInfo, ErrorSplash } from '@/components/shared';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { TSaveDataParams } from '@/entities/HeadlessEditor';
import { QuestionsEditorCore } from '@/features/questions/components/QuestionsEditor';
import { TNewOrOldQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics/types';

export interface TEditScreenProps {
  startOverCallback?: () => void;
  className?: string;
  isSaving?: boolean;
  topicId: TTopicId;
  questions?: TNewOrOldQuestion[];
  handleCancel?: () => void;
  saveData?: (saveParams: TSaveDataParams<TNewOrOldQuestion>) => Promise<TNewOrOldQuestion[]>;
  reloadQuestions?: () => void;
}

export function EditScreen(props: TEditScreenProps) {
  const {
    className,
    startOverCallback,
    isSaving = false,
    questions,
    handleCancel,
    saveData,
    topicId,
    reloadQuestions,
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
          {!questions?.length ? (
            <ErrorSplash className="px-6" title={t('GenerateQuestionsModal.NoQuestionsToEdit')} />
          ) : (
            <div className="conent-truncate flex flex-col gap-4">
              <div className="conent-truncate flex gap-4">
                <Icons.Info className="size-8 shrink-0 text-theme-500" />
                <MarkdownText>{t('GenerateQuestionsModal.EditHelpMarkdownText')}</MarkdownText>
              </div>
              <QuestionsEditorCore
                topicId={topicId}
                questions={questions}
                saveData={saveData}
                reloadData={reloadQuestions}
              />
            </div>
          )}
        </div>
        {/* Saving splash */}
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
