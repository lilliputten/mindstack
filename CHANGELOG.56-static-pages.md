https://github.com/lilliputten/mindstack/issues/56
Complete static pages content
Branch: 56-static-pages
2026.01.26

Here are the GitHub PR title and comment texts:

feat(landing): Implement landing page updates with translations, categories, and content improvements

This PR implements comprehensive updates to the landing page as part of Issue #56. The changes include new splash images, translated content, category display functionality, server actions for data retrieval, and various UI improvements across multiple pages.

Landing Page Content & UI
- Added splash images for the hero section with updated text content
- Translated texts for landing blocks, FAQ section, and app components
- Updated layout and content on Welcome and About pages
- Added category display in the CategoriesSection
- Improved landing page styles and images

Server Actions & Data Handling
- Created `getRecentCategories` server action to retrieve public categories sorted by popularity (topic count) and update time
- Created `getAvailableCategories` server action with corresponding tests
- Updated LandingPageContext with proper React Query invalidation on category add/edit operations
- Refactored categories feature imports to avoid wildcard re-exports

Code Quality & Maintenance
- Renamed components for better clarity: `InfoScreen` → `AppInfoScreen`, `InfoVisualBlock` → `AppInfoVisualBlock`
- Updated text truncation logic to preserve code blocks
- Refactored CSS classes: `text-content` → `content-text`, `text-truncate` → `content-truncate` to avoid Tailwind conflicts
- Removed dangerous `cleanupStaleTestData` from test suite
- Fixed various tests and React Query invalidation logic

Translation Updates
- Added translations for AppIntroBlock and getUserStatusText
- Updated multiple translation files for landing content
- Completed remaining translations for all landing blocks

### Technical Notes
- Categories are now sorted by popularity using `[{ topics: { _count: 'desc' } }, { createdAt: 'desc' }]` ordering
- Server actions include proper parameter handling (`take` parameter for limiting results)
- Updated markdown processing to handle code blocks appropriately during truncation

### Testing
- Added comprehensive tests for `getAvailableCategories` server action
- Updated existing tests to reflect refactoring changes
- Fixed test issues related to React Query and component updates

### Impact
- Improves landing page visual appeal with new images and layouts
- Enhances internationalization with complete translation coverage
- Adds dynamic category display based on popularity
- Maintains code quality through systematic refactoring and testing
