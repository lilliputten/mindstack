https://github.com/lilliputten/mindstack/issues/20
Create learning page for the available topic.
20-learning-page

- Added workout components, context, api routes and logic.
- Updated prisma data models.
- Added workout question page.
- Added markdown support.
- Added summary sections for topic, question, answer manage pages, fixed minor data related issues.
- Created workout pages and api routes.
- Using zod-prisma-types provider for prisma orm.

Other changes:

- Using prisma from '@/generated/prisma'.
- Using `useGoBack()` hook, using a route `/topics/available/${id}/workout` for a topic training page.
- Created a component to resume/start/restart workout.
- Finished topic workout logic in general.
- Fixed WelcomeScreen gradient splash layout bug.
- Workout topic changes: updated buttons, displaying skeletons while answers data is loading, added placeholders for the future progress and stats info data.
- Fixed "Add new..." and "Delete..." modals for topics, questions and answers.
- Fixed missed workout topic breadcrumb issue.
- Added workout update code on topic question removing or creation.
