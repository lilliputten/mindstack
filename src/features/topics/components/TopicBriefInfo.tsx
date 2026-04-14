import React from 'react';

import { generateArray, getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';
import { PreviewQuestions } from '@/widgets/questions';

import { TTopicId } from '../types';

const showQuestionsCount = 3;

interface TProps {
  className?: string;
  topicId: TTopicId;
}

export function TopicBriefInfo(props: TProps) {
  const { className, topicId } = props;
  const t = useT();
  /*
   * const availableTopicQuery = useAvailableTopicById({ id: topicId });
   * const {
   *   topic,
   *   isFetched: isTopicFetched,
   *   isLoading: isTopicLoading,
   *   error: topicError,
   * } = availableTopicQuery;
   */
  const availableQuestionsQuery = useAvailableQuestions({
    traceId: 'TopicBriefInfo',
    topicId,
    // includeAnswers: true, // Include answers
  });
  const {
    allQuestions,
    isFetched: isQuestionsFetched,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = availableQuestionsQuery;
  const isReady =
    /* isTopicFetched && !isTopicLoading && */ isQuestionsFetched && !isQuestionsLoading;

  // Display showQuestionsCount random questions
  const demoQuestions = React.useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, showQuestionsCount);
    // return allQuestions.slice(0, showQuestionsCount);
  }, [allQuestions]);

  if (isReady && !demoQuestions.length) {
    return null;
  }

  return (
    <div
      className={cn(
        isDev && '__TopicBriefInfo', // DEBUG
        'flex flex-col gap-2',
        className,
      )}
    >
      {!isReady ? (
        <div className="flex flex-col gap-2">
          {generateArray(3).map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : /* topicError || */ questionsError ? (
        <p className="text-red-500">
          {getErrorText(/* topicError || */ questionsError) ||
            t('TopicBriefInfo.CannotRetrieveTopic')}
        </p>
      ) : (
        <>
          <h4 className="font-semibold uppercase text-theme">
            {t('TopicBriefInfo.QuestionsExamples')}
          </h4>
          <div
            className={cn(
              isDev && '__TopicBriefInfo_Questions', // DEBUG
              'flex flex-col gap-2 text-xs',
            )}
          >
            <PreviewQuestions className="w-full" questions={demoQuestions} />
            {/*demoQuestions.map((question) => {
              return (
                <div
                  key={question.id}
                  className={cn(
                    isDev && '__TopicBriefInfo_QuestionsItem', // DEBUG
                    'w-full rounded border border-theme-500/10 bg-theme-500/5 p-4 py-1 opacity-50',
                  )}
                >
                  <MarkdownText>{question.text}</MarkdownText>
                </div>
              );
            })*/}
          </div>
        </>
      )}
    </div>
  );
}
