import React from 'react';

import { cn } from '@/lib/utils';
import { Link, useT } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { BusySplash, Icons } from '@/components/shared';
import { TRoutePath } from '@/config';
import { isDev } from '@/constants';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';
import { TAvailableQuestion } from '@/features/questions/types';
import { TTopicId } from '@/features/topics';
import { PreviewQuestions } from '@/widgets/questions';

export interface TProps {
  scope: TTopicsManageScopeId;
  topicId: TTopicId; // Is it required here?
  startOverCallback?: () => void;
  className?: string;
  savedQuestions: TAvailableQuestion[];
}

export function SavedScreen(props: TProps) {
  const { className, scope, topicId, startOverCallback, savedQuestions } = props;
  const [isLeaving, setLeaving] = React.useState(false);
  const t = useT();

  const topicsListRoutePath = `/topics/${scope}`;
  const topicRoutePath = `${topicsListRoutePath}/${topicId}`;
  const questionsListRoutePath = `${topicRoutePath}/questions`;

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
          {t('GenerateQuestionsModal.SavedQuestionsCount', {
            count: savedQuestions.length,
          })}
          :
        </h3>
        {/* Display preview of the added questions */}
        <PreviewQuestions
          questions={savedQuestions}
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
          /* Option 1: saveQuestions */ true && (
            <Button
              className="content-truncate flex gap-2"
              onClick={() => {
                setLeaving(true);
              }}
              variant={!isLeaving ? 'success' : 'ghost'}
              disabled={isLeaving}
            >
              <Link
                href={questionsListRoutePath as TRoutePath}
                className="flex items-center gap-2 truncate"
              >
                <Icons.ArrowRight className="size-4 shrink-0" />
                <span className="truncate">{t('GoToTheQuestions')}</span>
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
