https://github.com/lilliputten/mindstack/issues/37
Display intermediate and final workout statististics, current workout state, etc
37-display-workout-state
2025.10.31

Issue #37: Refactored workouts system with React Query, added AI generation features.

New Features:

- AI Generation System: Added toggleable "Generated" columns, AI badges, generation tracking, and usage limits with premium user controls
- Workout Statistics: Comprehensive stats and historical data for workout views with expanded/short forms
- Enhanced Workout Flow: Refactored workout lifecycle with React Query for improved performance
- Translation Debug Mode: Added 'xx' locale to display translation IDs directly in UI

Improvements:

- Upgraded user grade system (MEMBER→BASIC, PREMIUM→PRO, added PREMIUM)
- Updated UI components: headers, gradients, modals, and splash art
- Fixed workout starting logic and question presentation
- Improved error handling and syntax highlighting for markdown

Cleanup:

- Removed unused code and redundant components
- Refactored constants and hooks for better maintainability

The changes prepare the foundation for AI-powered features while modernizing the workout experience with better state management and user interface.
