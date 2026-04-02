import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { isDev } from '@/config';
import { TSaveDataParams } from '@/entities/HeadlessEditor';
import { TTopicId } from '@/features/topics';
import { useAvailableQuestions, useAvailableTopicById } from '@/hooks';

import { QuestionsEditor } from './QuestionsEditor';
import { T } from './types';

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

  // Debug handler for handleSaveData - displays received data in the console
  const handleSaveData = async (saveParams: TSaveDataParams<T>): Promise<T[]> => {
    // Destructure saveParams to show what data is available
    const {
      // All items list
      items,
      // Items by update type
      updatedItems,
      deletedItems,
      addedItems,
      // Ids by update type
      addedIds,
      deletedIds,
      updatedIds,
      reorderedIds,
      selectedIds,
    } = saveParams;
    // eslint-disable-next-line no-console
    console.log('[QuestionsEditorDemo:handleSaveData] Detailed data:', {
      items,
      updatedItems,
      deletedItems,
      addedItems,
      addedIds,
      deletedIds,
      updatedIds,
      reorderedIds,
      selectedIds,
    });
    debugger;
    /* // TODO: Implement actual data save logic here
     * // Example implementation:
     * // 1. Prepare data for API call
     * const updateQuestionsData = {
     *   updatedItems: updatedItems?.size ? [...updatedItems.values()] : undefined,
     *   addedItems: addedItems?.size ? [...addedItems.values()] : undefined,
     *   deletedIds: deletedIds?.size ? [...deletedIds.values()] : undefined,
     * };
     * // 2. Call API endpoint or server action
     * const results = await updateQuestionsDataViaParams(updateQuestionsData);
     * // 3. Return updated items
     * return results.allItems || [];
     * // 4. Handle errors
     * try {
     *   const results = await apiCall(updateQuestionsData);
     *   return results.items;
     * } catch (error) {
     *   console.error('Error saving questions:', error);
     *   throw error;
     * }
     */
    // Return updated data
    return items;
  };

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
        handleSaveData={handleSaveData}
        // setHeadlessEditorState={setHeadlessEditorState}
      />
    </div>
  );
}
