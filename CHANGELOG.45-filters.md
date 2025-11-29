https://github.com/lilliputten/mindstack/issues/40
Update logo, styles and app name.
45-filters
2025.11.29

Issue #45: Implement topics filtering for available and management pages

This PR adds comprehensive filtering functionality for both available topics and topics management pages. The implementation includes server-side filtering for getAvailableTopics and client-side filter parameter handling through useAvailableTopics hook.

Key changes:
- Added AvailableTopicsFilters component with multiple filter fields and form handling using react-hook-form's FormProvider
- Implemented filter persistence with default values from settings and ability to reset to defaults
- Added filter context management and proper react query data clearing on filters update
- Enhanced ThreeStateField component (later replaced with Select components) for better value handling
- Extended filtering to management pages (ManageTopicsListCard) with dark table header and updated empty states
- Improved navigation styles and added adaptive FormSection groups in filters
- Added sort by parameter and extracted text strings to TopicsFiltersTexts module
- Updated related pages including Questions and Answers management with consistent table styles
- Fixed data editing issues for question and answer pages and added user retrieving hook
- Enhanced UI with better form field styling, user interaction feedback, and welcome page layout improvements

The implementation maintains backward compatibility while providing robust filtering capabilities across both available topics and management interfaces.
