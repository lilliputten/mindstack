https://github.com/lilliputten/mindstack/issues/22
Fix existing bugs
22-fix-bugs
2025.11.18

feat: Enhanced workout system, UI improvements, and topic management features

This PR introduces comprehensive improvements to the workout system, UI/UX enhancements, and new topic management capabilities. The changes span across multiple components including workout flows, authentication handling, layout systems, and admin features.

Workout System Enhancements

- Improved workout flow: Added automatic workout start in `WorkoutTopicGo` when no activity exists
- Enhanced workout controls: Added "Finish Training" button and review functionality
- Better stats handling: Fixed `useWorkoutStatsHistory` hook to properly handle unauthorized users
- Performance optimization: Implemented next question prefetching via `NextQuestionPrefetcher`
- Updated skeletons: Workout skeletons now display answers blocks based on proper counts

UI/UX Improvements

- Layout fixes: Updated WelcomeScreen, InfoScreen, and mobile clipping issues
- Design system: Reversed Tailwind color scheme to standard progression (50 → 950)
- Component updates: Enhanced Progress component with multi-color segment support
- Navigation: Updated DashboardSidebar, NavBar links, and added waves decoration asset
- Responsive design: Improved mobile layout support and MobileSheet components

Authentication & Error Handling

- Enhanced error processing: Moved `getErrorText` to errors handlers module
- New error types: Added `GenericIDError`, `AIGenerationError`, and `ServerAuthError`
- Cache management: Added React Query cache cleaning on logout
- Authorization fixes: Proper handling of unauthorized states across workout components

Topic Management

- Public/private control: Added Public column and toggle functionality in `ManageTopicsListCard`
- Bulk operations: Implemented bulk public actions for topic management
- Access control: Added 'Manage Topic' buttons with proper foreign topic handling
- Content display: Improved topic header, properties, and details presentation

Internationalization & Settings

- Locale fixes: Updated default locale selector in settings form
- Select components: Improved select popper styles and dropdown viewport width
- Telegram integration: Fixed empty callback URL in registration links

Structural Changes

- New landing page: Added LandingPage as root page (cloned from AboutPage)
- Layout optimization: Sidebar hidden for root page in `GenericLayoutContent`
- Resource cleanup: Removed unused logos and assets
- Component refactoring: Updated multiple shared components and layouts
