import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';
import { TTopicId } from '@/features/topics';
import { useAvailableQuestions, useAvailableTopicById } from '@/hooks';

import { QuestionsEditor } from './QuestionsEditor';

interface TProps {
  className?: string;
  topicId?: TTopicId;
}
export function QuestionsEditorDemo(props: TProps) {
  const { topicId, className } = props;

  if (!topicId) {
    throw new Error('Not topic id specified');
  }

  const availableTopicQuery = useAvailableTopicById({
    id: topicId,
    // availableTopicsQueryKey,
    // ...availableTopicsQueryProps,
    // includeWorkout: availableTopicsQueryProps.includeWorkout,
    // includeUser: availableTopicsQueryProps.includeUser,
    // includeQuestionsCount: availableTopicsQueryProps.includeQuestionsCount,
  });
  const {
    // topic,
    isFetching: isTopicFetching,
    isFetched: isTopicFetched,
    // isCached: isTopicCached,
  } = availableTopicQuery;
  const isTopicReady = isTopicFetched && !isTopicFetching;

  const availableQuestionsQuery = useAvailableQuestions({
    traceId: 'QuestionsEditorDemo',
    topicId,
    itemsLimit: null, // Take all questions, without paging
    includeAnswers: true, // Include answers
  });
  const {
    // allQuestions,
    // queryKey: availableQuestionsQueryKey,
    // queryProps: availableQuestionsQueryProps,
    isFetching: isQuestionsFetching,
    isFetched: isQuestionsFetched,
  } = availableQuestionsQuery;
  const isQuestionsReady = isQuestionsFetched && !isQuestionsFetching;

  const isReady = isTopicReady && isQuestionsReady;

  return (
    <div
      className={cn(
        isDev && '__QuestionsEditorDemo', // DEBUG
        'flex size-full flex-1 flex-col gap-4 px-6',
        className,
      )}
    >
      {!isReady && (
        <div
          className={cn(
            isDev && '__QuestionsEditorDemo_Skeleton', // DEBUG
            'flex size-full flex-1 flex-col gap-4 px-6',
          )}
        >
          <Skeleton className="h-8 w-full" />
        </div>
      )}
      <QuestionsEditor
        topicId={topicId}
        availableTopicQuery={availableTopicQuery}
        availableQuestionsQuery={availableQuestionsQuery}
        // setHeadlessEditorState={setHeadlessEditorState}
      />
    </div>
  );
}
