https://github.com/lilliputten/mindstack/issues/7
Add settings page.
7-settings-page

- Created core settings page layout.
- Added settings context, added settings initialization from the local settings, added a placeholder for loading server settings data.
- Added edit settings page with a form and updating data (TODO: Add settings to the db schema, connect server save handler.)
- Fixed settings form & context non-memoizing issue.
- Added user settings db schema.
- Added loading and saving settings to the server.
- Added settings language selector, refaaactored topic's language selector modal to become a shared component.
- Added color theme support. Completed settings for theme, theme color and application language.
- Show settings loading/saving toasts in the `SettingsContext` component. First save local settings data, then invoke server save function.
- Replaced all usages of `primary` colors with newly created `theme`.
- Added early theme color update, using server-side settings and beforeInteractive scripts.
- Replaced all usages of `ghostOnPrimary` colors with `ghostOnTheme`.
