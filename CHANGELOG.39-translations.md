https://github.com/lilliputten/mindstack/issues/39
i18n: Replace/update all existed translations. Translate all remaining texts.
39-translations
2025.12.17, 04:13

Issue #39: Comprehensive i18n implementation with translation updates, refactoring, and infrastructure improvements

Addresses Issue #39, delivering a comprehensive internationalization (i18n) overhaul. The changes replace the legacy `getTranslations()` function with the new `getT()` function from the centralized `i@/i18n` module across the entire codebase.

Key changes included:

- Replaced all remaining instances of `getTranslations()` with `getT()`.
- Added a substantial volume of translations for numerous domains and UI components, including:
  - Dashboard links, UpgradeCard, AvailableTopics, WorkoutStats, WorkoutTopic, WorkoutQuestion, WorkoutProgress.
  - Various management modules (topic, question, answer), ViewQuestionCard, ViewAnswerCard, MarkdownHint.
  - Topic filters panel, SettingsPage, language selection modals, and dialog components.
- Refactored content loading and rendering:
  - Converted all MDX pages to dynamically loaded Markdown-based pages, removing MDX support.
  - Implemented server-side content loading helpers with React Query caching.
  - Refactored Docs, Privacy, Cookies, and Terms pages to use Static Site Generation (SSG).
  - Updated Next.js webpack configuration to handle raw Markdown files.
- Updated infrastructure and tooling:
  - Replaced the external `json-sort-cli` npm utility with a local script (`src/packages/sort-json`) for primitive-first, case-sensitive JSON sorting. All locale files have been updated using this new sorter.
  - Updated Prisma from version 6 to 7.
  - Bumped application version to 0.0.4.
- Performed code and style refactoring:
  - Refactored demo AI request sending code and page layout.
  - Updated landing, mobile dashboard, and sidebar styles.
  - Updated plain content caching to use persistent module-level cache storage.
  - Reorganized the structure of static pages and removed 'force-static'.
- Fixed various bugs and minor issues:
  - Fixed incorrect i18n type imports.
  - Fixed reported layout issues.
  - Fixed logic for the fancy pricing button using advanced Tailwind CSS variables.
  - Removed deprecated `chartsRoute`.
