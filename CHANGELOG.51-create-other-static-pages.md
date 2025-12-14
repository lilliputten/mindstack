https://github.com/lilliputten/mindstack/issues/51
Create other static pages.
51-create-other-static-pages
2025.12.14

# Issue #51: Added MDX support and implemented legal/documentation pages (Closes #51)

Added MDX support to the project and implemented several new content pages. The changes include:

New Features:

- MDX Support: Added MDX processing capability to enable rich content pages
- Legal Pages: Created `/privacy`, `/terms`, and `/cookies` pages with multi-language translations
- Documentation Page: Added a basic `/documentation` page with template content
- Cookie Consent: Implemented 'Accept Cookies' popup with local storage cleansing on sign-in

Page Implementations:

1. Privacy Page: MDX content with multiple translations and shared variables
2. Terms of Service: Accessible at `/terms`
3. Cookie Policy: Accessible at `/cookies`
4. Documentation Page: Basic structure for future documentation

Configuration Updates:

- Updated config constants for privacy and contacts settings
- Implemented shared variables for consistent content management

Cleanup:

- Local storage data is now cleansed on successful sign-in
- Consistent translation structure across all new pages

Notes:

- All pages follow the same translation pattern
- MDX content utilizes shared variables for maintainability
- Cookie popup integrates with existing authentication flow
