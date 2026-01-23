https://github.com/lilliputten/mindstack/issues/60
Move to the new app domain (https://mindstack.lilliputten.com)
60-training-workouts-list
2026.01.23

Issue #60: Implement Available Workouts Feature with IndexedDB and Filtering

This PR implements the Available Workouts feature as part of Issue #60. The core functionality allows users to view and filter a list of trainings (UserTopicWorkout model).

- Refactored the workout feature to use IndexedDB instead of Local Storage for local data persistence.
- Created a server action (`getAvailableWorkouts.ts`) to retrieve workout data from the server.
- Implemented a React Query hook (`useAvailableWorkouts`) for fetching an infinite list of workouts, with support for offline data retrieval from IndexedDB.
- Built a filter component (`AvailableWorkoutsFilters`) with state persistence in Local Storage, mirroring the pattern used in category and topic filters.
- Added a new page to display the list of available workouts.
- Integrated the feature with the application's sidebar and navigation.
- Added necessary internationalization texts for the new filters.
- Fixed various styling, layout, and logic issues across the workout components.
