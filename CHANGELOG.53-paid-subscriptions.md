https://github.com/lilliputten/mindstack/issues/53
Add paid subscribtions.
53-paid-subscriptions
2026.01.07

# Issue #51: Implemented Paid Subscriptions with Multi-Currency Pricing and Yookassa/Stripe Integration

This PR implements the core paid subscriptions system for issue #53. It adds multi-currency pricing, payment processing via Yookassa and Stripe, and the necessary user subscription management.

Key changes:

- Added a new `Currency` Prisma model with a migration for storing exchange rates, using datetime stamps for updates.
- Created dynamic price calculation logic on the server, supporting multiple currencies. Added React Query hooks (`useCurrencyRatios`) and server actions for fetching rates.
- Implemented payment infrastructure: added `UserPayment` database model with migrations and supporting server actions.
- Integrated Yookassa payments: added `@a2seven/yoo-checkout` library, created API methods (`makeYookassaPayment`), and implemented a custom hook (`useYookassaPayment`) with payment status polling.
- Integrated Stripe payments: added environment constants, dependencies, and checkout flow.
- Built the complete user subscription flow: added a pricing plans page, a payment method selection page (`/pricing/choose/`), and success/cancel payment pages.
- Added subscription upgrade/downgrade logic with price difference calculations.
- Updated user model (`User` table) with `subscriptionPeriod` and `subscriptionStartedAt` fields.
- Enhanced auth flows: added redirect URL parameter propagation for sign-in, implemented a "Delete Account" feature via a modal, and cleared cookies on sign-out.
- Applied extensive routing reorganization: renamed legal/public routes, implemented Next.js route aliases defined in a central config, and updated the sitemap.
- Added a new static "Contacts" page and updated the "Offer" (oferta) page.
- Updated navbar adaptive styles and numerous translations throughout the application.
- Fixed environment configuration, moving Yookassa secrets to server-side and making Stripe publishable key available client-side.
- Resolved various issues, including race conditions in tests and authorization checks.

The feature is now ready for testing, covering subscription purchase, upgrade scenarios, and payment processing through both integrated gateways.
