import { TAiClientType } from '@/lib/ai/types/TAiClientType';

/** Demo data ids. See coresponding files by the path
 * `src/features/ai/actions/sample-data/GenerateQuestions/{ID}.json`
 * and definitions in the `src/features/ai/actions/sendAiTextQuery.ts`.
 * Set required demo data id in the following modules:
 * `src/components/pages/ManageTopicQuestions/GenerateQuestionsModal/GenerateQuestionsModal.tsx`
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
