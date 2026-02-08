<!--
 @since 2025.07.05
 @changed 2026.02.08, 05:14
-->

# CHANGELOG

## [Issue #75: Implemented text similarity comparison package](https://github.com/lilliputten/mindstack/issues/64) - 2026.02.07

Changes

- Created `TextSimilarity` class for text preprocessing and comparison
- Implemented `compareNGrams` (histogram intersection) and `compareTokens` (cosine similarity) algorithms
- Added comprehensive test suite and benchmark scripts
- Added detailed README with performance analysis and usage guidelines

Core Features

- **Two algorithms**: n-gram histogram intersection and cosine similarity.
- **Multi-language support**: Optimized and tested for English, Russian, and Spanish.
- **Fully supports languages**: *de, en, es, fr, it, nl, ru*. The resulting list depends on the intersection of the languages supported by `stemmers` (*ar, da, nl, en, fi, fr, de, el, hu, it, pt, ro, ru, es, sw, ta, tr*) and `stopwords` (*de, en, es, fr, it, nl, ru*) modules.
- **Performance optimized**: Benchmarks show 0.1-3ms for n-gram and 0.2-8ms for token comparisons.
- **Configurable**: Adjustable n-gram sizes and preprocessing options.

For full details on algorithms, performance characteristics, and usage recommendations, see the README at [src/packages/text-similarity/README.md](src/packages/text-similarity/README.md).

## [Issue #64: Landing page layout updates, translations, and recent topics sort logic](https://github.com/lilliputten/mindstack/issues/64), #[v.0.1.3](https://github.com/lilliputten/mindstack/releases/tag/v.0.1.3) - 2026.02.06

- Updated telegram logger to send debugging data as attached JSON files.
- Updated recent topics getter on the landing page
- Updated layout for landing page categories and topics lists
- Fixed layouts and updated navigation buttons
- Updated landing page cards with icons style
- Updated some translations
- Added language name/code translations (via LanguageName)
- Updated sort logic for getRecentTopics server action: records with existing locale go first
- Minor changes: warning instead of error on unmounted react-query in useAvailableCategories
- Increased brightness effect for gradient buttons (brightness-120) in tailwind.config.ts

- [Compare versions](https://github.com/lilliputten/mindstack/compare/v.0.1.2...v.0.1.3)

## Minor fixes, #[v.0.1.2](https://github.com/lilliputten/mindstack/releases/tag/v.0.1.2) - 2026.02.04

- [Issue #67](https://github.com/lilliputten/mindstack/issues/67): Added complementary and triadic colors to theme. Added extra colors to the landing page, navbar & footer, some other components.
- Updated `AvailableCategoriesListItem` layout.
- Added recent topics landing page section.

- [Compare versions](https://github.com/lilliputten/mindstack/compare/v.0.1.1...v.0.1.2)

## Minor fixes - 2026.02.03

- Added fixes for the malformed Cloudflare response (with "```json" tags and some preceding text).
- Fixed an issue with blocked scroll (and touch) events in the nested Popover radix component (eg, if it's been wrapped in a popup dialog, like `CategorySelect` in the `AddTopicModal` -- preventing default events on the `PopoverContent` node), fixed (in a weird way) a bug with stuck categories loader in the `useAvailableCategories` react-query hook (with several workaround -- stale mount hook (`withStableMount`) and extra state and edge cases monitoring in the `useAvailableCategories` itself.

## [Issue #71: Enhanced AI data generation with new parameters, fixed JSON/route issues, updated management UI](https://github.com/lilliputten/mindstack/issues/71) #[v.0.1.1](https://github.com/lilliputten/mindstack/releases/tag/v.0.1.1) - 2026.02.03

- Fixed possible AI-generated data issues by adding the `jsonrepair` library to handle missed closing square brackets in JSON
- Resolved a NextJS routing error by correcting the route from `${topicRoutePath}/add` to `${topicRoutePath}/questions/add`
- Added constants for GigaChat model selection (`GigaChat`, `GigaChat-Pro`, `GigaChat-Max`)
- Updated the project license to MIT
- Reorganized AI server actions and type modules for better maintainability
- Enhanced the cacheable AI provider generator (`getAiClient`) to support a temperature parameter
- Introduced `clientType` and `temperature` parameters to AI generation forms for more precise control:
  - Added to `TextQueryForm`
  - Added to `GenerateQuestionsForm`
  - Added to `GenerateAnswersForm`
- Set a default temperature value via environment variables
- Removed prop-drilled handlers (`handleDeleteQuestion`, `handleEditQuestion`, `handleAddQuestion`, `handleEditAnswers`) from topics, questions, and answers manage list pages
- Updated actions and layouts in management list pages for improved UX

Minor related issues:

- Fixed other possible ai generated data issues (missed closing square brackets in json).
- Fixed an error with too strict expectations for generated answers (categoryIds and isCorrect flags became optional).
- Added a function to send logs to the telegram bot (`logData`).
- Added demo data with problematic generation results (`questions-query-data-02`).
- Updated questions and answers count to generate constants.
- Added an alternative way to start nextjs dev server from vscode launch (direct nodejs command).
- Added splitting large telegram messages.

- [Compare versions](https://github.com/lilliputten/mindstack/compare/v.0.1.0...v.0.1.1)

## [Issue #68: Updated logo, translations, pricing calculations, and routing](https://github.com/lilliputten/mindstack/issues/68) - 2026.01.31

- Updated app logo images
- Minor changes include: updated broken translations, used unified rich text translation data on pricingchoosepage, fixed remaining text-overflow issues
- Updated prices calculation on the PricingChoosePage
- Added dynamic redirect for /prices/choose (without tariff id) to /prices
- Updated base price (proSubscriptionMonthlyBasePrice) and price multipliers for derived currencies (RUB, TGSTAR)

## [Issue #56: Complete static pages content](https://github.com/lilliputten/mindstack/issues/56) #[v.0.1.0](https://github.com/lilliputten/mindstack/releases/tag/v.0.1.0) - 2026.01.26

Issued v.0.1.0, the first public version.

- Implements comprehensive updates to the landing page with new splash images, translated content, and UI improvements
- Created `getRecentCategories` server action to retrieve public categories sorted by popularity and update time
- Created `getAvailableCategories` server action with corresponding tests
- Updated LandingPageContext with proper React Query invalidation on category operations
- Renamed components for better clarity: `InfoScreen` → `AppInfoScreen`, `InfoVisualBlock` → `AppInfoVisualBlock`
- Refactored CSS classes to avoid Tailwind conflicts: `text-content` → `content-text`, `text-truncate` → `content-truncate`
- Added translations for landing blocks, FAQ section, and app components
- Updated layout and content on Welcome and About pages
- Added category display in the CategoriesSection sorted by popularity
- Improved landing page styles and images
- Fixed various tests and React Query invalidation logic

See also:

- [Compare versions](https://github.com/lilliputten/mindstack/compare/v.0.0.1...v.0.1.0)

## [Issue #60: Implement Available Workouts Feature with IndexedDB and Filtering](https://github.com/lilliputten/mindstack/issues/60) - 2026.01.23

- This implements the Available Workouts feature allowing users to view and filter a list of trainings (UserTopicWorkout model)
- Refactored the workout feature to use IndexedDB instead of Local Storage for local data persistence
- Created a server action (`getAvailableWorkouts.ts`) to retrieve workout data from the server
- Implemented a React Query hook (`useAvailableWorkouts`) for fetching an infinite list of workouts, with support for offline data retrieval from IndexedDB
- Built a filter component (`AvailableWorkoutsFilters`) with state persistence in Local Storage, mirroring the pattern used in category and topic filters
- Added a new page to display the list of available workouts
- Integrated the feature with the application's sidebar and navigation
- Added necessary internationalization texts for the new filters
- Fixed various styling, layout, and logic issues across the workout components

## [Issue #49: Add categories feature](https://github.com/lilliputten/mindstack/issues/49) - 2026.01.21

- Implemented comprehensive category management system with multi-language support, image handling, and topic integration
- Added Category database model with Prisma migration, using createdBy/updatedBy fields instead of direct user relation
- Implemented server actions, type definitions, constants, and comprehensive tests for all category operations
- Integrated Vercel Blob storage and Sharp dependency for category image upload, processing, and management
- Created full CRUD interface for categories with management pages, modals, and public "Available categories" page
- Added multi-language translation support for category names and descriptions
- Established many-to-many relationship between Topics and Categories
- Implemented filter, sort, and search functionality for categories and topics
- Added category suggestion feature with rate-limiting logic
- Refactored form components including shared ImageUpload with drag-and-drop support
- Fixed parallel/intercepting route handling for modals with skeleton loading states
- Updated numerous translations and fixed layout/styling issues
- Added and updated extensive test suites

## [Issue #53: Add paid subscriptions](https://github.com/lilliputten/mindstack/issues/53) - 2026.01.07

- Implements core paid subscriptions system with multi-currency pricing and payment processing
- Added `Currency` Prisma model with migration for storing exchange rates
- Created dynamic price calculation logic supporting multiple currencies with React Query hooks (`useCurrencyRatios`)
- Implemented payment infrastructure with `UserPayment` database model and server actions
- Integrated Yookassa payments using `@a2seven/yoo-checkout` library and custom hooks
- Integrated Stripe payments with environment constants and checkout flow
- Built complete user subscription flow: pricing plans page, payment method selection, success/cancel pages
- Added subscription upgrade/downgrade logic with price difference calculations
- Updated user model with `subscriptionPeriod` and `subscriptionStartedAt` fields
- Enhanced auth flows with redirect URL propagation and "Delete Account" feature
- Applied extensive routing reorganization with Next.js route aliases
- Added static "Contacts" page and updated "Offer" (oferta) page
- Updated navbar adaptive styles and numerous translations

## [Issue #57: Move to the new app domain](https://github.com/lilliputten/mindstack/issues/57) - 2025.12.25

- The app has been moved to the new domain: https://mindstack.lilliputten.com

## [Issue #39: Replace/update all existed translations. Translate all remaining texts](https://github.com/lilliputten/mindstack/issues/39) - 2025.12.17

- Replaced all remaining instances of `getTranslations()` with `getT()` from centralized `i@/i18n` module
- Added substantial volume of translations for numerous domains and UI components
- Refactored content loading and rendering:
  - Converted all MDX pages to dynamically loaded Markdown-based pages, removing MDX support
  - Implemented server-side content loading helpers with React Query caching
  - Refactored Docs, Privacy, Cookies, and Terms pages to use Static Site Generation (SSG)
- Updated infrastructure and tooling:
  - Replaced external `json-sort-cli` with local script (`src/packages/sort-json`) for JSON sorting
  - Updated Prisma from version 6 to 7
  - Bumped application version to 0.0.4
- Performed code and style refactoring across various components and pages
- Fixed various bugs and minor issues including layout problems and deprecated routes

## [Issue #51: Create other static pages](https://github.com/lilliputten/mindstack/issues/51) - 2025.12.14

- Added MDX support to enable rich content pages
- Created legal pages: `/privacy`, `/terms`, and `/cookies` with multi-language translations
- Added basic `/documentation` page with template content
- Implemented cookie consent popup with local storage cleansing on sign-in
- Updated config constants for privacy and contacts settings
- Implemented shared variables for consistent content management
- Local storage data is now cleansed on successful sign-in

## [Issue #44: Create landing page](https://github.com/lilliputten/mindstack/issues/44) - 2025.12.14

- Created a project landing page based on the Evil Martians devtool landing page template

## [Issue #45: Implement topics filtering](https://github.com/lilliputten/mindstack/issues/45) - 2025.11.29

- Added comprehensive filtering functionality for both available topics and management pages
- Created AvailableTopicsFilters component with react-hook-form's FormProvider
- Implemented filter persistence with default values from settings and reset to defaults option
- Added filter context management and proper react query data clearing on filters update
- Enhanced ThreeStateField component (later replaced with Select components) for better value handling
- Extended filtering to management pages (ManageTopicsListCard) with dark table header
- Improved navigation styles and added adaptive FormSection groups in filters
- Added sort by parameter and extracted text strings to TopicsFiltersTexts module
- Updated related pages including Questions and Answers management with consistent table styles
- Fixed data editing issues for question and answer pages and added user retrieving hook
- Enhanced UI with better form field styling, user interaction feedback, and welcome page improvements

## [Issue #22: Fix existing bugs](https://github.com/lilliputten/mindstack/issues/22) - 2025.11.18

- Introduces comprehensive improvements to workout system, UI/UX, and topic management
- Workout System Enhancements: Automatic workout start, finish button, stats handling, next question prefetching
- UI/UX Improvements: Layout fixes, color scheme updates, progress component enhancements, navigation improvements
- Authentication & Error Handling: Enhanced error processing, new error types, cache cleaning on logout
- Topic Management: Public/private toggle, bulk operations, access control improvements
- Internationalization & Settings: Locale fixes, select component improvements, Telegram integration fixes
- Structural Changes: New landing page, layout optimizations, resource cleanup

## [Issue #40: Update logo, styles and app name](https://github.com/lilliputten/mindstack/issues/40) - 2025.11.04

MindStack Brand has been Launched.

This release introduces the new identity and important backend improvements:

- Rebranded as "MindStack" with all new logos and favicons
- Updated navbar and sign-in form layouts to match the new branding
- Database migration consolidation: Replaced multiple legacy migrations with a single baseline migration
- Streamlined migration history for better maintainability
- Version bump to 0.0.3

Impact Areas:

- All visual assets (logos, favicons)
- Authentication UI flows
- Database schema management
- Brand consistency across the application

## [Issue #37: Display intermediate and final workout statistics, current workout state, etc](https://github.com/lilliputten/mindstack/issues/37) - 2025.10.31

- New Features:
  - AI Generation System: Toggleable "Generated" columns, AI badges, generation tracking, and usage limits
  - Workout Statistics: Comprehensive stats and historical data with expanded/short forms
  - Enhanced Workout Flow: Refactored lifecycle with React Query for improved performance
  - Translation Debug Mode: Added 'xx' locale to display translation IDs directly in UI
- Improvements:
  - Upgraded user grade system (MEMBER→BASIC, PREMIUM→PRO, added PREMIUM)
  - Updated UI components: headers, gradients, modals, and splash art
  - Fixed workout starting logic and question presentation
  - Improved error handling and syntax highlighting for markdown
- Cleanup:
  - Removed unused code and redundant components
  - Refactored constants and hooks for better maintainability

The changes prepare the foundation for AI-powered features while modernizing the workout experience with better state management and user interface.

## [Issue #18: Add AI generation features](https://github.com/lilliputten/mindstack/issues/18) - 2025.10.22

- Added comprehensive AI generation features to the platform
- Created admin panel pages for TG bot control and AI test queries
- Implemented server functions, routines, queries, and modal UI for question/answer generation
- Added UserGrade column field and converted role to UserRole enum
- Limited question and answer generation for regular users based on grade and role fields
- Debug output temporarily retained for AI generation functionality

## [Issue #34: Update refactored components and layouts](https://github.com/lilliputten/mindstack/issues/34) - 2025.10.17

- Multiple refactors including adaptive layouts, react query mutations, table rows selection, and mass deleting
- Updated layout and react query usage on multiple pages: EditTopicPage, ViewTopic, ManageTopicQuestionsPage, and more
- Fixed behavior of 'Add topic/question/answer' modals (deactivate when entity already added) and added breadcrumbs
- Added react query parent entities invalidations for add/delete operations and useMutation approaches for modals
- Added actions for deleting multiple entities (topics, questions, answers) with tests
- Added settings field `jumpToNewEntities` and updated settings type, edit page, and modal behavior
- Added invalidation of entities after editing
- Added ability to mass delete answers on multiple management pages

## [Issue #32: Update style & code](https://github.com/lilliputten/mindstack/issues/32) - 2025.10.07

- Updated style and code according to the `next-ai-helper-chat` playground project

## [Issue #29: Split workout page to "view workout" and "do workout"](https://github.com/lilliputten/mindstack/issues/29) - 2025.08.27

- Split workout page into two pieces: workout review and workout go

## [Issue #26: Migrate data interchange methods to react query](https://github.com/lilliputten/mindstack/issues/26) - 2025.08.26

- Comprehensive migration to React Query for data fetching and state management
- Replaced context providers with React Query hooks (e.g., useAvailableTopicsByScope, useAvailableQuestions)
- Implemented infinite query for paginated data loading (available topics, questions, answers)
- Added Zod schemas for data validation and type safety
- Refactored API routes and server actions for better separation of concerns
- Created new hooks for data invalidation and cache management
- Replaced direct server function calls with API route fetching where appropriate
- Fixed various bugs in data fetching, error handling, and component rendering
- Cleaned up unused code and refactored components for better maintainability
- Improved error logging and debugging capabilities with standardized patterns

## [Issue #20: Create learning page for the available topic](https://github.com/lilliputten/mindstack/issues/20) - 2025.08.16

- Added comprehensive workout system: components, context, API routes, and logic
- Updated Prisma data models to support workout functionality
- Added workout question page with markdown support
- Created workout pages and API routes for topic training
- Implemented summary sections for topic, question, and answer management pages
- Used zod-prisma-types provider for Prisma ORM integration
- Added component to resume/start/restart workout sessions
- Finished core topic workout logic implementation
- Fixed layout bugs in WelcomeScreen gradient splash
- Updated workout topic UI with skeletons, placeholders, and improved buttons
- Fixed modals for adding/deleting topics, questions, and answers
- Added workout update logic when questions are created or removed
- Implemented `useGoBack()` hook and standardized workout routes

## [Issue #23: Collect statistics, show statistics (and progress?) info](https://github.com/lilliputten/mindstack/issues/23) - 2025.08.16

- Created statistics calculation system with updated data models
- Added brief statistics display in the `WorkoutTopicControl` component
- Updated inner state management in `WorkoutQuestionContainer` to rely more on `WorkoutContext` data
- Refactored `useWorkout` state management: divided methods into data-updating and data saving/loading functions
- Temporarily kept debug logging for state management refactoring

## [Issue #17: Add public pages to show topics](https://github.com/lilliputten/mindstack/issues/17) - 2025.08.11

- Created new AvailableTopics page for public topic display
- Fixed toolbar ref issues on settings page and updated available topics list appearance
- Refactored topic cards & headers view/actions, added basic topic card for manage topic page
- Updated sidebar code with state memoizing and fixed dashboard sidebar issues
- Added incremental (partial/parameterized) data loading for available topics
- Added welcome page gradient and updated visual size/behavior
- Defined all theme colors as CSS variables
- Updated top menu and made minor utility refactoring
- Fixed add entities (topics, questions, answers) modals issues

## [Issue #14: Add answers creation and editing features](https://github.com/lilliputten/mindstack/issues/14) - 2025.07.31

- Added predefined Tailwind colors to theme colors list
- Changed data models to use string IDs for topics, questions, and answers
- Fixed server function for topic update
- Updated page layouts: moved `ManageTopicsPageWrapper` and `PageHeader` to pages instead of layouts
- Added `generateMetadata` functions for proper window titles and metadata
- Added client hooks to update window titles from modals
- Implemented comprehensive answer management features with modal handling
- Added cascading breadcrumbs for topic and question management panels
- Added custom events for count changes (on add/delete/reload of answers, questions, topics)
- Created ViewAnswerCard component for answer display
- Resolved modal opening and server data action issues

## [Issue #7: Add settings page](https://github.com/lilliputten/mindstack/issues/7) - 2025.07.25

- Created core settings page layout with form and data management
- Added SettingsContext for state management with local and server settings initialization
- Implemented edit settings page with form validation and data persistence
- Fixed settings form & context non-memoizing issues for better performance
- Added user settings database schema and server-side save/load functionality
- Created shared language selector component from refactored topic's language selector modal
- Added comprehensive color theme support with theme, theme color, and application language settings
- Implemented toast notifications for settings loading/saving status
- Replaced hardcoded primary colors with dynamic theme-based colors across the application
- Added early theme color update using server-side settings and beforeInteractive scripts
- Updated all ghost button styles from ghostOnPrimary to ghostOnTheme for consistency

## [Issue #8: Add an ability to add/edit questions for topics](https://github.com/lilliputten/mindstack/issues/8) - 2025.07.21

- Implemented comprehensive questions managing subsystem
- Added functionality to add and edit questions for topics
- Created necessary UI components and backend logic for question management
- Established the foundation for question-answer relationships in the system

## [Issue #6: Add ability to edit all topics for admins](https://github.com/lilliputten/mindstack/issues/6) - 2025.07.20

- Refactored manage topic page components (modals and cards) to be independent and reusable
- Added cached user feature for 'all pages' mode in topics list: displays topic's owner information
- Enabled admin functionality to edit all topics across the platform
- Improved component reusability for topic management interfaces

## [Issue #5: Check if there is correct user roles feature (admin or regular user)](https://github.com/lilliputten/mindstack/issues/5) - 2025.07.19

- Fixed processing of user roles, added admin indications, routes for all topics page and other.

## [Issue #4: Created and connected google and yandex oauth applications](https://github.com/lilliputten/mindstack/issues/4) - 2025.07.19

- Created and connected google and yandex oauth applications.

## [Issue #3: Add the remaining features of the My Topics page](https://github.com/lilliputten/mindstackissues/3) - 2025.07.19

- Created full my topics functional: list, add, delte, edit, language selector, using parallel and intercepting routes.

## [Issue #1: Create basic layout & pages](https://github.com/lilliputten/mindstackissues/1) #[v.0.0.1](https://github.com/lilliputten/mindstackreleases/tag/v.0.0.1) - 2025.07.16

- Create basic layout, updated project configuration, added my topics add & delete features (via parallel & intercepting route modals).

See also:

- [Compare versions](https://github.com/lilliputten/mindstackcompare/v.0.0.0...v.0.0.1)

## [v.0.0.0](https://github.com/lilliputten/mindstackreleases/tag/v.0.0.0) - 2025.07.05

- Created initial project.
