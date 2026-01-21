https://github.com/lilliputten/mindstack/issues/49
Add categories feature
49-categories-database
2026.01.21

feat: Issue #49: Implemented category management system with multi-language support, image handling, and topic integration

This PR implements a comprehensive category management system as outlined in Issue #49. The feature includes a complete backend and frontend solution for creating, reading, updating, and deleting categories, with integration into the existing topics system.

- Added a new Category database model with Prisma migration, removing the user relation in favor of createdBy and updatedBy fields.
- Implemented server actions, type definitions, constants, and comprehensive tests for all category operations.
- Integrated Vercel Blob storage and Sharp dependency for category image upload, processing, and management, including cleanup of old images on update.
- Created a full CRUD interface for managing categories, including dedicated management pages, modals (Add, Edit, Delete), and a public "Available categories" page.
- Added multi-language translation support for category names and descriptions within the forms.
- Established a many-to-many relationship between Topics and Categories. Updated the Topic model, related actions, and UI to allow assigning categories to topics from both the topic management and category management sides.
- Implemented filter, sort, and search functionality for both the categories list and the topics list (filtering by category).
- Added a category suggestion feature for users, including rate-limiting logic and modals.
- Refactored form components, including a shared ImageUpload component with drag-and-drop support.
- Fixed parallel and intercepting route handling for modal windows, including skeleton loading states.
- Updated numerous translations across the feature and fixed related layout and styling issues.
- Added and updated extensive test suites to ensure reliability.
