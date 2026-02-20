import React from 'react';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplash, Icons } from '@/components/shared';
import { TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TAvailableAnswer } from '@/features/answers/types';
import { TQuestionId } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';
import { PreviewAnswers } from '@/widgets/answers';

export interface TSavedScreenProps {
  scope: TTopicsManageScopeId;
  topicId: TTopicId; // Is it required here?
  questionId: TQuestionId; // Is it required here?
  startOverCallback?: () => void;
  className?: string;
  savedAnswers: TAvailableAnswer[];
}

export function SavedScreen(props: TSavedScreenProps) {
  const { className, scope, topicId, startOverCallback, savedAnswers, questionId } = props;
  const [isLeaving, setLeaving] = React.useState(false);
  const t = useT();

  const topicsListRoutePath = `/topics/${scope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;
  const questionRoutePath = `${questionsListRoutePath}/${questionId}`;
  const answersListRoutePath = `${questionRoutePath}/answers`;

  return (
    <div
      className={cn(
        isDev && '__SavedScreen', // DEBUG
        'flex w-full flex-col gap-6',
        isLeaving && 'disabled',
        className,
      )}
    >
      <div className="conent-truncate flex flex-col gap-4">
        <h3 className="content-truncate flex items-center gap-4 text-xl font-semibold text-theme">
          {t('GenerateAnswersModal.SavedAnswersCount', {
            count: savedAnswers.length,
          })}
          :
        </h3>
        {/* Display preview of the added answers */}
        <PreviewAnswers
          answers={savedAnswers}
          className="content-truncate flex flex-col gap-2 text-sm"
        />
      </div>

      {/* Actions */}
      <div
        className={cn(
          isDev && '__SavedScreen_Actions', // DEBUG
          'content-truncate flex w-full flex-wrap gap-2',
        )}
      >
        {
          /* Option 1: saveAnswers */ true && (
            <Button
              className="content-truncate flex gap-2"
              onClick={() => {
                setLeaving(true);
              }}
              variant={!isLeaving ? 'success' : 'ghost'}
              disabled={isLeaving}
            >
              <Link
                href={answersListRoutePath as TRoutePath}
                className="flex items-center gap-2 truncate"
              >
                <Icons.ArrowRight className="size-4 shrink-0" />
                <span className="truncate">{t('GoToTheAnswers')}</span>
              </Link>
            </Button>
          )
        }
        {/* Return to the form */}
        {startOverCallback && (
          <Button variant="ghost" onClick={startOverCallback} className="content-truncate gap-2">
            <Icons.Undo2 className="size-4 shrink-0" />
            <span className="truncate">{t('StartOver')}</span>
          </Button>
        )}
      </div>

      {/* LoadingSplash */}
      <BusySplash
        className={cn(
          isDev && '__SavedScreen_LoadingSplash', // DEBUG
        )}
        isBusy={isLeaving}
      />
    </div>
  );
}
