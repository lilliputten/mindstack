# MindStack Project Documentation

## Project Overview

MindStack is a NextJS Memory Training Application designed to help users learn and memorize topics through interactive quizzes and workouts. The application allows users to create topics with questions and answers, practice through workouts, track their progress, and generate content using AI assistance.

**Version:** v.0.0.4
**Last Updated:** 2026.01.07
**Repository:** https://github.com/lilliputten/mindstack/
**Live Application:** https://mindstack.lilliputten.com/

---

## Technology Stack

### Core Framework

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 19** - UI library

### Database & ORM

- **PostgreSQL** - Primary database
- **Prisma 6** - ORM with type-safe database access
- **zod-prisma-types** - Auto-generated Zod schemas from Prisma

### Styling & UI

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components
- **SCSS/Sass** - Additional styling with CSS variables and theming
- **next-themes** - Dark/light mode support
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Tailwind class merging utility

### State Management & Data Fetching

- **React Query (TanStack Query 5)** - Server state management
- **Zustand 5** - Client-side state management
- **Context API** - React context for local state

### Authentication & Security

- **NextAuth.js 5** - Authentication with multiple providers
- **Telegram Auth** - Telegram-based authentication
- **Zod** - Schema validation

### Internationalization

- **next-intl** - Internationalization for Next.js App Router
- **Supported locales:** English (en), Spanish (es), Russian (ru)

### AI Integration

- **GigaChat** - AI content generation
- **LangChain** - AI model orchestration
- **Cloudflare Workers AI** - Alternative AI provider

### Payments

- **Stripe** - Payment processing
- **Yookassa** - Russian payment processor

### Testing

- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **ts-jest** - TypeScript Jest support

### Development Tools

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Stylelint** - SCSS/CSS linting
- **Husky** - Git hooks
- **lint-staged** - Staged files linting
- **commitlint** - Conventional commit messages

---

## Project Structure

```
mindstack/
├── prisma/                    # Database schema and migrations
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── [locale]/          # Internationalized routes
│   │   ├── api/               # API routes
│   │   └── public/            # Public pages (landing, pricing, etc.)
│   ├── auth/                  # Authentication configuration
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base UI components (Radix-based)
│   │   ├── screens/           # Page-specific screen components
│   │   ├── layout/            # Layout components
│   │   ├── pages/             # Page-specific components
│   │   ├── forms/             # Form components
│   │   ├── modals/            # Modal components
│   │   ├── blocks/            # Content block components
│   │   ├── shared/            # Shared components
│   │   ├── debug/             # Debug components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── currencies/        # Currency-related components
│   │   ├── content/           # Content components
│   │   └── providers/         # Context providers
│   ├── features/              # Feature-based modules
│   │   ├── workouts/          # Workout functionality
│   │   ├── users/             # User management
│   │   ├── topics/            # Topic management
│   │   ├── questions/         # Question management
│   │   ├── answers/           # Answer management
│   │   ├── subscriptions/     # Subscription handling
│   │   ├── payments/          # Payment processing
│   │   ├── currencies/        # Currency management
│   │   ├── categories/        # Category management
│   │   ├── bot/               # Telegram bot integration
│   │   ├── ai/                # AI generation features
│   │   ├── ai-generations/    # AI generation tracking
│   │   ├── allowed-users/     # User allowlist management
│   │   └── app/               # App-level helpers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core library code
│   │   ├── helpers/           # Utility functions
│   │   ├── types/             # TypeScript type definitions
│   │   ├── errors/            # Custom error classes
│   │   ├── api/               # API utilities
│   │   ├── ai/                # AI client utilities
│   │   ├── admin/             # Admin utilities
│   │   └── db/                # Database utilities
│   ├── stores/                # Zustand stores
│   ├── contexts/              # React contexts
│   ├── constants/             # Application constants
│   ├── i18n/                  # Internationalization
│   ├── styles/                # Global styles and SCSS
│   ├── config/                # Configuration files
│   ├── jest/                  # Jest setup files
│   └── packages/              # Internal packages
│       └── sort-json/         # JSON sorting utility
├── public/                    # Static assets
├── build-utils/               # Build utilities
├── .utils/                    # Utility scripts
└── scripts/                   # Maintenance scripts
```

---

## Key Features

### Core Functionality

1. **Topic Management** - Create, edit, delete, and manage learning topics
2. **Question & Answer System** - Add questions with multiple answers to topics
3. **Workout System** - Interactive quiz-based learning sessions
4. **Progress Tracking** - Track workout statistics and performance

### User System

1. **Authentication** - Multiple auth providers (Telegram, Email, GitHub, Google, Yandex)
2. **User Roles** - USER and ADMIN roles
3. **User Grades** - GUEST, BASIC, PRO, PREMIUM, UNLIMITED tiers
4. **Subscription System** - Monthly and yearly subscriptions

### AI Features

1. **Question Generation** - AI-powered question generation for topics
2. **Answer Generation** - AI-powered answer generation for questions
3. **Usage Tracking** - Track AI generation usage per user

### Payments

1. **Stripe Integration** - International payment processing
2. **Yookassa Integration** - Russian payment processor
3. **Subscription Management** - Manage user subscriptions

### Telegram Bot

1. **Command Handling** - Bot commands for various actions
2. **User Authorization** - Telegram-based user management
3. **Notifications** - Bot-based user notifications

### Localization

1. **Multi-language Support** - English, Spanish, Russian
2. **Dynamic Locale Switching** - User can change language
3. **Language Detection** - Auto-detect user locale

---

## Build & Run Commands

### Development

```bash
# Run development server with turbo mode
pnpm dev

# Run development server (alternative)
npm run dev
```

### Build

```bash
# Build for production
pnpm build
npm run build

# Preview production build
pnpm preview
npm run preview
```

### Production

```bash
# Start production server
pnpm start
npm run start
```

### Database Operations

```bash
# Generate Prisma client
pnpm prisma-generate

# Validate Prisma schema
pnpm prisma-validate

# Format Prisma schema
pnpm prisma-format

# Run database migrations
pnpm prisma-migrate

# Run migrations in development mode
pnpm prisma-migrate-dev

# Open Prisma Studio (database GUI)
pnpm prisma-studio
```

### Linting & Formatting

```bash
# Run ESLint
pnpm eslint
npm run eslint

# Auto-fix ESLint issues
pnpm eslint-fix

# Run Prettier
pnpm prettier

# Quick Prettier (faster, uses cache)
pnpm prettier-quick

# Run Stylelint
pnpm stylelint

# Auto-fix Stylelint issues
pnpm stylelint-fix

# Run all checks
pnpm lint-all

# Run all checks with Prettier
pnpm check-all
```

### Type Checking

```bash
# TypeScript type checking
pnpm check-types
npm run check-types
```

### Testing

```bash
# Run tests
pnpm test
npm run test

# Run tests in CI mode
pnpm test:ci

# Update snapshots
pnpm test-update-snapshots

# Run tests in watch mode
pnpm test-watch
```

### Maintenance

```bash
# Clear all caches
pnpm clear-all

# Sort locale files
pnpm sort-locales

# Check editorconfig compliance
pnpm check-editorconfig

# List all available scripts
pnpm scripts-help
```

### Full CI Pipeline

```bash
# Run all checks and tests
pnpm check-and-test
```

---

## Database Schema

### Main Models

**User** - Core user entity with roles, grades, and subscriptions

- Relations: Accounts, Sessions, Topics, Payments, Settings, Workouts, AI Generations, Categories

**Topic** - Learning topic with questions

- Relations: Questions, User, Category, UserTopicWorkouts, WorkoutStats

**Question** - Quiz question within a topic

- Relations: Answers, Topic

**Answer** - Answer option for a question

- Relations: Question

**UserTopicWorkout** - Active workout session

- Relations: User, Topic, WorkoutStats

**WorkoutStats** - Completed workout statistics

- Relations: User, Topic, UserTopicWorkout

**Category** - Topic categories

- Relations: Topics, Translations, User

**UserPayment** - Payment records

- Relations: User

**AIGeneration** - AI generation usage tracking

- Relations: User

**AllowedUser** - Email/Telegram allowlist for access control

- Relations: None (standalone)

### Enums

- `UserRole`: USER, ADMIN
- `UserGrade`: GUEST, BASIC, PRO, PREMIUM, UNLIMITED
- `UserSubscriptionPeriod`: MONTH, YEAR
- `UserPaymentProvider`: YOOKASSA, STRIPE
- `UserPaymentStatus`: PENDING, FAILED, CANCELED, SUCCEED
- `CategoryStatus`: PUBLIC, SUGGESTED, HIDDEN
- `CurrencyType`: USD, EUR, RUB, TGSTAR
- `AllowedUserType`: EMAIL, TELEGRAM

---

## Coding Standards

### TypeScript

- Strict mode enabled in `tsconfig.json`
- No `any` types - use explicit types or `unknown`
- Use TypeScript ESLint plugin for additional rules
- Path aliases: `@/*` maps to `src/*`

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use proper TypeScript types for props
- Follow React Query patterns for data fetching
- Use Radix UI primitives for accessible components

### Styling

- Tailwind CSS for component-level styling
- SCSS for global styles and theming
- CSS variables for dynamic theming (colors, fonts, etc.)
- `tailwind-merge` for class merging
- `clsx` for conditional classes

### State Management

- React Query for server state
- Zustand for complex client state
- React Context for simple shared state
- LocalStorage for persistence when needed

### API Routes

- Use Next.js App Router API routes (`src/app/api/`)
- Return proper Next.js `Response` objects
- Validate inputs with Zod schemas
- Use try/catch with proper error handling

### Testing

- Jest for unit tests
- React Testing Library for component tests
- Place tests alongside source files (`*.test.ts`)
- Use snapshots for component output tests

### Git & Commits

- Conventional commit messages (commitlint)
- Husky for pre-commit hooks
- lint-staged for staged file linting

---

## Environment Variables

### Required Variables

```env
# App
NEXT_PUBLIC_URL=<application_url>
NODE_ENV=development|production

# Auth
AUTH_SECRET=<auth_secret>
NEXTAUTH_URL=<auth_url>

# Database
DATABASE_URL=<postgresql_connection_string>

# Telegram Bot
BOT_TOKEN=<telegram_bot_token>
BOT_USERNAME=<telegram_bot_username>

# AI
GIGACHAT_CREDENTIALS=<gigachat_credentials>
GIGACHAT_MODEL=<gigachat_model>
```

### Optional Variables

```env
# Stripe
NEXT_STRIPE_PUBLISHABLE_KEY=<stripe_key>
STRIPE_SECRET_KEY=<stripe_secret>
NEXT_STRIPE_PUBLISHABLE_KEY_TEST=<test_key>
STRIPE_SECRET_KEY_TEST=<test_secret>

# Yookassa
YOOKASSA_SHOP_ID=<shop_id>
YOOKASSA_SECRET_KEY=<secret_key>
YOOKASSA_SHOP_ID_TEST=<test_shop_id>
YOOKASSA_SECRET_KEY_TEST=<test_secret_key>

# Cloudflare AI
CLOUDFLARE_ACCOUNT_ID=<account_id>
CLOUDFLARE_API_TOKEN=<api_token>

# Payment Testing
NEXT_DO_TEST_PAYMENTS=true|false

# Debug
NEXT_PUBLIC_DEBUG_TRANSLATIONS=true|false
NEXT_PUBLIC_DEBUG_LOCALE=xx
NEXT_PUBLIC_SHOW_DEBUG_LOCALE=true|false

# User Management
SET_FIRST_USER_ADMIN=true|false
USE_ALLOWED_USERS=true|false
```

---

## Internationalization

### Supported Locales

- `en` - English
- `es` - Spanish
- `ru` - Russian

### Configuration

- Default locale: `en`
- Locale files: `src/i18n/locales/*.json`
- Translation keys follow naming conventions
- Use `useT` hook for translations in components
- Use `getT` function for server-side translations

### Adding New Translations

1. Add locale to `src/i18n/types.ts`
2. Create locale file in `src/i18n/locales/`
3. Add translations for all keys
4. Update `defaultLocale` in configuration if needed

---

## API Structure

### API Routes Location

All API routes are located in `src/app/api/`

### Main API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/topics/*` - Topic management
- `/api/questions/*` - Question management
- `/api/answers/*` - Answer management
- `/api/workouts/*` - Workout management
- `/api/settings/*` - User settings
- `/api/bot/*` - Telegram bot webhook

### Response Format

```typescript
// Success response
{
  success: true,
  data: TData
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

---

## Development Workflow

### Setting Up Development Environment

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (copy `.env.SAMPLE` to `.env`)
4. Set up database: `pnpm prisma-migrate-dev`
5. Run development server: `pnpm dev`

### Making Changes

1. Create feature branch from `main`
2. Make changes following coding standards
3. Run linting: `pnpm lint-all`
4. Run tests: `pnpm test`
5. Commit changes with conventional messages
6. Push and create pull request

### Code Review

- Ensure all linting passes
- Ensure all tests pass
- Check TypeScript compilation
- Review for accessibility
- Check internationalization coverage

---

## Testing Guidelines

### Test Files Location

- Unit tests: `__tests__/` directories
- Component tests: `__tests__/` alongside components
- Action tests: `__tests__/` in feature directories

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test.file.ts

# Run tests with coverage
pnpm test --coverage

# Watch mode
pnpm test-watch
```

### Writing Tests

- Use React Testing Library for components
- Mock external dependencies
- Test happy path and error cases
- Follow AAA pattern (Arrange, Act, Assert)

---

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker

```bash
# Build image
docker build -t mindstack .

# Run container
docker run -p 3000:3000 mindstack
```

### Manual Deployment

1. Build: `pnpm build`
2. Start: `pnpm start`

---

## Troubleshooting

### Common Issues

**Prisma Client Generation Fails**

```bash
pnpm prisma-generate
```

**Database Connection Issues**

- Check `DATABASE_URL` in `.env`
- Ensure database is running
- Run `pnpm prisma-validate`

**TypeScript Errors**

```bash
pnpm check-types
```

**ESLint Issues**

```bash
pnpm eslint-fix
```

### Debug Mode

Set `NEXT_PUBLIC_DEBUG_TRANSLATIONS=true` to see translation keys instead of translated text.

---

## Resources

- **Repository:** https://github.com/lilliputten/mindstack/
- **Live App:** https://mindstack.lilliputten.com/
- **Vercel Deployment:** https://mind-stack-trainer.vercel.app/
- **Project Reference:** https://lilliputten.com/projects/2025/mindstack/

---

## Notes for Developers

### Key Conventions

1. **Imports:** Use absolute imports with `@/` prefix for `src/` directory
2. **Component Naming:** Use PascalCase for components, camelCase for files
3. **Constants:** Use UPPER_SNAKE_CASE for constants
4. **Types:** Prefix types with `T` (e.g., `TUser`, `TWorkout`)
5. **Props:** Use `interface` for component props
6. **Error Handling:** Use custom error classes from `src/lib/errors/`
7. **API Responses:** Use `handleApiResponse` utility for consistent responses

### SCSS Variables

- Theme colors defined in `src/config/themeColors.ts`
- CSS variables generated in `next.config.ts`
- SCSS variables in `src/styles/variables.scss`

### Feature Development

When adding new features:

1. Create feature directory in `src/features/`
2. Define types in `types/` subdirectory
3. Create actions in `actions/` subdirectory
4. Create components in `components/` subdirectory
5. Add React Query hooks in `query-hooks/` subdirectory
6. Update database schema if needed
7. Add internationalization strings
8. Write tests
9. Update documentation

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `pnpm prisma-migrate-dev` to create migration
3. Run `pnpm prisma-generate` to update types
4. Update Zod schemas if needed

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.
