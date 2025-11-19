> 2025.11.19

I want to add extra lookup parameters to the server funciton `getAvailableTopics` (`src/features/topics/actions/getAvailableTopics.ts`), to be able searching for topics (see primsa schema in `prisma/schema.prisma`, `Topic` model) with conditions:

- By text through name, description, keywords.
- Get topics with existed history records (`workoutStats` -- with at least one related record); or without them.
- With active workouts (`userTopicWorkout`, should be started), or witjhout them.
- Topics what questions in a range (minQuestions, maxQuestions; it should be able to find topics without questions).
- Created in a date range (minCreated, maxCreated).
- Updated in a date range (minUpdated, maxUpdated).
- Topics with a language, by langCode (short) and langName (long).

You should:

- Add required parameters in the `TopicIncludeParamsSchema` (`src/lib/zod-schemas/AvailableTopicById.ts`).
- Update a code of the `useAvailableTopics` server function (`src/features/topics/actions/getAvailableTopics.ts`).
- Add test cases in the `src/features/topics/actions/__tests__/getAvailableTopics.test.ts`.

Always run tsc check (`pnpm tsc --noEmit --skipLibCheck`) and tests (`pnpm test`) after any changes.

Remember that the project uses pnpm.
