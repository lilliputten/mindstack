https://github.com/lilliputten/mindstack/issues/34
Update refactored components and layouts
34-update-refactored
2025.10.17

Multiple refactors: adaptive layouts, react query mutations and invalidations, table rows selection and mass deleting.

- Updated layout and react query usage on the following pages: EditTopicPage, ViewTopic, ManageTopicQuestionsPage, EditQuestionCard, ManageTopicQuestionAnswersPage, ViewQuestionCard, ViewAnswerCard, EditAnswerCard, ManageTopicsListCard, ViewAvailableTopic, AvailableTopicsList, WorkoutTopic, WorkoutTopicGo.
- Fixed behavior of 'Add topic/question/answer' modals -- they deactivate when the entity has been already added. Display breadcrumbs above the dashboard title. Minor decorative changes.
- Added react query parent entities invalidations for add/delete topic/question/answer. Added useMutation approaches for modal data handlers. Updated tests.
- Added actions for deleting multiple entities (topics, questions, answers) with tests.
- Added settings' field `jumpToNewEntities`, updated settings type, settings edit page, behavior of 'Add ...' modals.
- Added invalidation of entities after editing.
- Added ability to mass deleting of answers on the `ManageTopicQuestionAnswersListCard`, `ManageTopicsListCard` and `ManageTopicQuestionsListCard` pages.
