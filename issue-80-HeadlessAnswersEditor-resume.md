Issue #80: refactor(editors): Add headless answers/questions editors and wire `CmpQuestion`. Extracted reusable `HeadlessAnswersEditor` and `HeadlessQuestionsEditor` components. (In progress: stage 1.)

Extract HeadlessAnswersEditor and HeadlessQuestionsEditor so lists can be edited without React Query. AnswersEditor and QuestionsEditor keep mutations, cache updates, and invalidation; they compose the headless components and expose onBindSetItemsData for setItemsData after saves.

QuestionsEditorDemo uses HeadlessQuestionsEditor with raw topic/questions data, langCode from topic (null coerced to undefined), and an external isReady gate. ViewTopicContentSummary and ViewQuestionContentSummary pass isReady alongside existing queries.

CmpQuestion embeds HeadlessAnswersEditor; normalize draft-shaped answers to TNewOrOldAnswer rows (id + questionId) via toHeadlessAnswerRows.

Add issue-80-HeadlessAnswersEditor-plan.md with goals and progress.

--

Affected files:

issue-80-HeadlessAnswersEditor-plan.md
src/app/[locale]/topics/[scope]/[topicId]/ViewTopicContentSummary.tsx
src/app/[locale]/topics/[scope]/[topicId]/questions/[questionId]/ViewQuestionContentSummary.tsx
src/entities/HeadlessEditor/demo/CmpQuestion.tsx
src/features/answers/components/AnswersEditor/AnswersEditor.tsx
src/features/answers/components/AnswersEditor/HeadlessAnswersEditor.tsx
src/features/answers/components/AnswersEditor/index.ts
src/features/questions/components/QuestionsEditor/HeadlessQuestionsEditor.tsx
src/features/questions/components/QuestionsEditor/QuestionsEditor.tsx
src/features/questions/components/QuestionsEditor/QuestionsEditorDemo.tsx
src/features/questions/components/QuestionsEditor/index.ts

