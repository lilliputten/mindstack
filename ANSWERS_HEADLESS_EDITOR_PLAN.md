# Answers headless editor — implementation plan

This document tracks the answers headless editor (parity with `QuestionsEditor`). It is updated as steps complete.

## Context

- **Pattern**: `HeadlessEditor` + `useHeadlessEditorState`, item type must satisfy `TCmpItemBase` (`id`, optional `isNew`, `order`, `_count`).
- **References**: `TNewOrOldQuestion` / `QuestionsEditor` / `updateQuestionsDataViaParams` / `CmpQuestion` / `demoQuestions`.

## Steps

| Step | Description                                                                                                                                                                                                                  | Status   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | Add `TNewOrOldAnswer` in `src/features/answers/types/TAnswer.ts`; add `src/features/answers/components/AnswersEditor/types.ts` (`T = TNewOrOldAnswer`).                                                                      | **done** |
| 2    | Add `src/entities/HeadlessEditor/demo/typesAnswer.ts` and `demoAnswers.ts` (template: `demoQuestions.ts`).                                                                                                                   | **done** |
| 3    | Add `updateAnswersDataViaParams` in `src/features/answers/actions/updateAnswersDataViaParams.ts` + export from `actions/index.ts`.                                                                                           | **done** |
| 4    | Move `EditAnswerForm` (+ fields + zod types) to `src/features/answers/components/EditAnswerForm/`; app route re-exports; extend `AddAnswerModal` with controlled `variant` for editor (local add, no immediate server call). | **done** |
| 5    | Add `CmpAnswer.tsx` and `AnswersEditor.tsx` (modals: add, delete selected, unsaved reload).                                                                                                                                  | **done** |
| 6    | Wire `ViewQuestionContentSummary` — replace `PreviewAnswers` block with `AnswersEditor` (comment legacy block).                                                                                                              | **done** |
| 7    | Add `HeadlessAnswersEditorDemo.tsx` + `.fixture.tsx`; switch `UiDemoForm.tsx` demo; Cosmo fixture entry in `cosmos.imports.ts`.                                                                                              | **done** |
| 8    | i18n: root keys `ConfirmDeleteAnswers`, `ConfirmDeleteAnswersMessage`, namespace `AnswersEditor.*` (`en` / `es` / `ru`).                                                                                                      | **done** |
| 9    | Verify: `pnpm exec eslint` on changed files; `pnpm exec tsc --noEmit`.                                                                                                                                                       | **done** |

## Deliverables (reference)

| Area        | Paths |
| ----------- | ----- |
| Types       | `src/features/answers/types/TAnswer.ts` (`TNewOrOldAnswer`), `src/features/answers/components/AnswersEditor/types.ts` |
| Server      | `src/features/answers/actions/updateAnswersDataViaParams.ts` |
| Editor UI   | `src/features/answers/components/AnswersEditor/*` |
| Demo item   | `src/entities/HeadlessEditor/demo/CmpAnswer.tsx` |
| Demo data   | `src/entities/HeadlessEditor/demo/typesAnswer.ts`, `demoAnswers.ts` |
| Demos       | `HeadlessAnswersEditorDemo.tsx`, `HeadlessAnswersEditorDemo.fixture.tsx` |
| Integration | `ViewQuestionContentSummary.tsx`, `UiDemoForm.tsx` |
| Shared form | `src/features/answers/components/EditAnswerForm/` (app edit route re-exports) |
| Add modal   | `AddAnswerModal.tsx` (`variant: 'controlled'` for editor; route default unchanged) |

## Notes

- **React Query**: `AnswersEditor` mirrors `QuestionsEditor` cache updates for infinite `available-answers-for-question` plus invalidation prefixes for question/topic/answers.
- **Limits**: Batch create uses `checkAnswersLimit`; non-admin users need sufficient `remaining` for the number of new rows (or unlimited tier).
- **Cosmos**: `cosmos.imports.ts` lists both question and answer headless fixtures; if your tooling regenerates this file, ensure both fixtures stay registered.

## Optional follow-ups

- Add `__tests__/updateAnswersDataViaParams.test.ts` mirroring `updateQuestionsDataViaParams.test.ts` (not required for initial delivery).
- Consider syncing `defaultItems` when `allAnswers` loads if empty initial state is observed (same pattern as `QuestionsEditor`).

## Changelog

- _2026-04-01_: Initial plan created.
- _2026-04-01_: Steps 1–9 implemented; TS/eslint clean; Prettier applied on touched modules.
- _2026-04-01_: Plan status reconciled — all steps marked **done**.
