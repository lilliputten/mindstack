import { TAiClientType } from '@/lib/ai/types/TAiClientType';

/** Demo data ids. See coresponding files by the path
 * `src/features/ai/actions/sample-data/GenerateQuestions/{ID}.json`
 * and definitions in the `src/features/ai/actions/sendAiTextQuery.ts`.
 * Set demo required id in the
 * `src/components/pages/ManageTopicQuestions/GenerateQuestionsModal/GenerateQuestionsModal.tsx`
 * or in the
 * `src/components/pages/ManageTopicQuestionAnswers/GenerateAnswersModal/GenerateAnswersModal.tsx`
 */
export type TAIQuerDebugDataId =
  | 'answers-query-data-01'
  | 'questions-query-data-01'
  | 'questions-query-data-02'
  | 'questions-query-data-03'
  | boolean;

export interface TAIQueryOptions {
  clientType?: TAiClientType;
  debugData?: TAIQuerDebugDataId;
}
