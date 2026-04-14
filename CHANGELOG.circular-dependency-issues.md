<!--
 @since 2026.04.14
 @changed 2026.04.14, 06:43
-->

## 2026.04.14: fix(HeadlessEditor): Break circular dependency cycles causing Vercel server error

### Problem

Server error on Vercel: `TypeError: Cannot read properties of undefined (reading 'n9')` on the `ViewTopicPage`. No error occurred locally.

The root cause was circular imports involving `@/entities/HeadlessEditor`. The barrel module (`index.ts`) exports both components (`CmpQuestion`, `CmpAnswer`) and types/helpers (`reorderByDate`, `TSaveDataParams`, `newItemIdPrefix`). Feature components imported from the `HeadlessEditor` barrel while also being imported by `HeadlessEditor` components — creating cycles that break in production builds due to uninitialized modules during webpack concatenation.

### Solution

Replaced all barrel imports from `@/entities/HeadlessEditor` with direct imports from source modules. Replaced barrel imports from feature components with direct file imports.

### Files Changed (14 source files + 1 script)

`src/entities/HeadlessEditor/CmpQuestion.tsx`
- `newItemIdPrefix` — now imported from `./constants` (was `@/entities/HeadlessEditor`)
- `TSaveDataParams` — now imported from `./useHeadlessEditorState` (was `@/entities/HeadlessEditor`)
- `AnswersEditorCore` — now imported from `@/features/answers/components/AnswersEditor/AnswersEditorCore` (was `@/features/answers/components/AnswersEditor` barrel)

`src/features/answers/components/AnswersEditor/AnswersEditor.tsx`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`
- `THeadlessEditorState`, `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`

`src/features/answers/components/AnswersEditor/AnswersEditorCore.tsx`
- `CmpAnswer` — now imported from `@/entities/HeadlessEditor/CmpAnswer`
- `reorderByDate` — now imported from `@/entities/HeadlessEditor/helpers`
- `THeadlessEditorState`, `TReorderModes`, `TSaveDataParams`, `useHeadlessEditorState` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`
- `AddAnswerModal` — now imported from `@/components/pages/ManageTopicQuestionAnswers/AddAnswerModal/AddAnswerModal`

`src/features/questions/components/QuestionsEditor/QuestionsEditorCore.tsx`
- `CmpQuestion` — now imported from `@/entities/HeadlessEditor/CmpQuestion`
- `reorderByDate` — now imported from `@/entities/HeadlessEditor/helpers`
- `THeadlessEditorState`, `TReorderModes`, `TSaveDataParams`, `useHeadlessEditorState` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`

`src/features/questions/components/QuestionsEditor/QuestionsEditor.tsx`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`
- `THeadlessEditorState`, `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`

`src/features/questions/components/QuestionsEditor/QuestionsEditorDemo.tsx`
- `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`

`src/features/questions/actions/updateQuestionsDataViaParams.ts`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`

`src/features/answers/actions/updateAnswersDataViaParams.ts`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`

`src/features/answers/actions/__tests__/updateAnswersDataViaParams.test.ts`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`

`src/components/pages/ManageTopicQuestionAnswers/GenerateAnswersModal/GenerateAnswersPageWrapper.tsx`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`
- `getUniqueIdForSet` — now imported from `@/entities/HeadlessEditor/helpers`
- `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`

`src/components/pages/ManageTopicQuestionAnswers/GenerateAnswersModal/EditScreen.tsx`
- `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`
- `AnswersEditorCore` — now imported from `@/features/answers/components/AnswersEditor/AnswersEditorCore`

`src/components/pages/ManageTopicQuestions/GenerateQuestionsModal/GenerateQuestionsPageWrapper.tsx`
- `newItemIdPrefix` — now imported from `@/entities/HeadlessEditor/constants`
- `getUniqueIdForSet` — now imported from `@/entities/HeadlessEditor/helpers`
- `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`

`src/components/pages/ManageTopicQuestions/GenerateQuestionsModal/EditScreen.tsx`
- `TSaveDataParams` — now imported from `@/entities/HeadlessEditor/useHeadlessEditorState`
- `QuestionsEditorCore` — now imported from `@/features/questions/components/QuestionsEditor/QuestionsEditorCore`

### Cycles Broken

- `HeadlessEditor → CmpQuestion → AnswersEditor → HeadlessEditor` — resolved by importing `AnswersEditorCore` directly and importing types from source modules
- `HeadlessEditor → CmpQuestion → AnswersEditorCore → ManageTopicQuestionAnswers → EditScreen → HeadlessEditor` — resolved by `EditScreen` importing types and `AnswersEditorCore` directly
- `HeadlessEditor → CmpQuestion → QuestionsEditorCore → HeadlessEditor` — resolved by `QuestionsEditorCore` importing `CmpQuestion` and types directly
- `updateQuestionsDataViaParams → HeadlessEditor → CmpQuestion → hooks → useAvailableQuestionById → updateQuestionsDataViaParams` — resolved by importing `newItemIdPrefix` from `constants`
- `updateAnswersDataViaParams → HeadlessEditor → CmpAnswer → HeadlessEditor` — resolved by importing `newItemIdPrefix` from `constants`
- `GenerateAnswersPageWrapper → HeadlessEditor → CmpQuestion → hooks → GenerateAnswersPageWrapper` — resolved by importing all types/helpers directly from source modules

### New Tooling

- Added `scripts/check-circular-imports.ts` — standalone script that scans all source files and detects circular dependency chains. Integrated as `pnpm check-circular-imports-script`.

### Result

- All circular dependencies in the `HeadlessEditor` module graph eliminated
- TypeScript compilation passes with zero errors
- The Vercel server error is resolved

## Changed source files

- `src/components/pages/ManageTopicQuestionAnswers/GenerateAnswersModal/EditScreen.tsx`
- `src/components/pages/ManageTopicQuestionAnswers/GenerateAnswersModal/GenerateAnswersPageWrapper.tsx`
- `src/components/pages/ManageTopicQuestions/GenerateQuestionsModal/EditScreen.tsx`
- `src/components/pages/ManageTopicQuestions/GenerateQuestionsModal/GenerateQuestionsPageWrapper.tsx`
- `src/entities/HeadlessEditor/CmpQuestion.tsx`
- `src/features/answers/actions/__tests__/updateAnswersDataViaParams.test.ts`
- `src/features/answers/actions/updateAnswersDataViaParams.ts`
- `src/features/answers/components/AnswersEditor/AnswersEditor.tsx`
- `src/features/answers/components/AnswersEditor/AnswersEditorCore.tsx`
- `src/features/questions/actions/updateQuestionsDataViaParams.ts`
- `src/features/questions/components/QuestionsEditor/QuestionsEditor.tsx`
- `src/features/questions/components/QuestionsEditor/QuestionsEditorCore.tsx`
- `src/features/questions/components/QuestionsEditor/QuestionsEditorDemo.tsx`
