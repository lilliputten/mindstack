import { generateArray } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';
import { TSaveDataParams } from '@/entities/HeadlessEditor';
import { TTopicId } from '@/features/topics';
import { useAvailableQuestions, useAvailableTopicById } from '@/hooks';

import { TUpdateQuestionsDataViaParams } from '../../actions';
import { QuestionsEditorCore } from './QuestionsEditorCore';
import { T } from './types';

interface TProps {
  className?: string;
  topicId?: TTopicId;
  notifyUpdate?: (updateQuestionsData: TUpdateQuestionsDataViaParams) => void;
}
export function QuestionsEditorDemo(props: TProps) {
  const { topicId, className, notifyUpdate } = props;

  if (!topicId) {
    throw new Error('Not topic id specified');
  }

  const availableTopicQuery = useAvailableTopicById({
    id: topicId,
  });
  const { topic, isFetching: isTopicFetching, isFetched: isTopicFetched } = availableTopicQuery;

  const availableQuestionsQuery = useAvailableQuestions({
    traceId: 'QuestionsEditorDemo',
    topicId,
    itemsLimit: null,
    includeAnswers: true,
  });
  const {
    allQuestions,
    isFetching: isQuestionsFetching,
    isFetched: isQuestionsFetched,
  } = availableQuestionsQuery;

  const isEditorReady =
    isTopicFetched && !isTopicFetching && isQuestionsFetched && !isQuestionsFetching;

  const saveData = async (saveParams: TSaveDataParams<T>): Promise<T[]> => {
    const { items, updatedItems, addedItems, deletedIds } = saveParams;
    const updateQuestionsData: TUpdateQuestionsDataViaParams = {
      updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
      addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
      deletedIds: deletedIds?.size ? [...deletedIds.values()] : undefined,
    };
    if (notifyUpdate) {
      notifyUpdate(updateQuestionsData);
    }
    const updatedMap = new Map(updatedItems ? [...updatedItems].map((u) => [u.id, u]) : []);
    const newItems = items
      .filter((item) => !deletedIds?.has(item.id))
      .map((item) => updatedMap.get(item.id) ?? item)
      .concat(addedItems ? ([...addedItems.values()] as T[]) : []);
    return newItems;
  };

  return (
    <div
      className={cn(
        isDev && '__QuestionsEditorDemo', // DEBUG
        'flex size-full flex-1 flex-col gap-4 px-6',
        className,
      )}
    >
      {!isEditorReady ? (
        <div
          className={cn(
            isDev && '__QuestionsEditorDemo_Skeleton', // DEBUG
            'flex w-full flex-col gap-4',
          )}
        >
          <Skeleton className="h-10 w-full" />
          <div className="flex size-full flex-1 flex-col gap-2">
            {generateArray(3).map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <QuestionsEditorCore
          topicId={topicId}
          langCode={topic?.langCode ?? undefined}
          questions={allQuestions}
          isReady={isEditorReady}
          saveData={saveData}
        />
      )}
    </div>
  );
}
