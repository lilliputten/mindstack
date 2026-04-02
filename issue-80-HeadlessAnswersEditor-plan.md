# Issue 80: Headless answers/questions editors

Plan and progress for splitting **query-aware** editors (`AnswersEditor`, `QuestionsEditor`) from **headless** editors that work on in-memory lists (draft/demo data, nested `CmpQuestion` answers).

**Rules:** See [`AGENTS.md`](./AGENTS.md) — English copy, no `any`, re-export via index files, `pnpm`, run `pnpm tsc --noEmit` for the whole project, ESLint only on changed files, run tests that apply.

---

## Goals

1. **`HeadlessAnswersEditor`** — UI + `useHeadlessEditorState` for answer rows; props are raw data + `saveData` + optional `isReady`; no `useAvailableAnswers` or query keys inside.
2. **`AnswersEditor`** — Keeps React Query (`availableAnswersQuery`), mutations, cache updates, invalidation; composes `HeadlessAnswersEditor`.
3. **`HeadlessQuestionsEditor`** — Same pattern for question rows; `langCode` optional (comparator language), no topic/questions queries inside.
4. **`QuestionsEditor`** — Keeps React Query; composes `HeadlessQuestionsEditor`.
5. **`QuestionsEditorDemo`** — Uses `HeadlessQuestionsEditor` only; passes `topicId`, `langCode`, `questions`, `isReady`, `saveData` (no `availableQuestionsQuery` / `availableTopicQuery` props).
6. **`CmpQuestion`** — Embeds `HeadlessAnswersEditor` for inline answers when `answers` are present.
7. **Parent `isReady`** — Optional flag from pages; combined in wrappers with query/saving/refetch state before passing to headless.

---

## Progress

### Architecture

- [x] Add `HeadlessAnswersEditor` (`src/features/answers/components/AnswersEditor/HeadlessAnswersEditor.tsx`).
- [x] Refactor `AnswersEditor` to thin wrapper around headless + query/mutation logic.
- [x] Export headless from `src/features/answers/components/AnswersEditor/index.ts`.
- [x] Add `HeadlessQuestionsEditor` (`src/features/questions/components/QuestionsEditor/HeadlessQuestionsEditor.tsx`).
- [x] Refactor `QuestionsEditor` to thin wrapper.
- [x] Export from `src/features/questions/components/QuestionsEditor/index.ts`.
- [x] Optional `onBindSetItemsData` wiring so wrappers can run `setItemsData` after cache mutations (internal contract between wrapper and headless).

### Demo and pages

- [x] `QuestionsEditorDemo` — `HeadlessQuestionsEditor` + local `saveData`; skeleton until topic + questions queries settled.
- [x] `ViewTopicContentSummary` — pass `isReady` into `QuestionsEditor` when topic/questions are not refetching.
- [x] `ViewQuestionContentSummary` — pass `isReady` into `AnswersEditor` when answers query is idle.

### `CmpQuestion` integration

- [x] Replace placeholder with `HeadlessAnswersEditor`.
- [x] Normalize `item.answers` to `TNewOrOldAnswer[]` (`toHeadlessAnswerRows`) — schema allows text-only draft answers without `id`/`questionId`.

### Types and fixes

- [x] `langCode`: coerce `null` → `undefined` at call sites (`topic?.langCode ?? undefined`) for `HeadlessQuestionsEditor`.
- [x] `pnpm tsc --noEmit` — verified clean (local run).
- [x] ESLint — verified clean on changed files (local run).

### Verification note

No dedicated Jest tests reference `HeadlessAnswersEditor` / `HeadlessQuestionsEditor` / `CmpQuestion` editors yet; add tests when behavior is locked for regression coverage.

### Follow-ups (optional / later)

- [ ] Add or extend Jest tests if a test module is added for headless editors or `CmpQuestion` save path.
- [ ] Consider documenting `reloadData` / `onBindSetItemsData` in a short internal README if more wrappers appear.
- [ ] Align `HeadlessAnswersEditorDemo` / Cosmos with the same props pattern if they still duplicate logic.

---

## File map

| Area               | Files                                                            |
| ------------------ | ---------------------------------------------------------------- |
| Headless answers   | `HeadlessAnswersEditor.tsx`, `AnswersEditor.tsx`, `index.ts`     |
| Headless questions | `HeadlessQuestionsEditor.tsx`, `QuestionsEditor.tsx`, `index.ts` |
| Demo               | `QuestionsEditorDemo.tsx`                                        |
| Nested UI          | `entities/HeadlessEditor/demo/CmpQuestion.tsx`                   |
| Consumers          | `ViewTopicContentSummary.tsx`, `ViewQuestionContentSummary.tsx`  |

---

## Public props (reference)

**`HeadlessAnswersEditor`**

- `topicId`, `questionId`, `questions` (answer rows), `setHeadlessEditorState?`, `saveData?`, `isReady?`, `reloadData?`, `onBindSetItemsData?` (wrapper-only).

**`HeadlessQuestionsEditor`**

- `topicId`, `langCode?`, `questions` (question rows), `setHeadlessEditorState?`, `saveData?`, `isReady?`, `reloadData?`, `onBindSetItemsData?` (wrapper-only).

---

_Last updated: verification (tsc + eslint) marked complete per local run; implementation done._
