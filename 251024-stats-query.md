Take a look at the Workout data schema, `UserTopicWorkout` in `prisma/schema.prisma`.

I want to move overall, statistic and calculable fields (and may be some others? suggest it):

```
  totalRounds      Int       @default(0) @map("total_rounds")
  allRatios        String    @default("") @map("all_ratios")
  allTimes         String    @default("") @map("all_times")
  averageRatio     Int       @default(0) @map("average_ratio")
  averageTime      Int       @default(0) @map("average_time")
```

-- to the dedicated `WorkoutStats` data table, where one row represent one finished workout round. New records should be added there on workout finish (see `finishWorkout` callback in the `src/hooks/react-query/useWorkoutQuery.ts`.

`allRatios` and `allTimes` should become fields in this table (`ratio`, `time`).

Also there must be info about total and correct answers (per row).

And `averageRatio` and `averageTime` must be calculable based on the table rows. (As well as `maxRatio`, `maxTime` and so on). Suggest helper functions to retrieve these data.

Suggest other functions to gather all other possible statistic details, based on the stored data.

Don't forget to check ts errors (via tsc) when done.

First suggest table structure and ongoing changes review to confirm.

---

Generate a text for the welcome user page, to describe the current application, mindstack, for the following cases:

- A regular user: it can view and work with public trainings, created by other people.
- A logged in user (isLogged): Can create it's own trainings, can view detailed statistics and historical progress.

Create aditional note for admin (isAdmin) users: they can monitor and cnotrol other users data and the users themselves.

---

Create a server function in the folder `src/features/ai/actions`, named `sendUserAIRequest`, which will invoke the `sendAiTextQuery` and accept the following params:

```
(messages: TPlainMessage[], opts: { debugData, topicId?: string }
```

It should get `clientType = defaultAiClientType`.

It should check if there generations available via the just created `checkUserAllowedGenerations` and if yes, then call the `sendAiTextQuery` with messages and `{ debugData, clientType }`. It should re-throw the `checkUserAllowedGenerations` thrown error if there are any errors.

It should measure the exection time in msecs for `spentTimeMs`, and get the consumed tokens from `usage_metadata.total_tokens` for the `spentTokens` fields of the `AIGeneration` record.

If successfully finished it should create the `AIGeneration` table record with optional `topicId`, `modelUsed = clientType`, `spentTimeMs`, `spentTokens`, set `createdAt` to start and `finishedAt` to finished time.

---

Create a server helper function in the folder `src/features/ai/actions`, named `checkUserAllowedGenerations` to check if the user is able to invoke AI generations.

It should get the userId (from `const user = await getCurrentUser();`)

Then to check if there is logged user.

Then to check user grade is BASIC or PRO or PREMUIM or user role is ADMIN.

For BASIC and PRO grade users it should check if there are available generations:

- For a BASIC user it should check if there are less than `BASIC_USER_GENERATIONS` (see it in the `src/config/envServer.ts` module) total records in the `AIGeneration` table.

- For a PRO user it should check if there are less than `PRO_USER_MONTHLY_GENERATIONS` (see it in the `src/config/envServer.ts` module) records in the `AIGeneration` table for the last month (according to the `finishedAt` field).

GUEST users are not allowed to perform generations.

Users with a PREMUIM grade or ADMIN role allowed to perform unlimitred generations.

If there is any error, the funciton should throw an AIGenerationError (`src/lib/errors/AIGenerationError.ts`).

The function result should be cached (for instance, by the `next/cache` nextjs feature or any other).

Also create a client react hook in the folder `src/features/ai/hooks`, named `useUserAllowedGenerations` to rpovide the result of the created server function.
