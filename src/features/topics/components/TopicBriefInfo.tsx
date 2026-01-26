import { getErrorText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useAvailableQuestions } from '@/hooks/react-query/useAvailableQuestions';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/constants';

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
  // Get first N questions and display showQuestionsCount of them
  const availableQuestionsQuery = useAvailableQuestions({ topicId });
  const {
    allQuestions,
    isFetched: isQuestionsFetched,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = availableQuestionsQuery;
  const isReady =
    /* isTopicFetched && !isTopicLoading && */ isQuestionsFetched && !isQuestionsLoading;

  if (false || !isReady) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }
  if (/* topicError || */ questionsError) {
    return (
      <p className="text-red-500">
        {getErrorText(/* topicError || */ questionsError) ||
          t('TopicBriefInfo.CannotRetrieveTopic')}
      </p>
    );
  }

  return (
    <div
      className={cn(
        isDev && '__TopicBriefInfo', // DEBUG
        'flex flex-col gap-2',
        className,
      )}
    >
      <h4 className="font-semibold">{t('TopicBriefInfo.QuestionsExamples')}</h4>
      <div
        className={cn(
          isDev && '__TopicBriefInfo_Questions', // DEBUG
          'flex flex-col gap-1',
        )}
      >
        {allQuestions.slice(0, showQuestionsCount).map((question) => {
          return (
            <div
              key={question.id}
              className={cn(
                isDev && '__TopicBriefInfo_QuestionsList', // DEBUG
              )}
            >
              <MarkdownText>{question.text}</MarkdownText>
            </div>
          );
        })}
      </div>
    </div>
  );
}
