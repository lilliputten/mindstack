https://github.com/lilliputten/mindstack/issues/14
Add answers creation and editing features.
14-answers-features

- Added predefined tailwind colors to theme colors list.
- Changed data models: Used string ids for topics, questions and answers.
- Fixed server function for topic update.
- Updated all pages layouts (`ManageTopicsPageWrapper` and `PageHeader` used in pages, not in layouts), added `generateMetadata` functions to provide crsp window titles and metadata, added client hooks to update window titles from modals.
- Added answer page managing features. Resolved modal opening and server data action issues.
- Added cascading breadcrumbs for topic and question management panels.
- Added updating custom events for answers, questions and topics count change (on add, delete, reload), added ViewAnswerCard component, other minor changes.
