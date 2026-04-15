# MindStack - Personal Knowledge Training Platform

Next.js application for creating and running repetition trainings from your own topics and datasets.

## ℹ️ Build info (auto-generated)

- Project info: v.0.1.5 / 2026.04.15 04:59:01 +0300

## 🌟 Overview

**MindStack helps you turn your own knowledge into repeatable trainings.** Instead of using generic public courses, you build personal training systems from your real work materials, study subjects, or technical references. The platform provides tools for creating question-answer datasets, validating them with AI assistance, and practicing through spaced repetition—all in one streamlined workflow.

The core promise is simple: **a convenient and controllable way to systematize and train your personal knowledge**.

### Key Differentiators

✅ **Personal-first approach** — Create trainings from your own data, not someone else's curriculum
✅ **Generation control** — Review and edit AI-generated content before saving; regenerate until quality meets your standards
✅ **Duplicate detection** — Beta similarity algorithms help catch duplicate or near-duplicate items as your dataset grows
✅ **In-place editing** — Edit questions and answers directly in the training interface using HeadlessEditor
✅ **Privacy by default** — Keep topics private for personal use, share publicly only when you choose
✅ **Structured hierarchy** — Categories → Topics → Questions → Answers keeps everything organized

### Quick Links

- **Repository:** [https://github.com/lilliputten/mindstack/](https://github.com/lilliputten/mindstack/)
- **Live Application:** [https://mindstack.lilliputten.com/](https://mindstack.lilliputten.com/)
- **Vercel Deployment:** [https://mind-stack-trainer.vercel.app/](https://mind-stack-trainer.vercel.app/)
- **Project Reference:** [https://lilliputten.com/projects/2026/mindstack/](https://lilliputten.com/projects/2026/mindstack/)
- **Pricing & Plans:** [https://mindstack.lilliputten.com/pricing](https://mindstack.lilliputten.com/pricing)

Application Preview

## 🚀 Core Features

### ✅ Implemented Features

**Content Creation & Management**

- Create topics from your own knowledge areas (work, studies, interests)
- Write questions and answers manually or generate with AI assistance
- **In-place editing** via HeadlessEditor — no context switching needed
- **Duplicate detection** — compare new items against existing ones to maintain dataset quality
- **Generation review loop** — edit, regenerate, or discard AI drafts before saving
- Hierarchical organization: Categories → Topics → Questions → Answers
- Mark topics as private (default) or share publicly with community
- Multi-language support for topics and interface (English, Spanish, Russian)

**Training & Practice**

- Interactive workout sessions using spaced repetition algorithms
- Progress tracking with detailed statistics per topic
- Start training immediately after creating first question
- Guest mode for exploring public topics (no account required)
- Performance history and retention metrics for registered users

**AI-Powered Assistance**

- Generate questions and answers instantly using LangChain + multiple LLM providers
- **Cloudflare Workers AI** — flexible model switching (Meta Llama, Mistral, etc.)
- **GigaChat** — optimized for Russian language content generation
- Structured output parsing for consistent JSON responses
- Generation quota tracking based on subscription tier

**Authentication & Access Control**

- Multiple OAuth providers: Google, GitHub, Yandex
- Email OTP authentication
- Telegram bot OTP authentication
- Role-based access: Guest, Basic (free), Pro, Premium
- User grade system with progressive feature unlocking

**Payment & Subscriptions**

- International payments via Stripe (credit cards, subscriptions)
- Russian market payments via YooMoney (local payment methods)
- Multiple subscription tiers with different AI generation quotas
- Payment status tracking and automatic renewal management

**Internationalization**

- Full UI translation: English, Spanish, Russian
- Dynamic locale switching without page reload
- Automatic locale detection from browser/system
- Language-specific topic categorization

### 🔮 Planned Features

**Enhanced AI Capabilities**

- Semantic similarity detection (beyond current lexical comparison)
- Vector database integration for faster duplicate searches
- Smart topic suggestions based on user interests
- Content expansion from URLs or uploaded documents
- Additional LLM providers (OpenAI, Anthropic) as fallback options

**Telegram Bot Expansion**

- Progress tracking commands (`/progress`, `/stats`)
- Daily training reminders and notifications
- Quick topic creation via chat interface
- Payment link generation through bot

**Mobile Experience**

- Enhanced PWA offline caching for training without internet
- Improved touch interactions and swipe gestures
- Better mobile editor UX for small screens
- Potential native apps (iOS/Android) in long-term roadmap

**Collaboration & Social**

- Real-time shared topic editing for teams
- Comment and discussion threads on questions
- Version history and rollback functionality
- Team workspaces with admin controls

**Advanced Analytics**

- Learning curve visualization
- Weak area identification and recommendations
- Study habit analysis and optimization tips
- Exportable reports for premium users

**Developer Ecosystem**

- Public REST API for CRUD operations
- Webhook support for external integrations
- API documentation and SDKs
- Developer portal with usage examples

## 🛠️ Technology Stack

### Core Framework

- **Next.js 15.5.7** — React framework with App Router, SSR, and SSG
- **TypeScript 5.8.3** — Full type safety across codebase (strict mode, no `any`)
- **React 19.1.2** — Latest React features including concurrent rendering
- **Prisma 6.18.0** — Type-safe database ORM with automatic migrations
- **PostgreSQL** — Production relational database

### Styling & UI

- **Tailwind CSS 3.4** — Utility-first CSS framework
- **Radix UI** — Accessible, unstyled UI primitives
- **SCSS/Sass** — Advanced styling with CSS variables and theming
- **next-themes** — Dark/light/high-contrast theme support
- **Lucide React** — Consistent icon system

### State Management

- **React Query (TanStack Query 5.85.3)** — Server state management and caching
- **Zustand 5.0.8** — Lightweight client state management
- **React Context** — Theme, locale, and settings providers

### Authentication & Security

- **Auth.js (NextAuth) 5.0.0-beta.29** — Multi-provider authentication
- **OAuth Providers:** Google, GitHub, Yandex
- **OTP Methods:** Email, Telegram bot
- **Zod** — Runtime schema validation for inputs and API responses
- **JWT Sessions** — Encrypted tokens with server-side validation

### AI Integration

- **LangChain 1.0.1** — LLM orchestration framework with unified provider interface
- **Cloudflare Workers AI** (`@langchain/cloudflare`) — Flexible model switching capability
  - Supports Meta Llama, Mistral, and other configurable models
  - Serverless edge inference for cost-effective scaling
- **GigaChat** (`gigachat-node`) — Russian language LLM specialization
  - Multiple model tiers: GigaChat, GigaChat-Pro, GigaChat-Max
  - Optimized for Cyrillic text processing
- **Natural Language Processing:**
  - `natural` 8.1.0 — General NLP toolkit
  - `multilingual-stemmer` 1.0.2 — WASM-based word stemming (EN, RU, ES)
  - Custom text comparator module (beta similarity detection)

See environment variable parameters for AI configuration details.

### Payments

- **Stripe 20.1.0** — International payment processing and subscription management
- **YooMoney Checkout** (`@a2seven/yoo-checkout`) — Russian market payments and compliance

### Testing & Quality

- **Jest 29.7.0** — Unit and integration testing framework
- **React Testing Library 16.0.1** — Component testing with user interaction simulation
- **ESLint** — Code linting with TypeScript strict rules
- **Prettier** — Consistent code formatting
- **Stylelint** — CSS/SCSS linting and style enforcement
- **Husky + Commitlint** — Git hooks for commit message conventions

### Internationalization

- **next-intl 3.26.3** — Multi-language support with locale-based routing
- Rich translation values (HTML, links, components)
- Dynamic locale switching without page reload
- Automatic locale detection from browser/system

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm package manager

### Quick Start

```bash
# Clone the repository
git clone https://github.com/lilliputten/mindstack.git
cd mindstack

# Install dependencies
pnpm install

# Setup environment variables
cp .env.SAMPLE .env
# Edit .env with your configuration

# Setup database
pnpm prisma-migrate-dev

# Start development server
pnpm dev
```

### Environment Variables

Copy `.env.SAMPLE` to `.env` and configure the following variables. For a complete reference, see the [.env.SAMPLE](.env.SAMPLE) file.

**Application Configuration**

```env
NEXT_PUBLIC_URL="https://your-domain.com"      # Public application URL
NODE_ENV="development"                         # Environment: development/production
NEXTAUTH_URL="https://your-domain.com"         # NextAuth return URL
NEXT_PUBLIC_DEFAULT_LANGUAGE="en"              # Default interface language
NEXT_PUBLIC_DEBUG_TRANSLATIONS=false           # Show translation keys instead of text
NEXT_PUBLIC_DEBUG_LOCALE="xx"                  # Debug locale for testing
```

**Database**

```env
DATABASE_URL="postgresql://user:password@host:port/database"  # PostgreSQL connection string
```

**Authentication & Security**

```env
AUTH_SECRET="your-secret-key"                  # NextAuth.js secret key
SET_FIRST_USER_ADMIN=true                      # Make first registered user admin
USE_ALLOWED_USERS=false                        # Restrict signups to allowed users

# OAuth Providers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
YANDEX_CLIENT_ID=""
YANDEX_CLIENT_SECRET=""

# Email Configuration (for email authentication)
EMAIL_FROM_NAME="MindStack"
EMAIL_FROM="noreply@your-domain.com"
EMAIL_HOST="smtp.your-email-provider.com"
EMAIL_PORT=587
EMAIL_USE_SSL=false
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""
EMAIL_TEST_USER=""                             # Test email address
```

**Payment Systems**

```env
# Debug & Testing
NEXT_DO_TEST_PAYMENTS=false                    # Enable test payments
USE_FAKE_PRICES=false                          # Use fake prices for testing

# Stripe (International Payments)
NEXT_STRIPE_PUBLISHABLE_KEY=""                 # Stripe publishable key
STRIPE_SECRET_KEY=""                           # Stripe secret key
NEXT_STRIPE_PUBLISHABLE_KEY_TEST=""            # Stripe test publishable key
STRIPE_SECRET_KEY_TEST=""                      # Stripe test secret key

# YooKassa (Russian Payments)
YOOKASSA_SHOP_ID=""                            # YooKassa shop ID
YOOKASSA_SECRET_KEY=""                         # YooKassa secret key
YOOKASSA_SHOP_ID_TEST=""                       # YooKassa test shop ID
YOOKASSA_SECRET_KEY_TEST=""                    # YooKassa test secret key
```

**AI Integration**

```env
# Trying to use low temperatures in attempt to minify json hallucinations
NEXT_PUBLIC_GENERATION_TEMPERATURE=0.1

# Cloudflare AI
CLOUDFLARE_ACCOUNT_ID=""                       # Cloudflare account ID
CLOUDFLARE_API_TOKEN=""                        # Cloudflare API token

# GigaChat AI
GIGACHAT_CREDENTIALS=""                        # GigaChat credentials
GIGACHAT_MODEL=""                              # GigaChat model name
LANGSMITH_TRACING=true                         # Enable LangChain tracing

# LangSmith (Optional)
LANGSMITH_API_KEY=""                           # LangSmith API key for advanced tracing
```

**Telegram Integration**

```env
# Telegram Bot Configuration
BOT_TOKEN=""                                   # Telegram bot token
BOT_TOKEN_TEST=""                              # Test bot token
BOT_USERNAME=""                                # Bot username
BOT_USERNAME_TEST=""                           # Test bot username
BOT_ADMIN_USERNAME=""                          # Bot admin username
BOT_ADMIN_USERID=000000000                     # Bot admin user ID

# Telegram Channels
LOGGING_CHANNEL_ID="-0000000000000"            # Logging Telegram channel ID
CONTROLLER_CHANNEL_ID="-0000000000000"         # Controller Telegram channel ID
WEBHOOK_HOST=""                                # Webhook host URL for bot

# Webhook registration template:
# curl https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={WEBHOOK_HOST}/api/bot
```

**Additional Services**

```env
# Exchange Rate API
EXCHANGERATE_API_KEY=""                        # Exchange rate API key for currency conversion

# Vercel Blob Storage
VERCEL_BLOB_READ_WRITE_TOKEN=""                # Vercel blob storage read/write token
VERCEL_BLOB_HOST="*.public.blob.vercel-storage.com"  # Blob storage host domain

# Email Server Configuration
BROWSER="none"                                 # Disable browser auto-opening
```

## 🏗️ Project Structure

```
mindstack/
├── prisma/                    # Database schema and migrations
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── auth/                  # Authentication configuration
│   ├── components/            # UI Components
│   │   ├── ui/                # Base UI components
│   │   ├── screens/           # Page screens
│   │   ├── layout/            # Layout components
│   │   └── shared/            # Shared utilities
│   ├── features/              # Feature modules
│   │   ├── workouts/          # Workout functionality
│   │   ├── topics/            # Topic management
│   │   ├── ai/                # AI features
│   │   └── payments/          # Payment processing
│   ├── lib/                   # Core libraries
│   ├── hooks/                 # Custom React hooks
│   └── i18n/                  # Internationalization
├── public/                    # Static assets
└── .utils/                    # Utility scripts
```

## 🚀 Development

### Available Scripts

**Development**

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
```

**Database Operations**

```bash
pnpm prisma-generate     # Generate Prisma client
pnpm prisma-migrate-dev  # Run database migrations
pnpm prisma-studio       # Database GUI
```

**Code Quality**

```bash
pnpm lint-all      # Run all linting checks
pnpm check-types   # TypeScript type checking
pnpm test          # Run test suite
```

**Maintenance**

```bash
pnpm clear-all     # Clear all caches
pnpm sort-locales  # Sort translation files
```

### Development Workflow

1. **Create Feature Branch**: Branch from `main`
2. **Implement Changes**: Follow coding standards
3. **Run Checks**: `pnpm lint-all && pnpm test`
4. **Commit**: Use conventional commit messages
5. **Create PR**: Push and create pull request

## 🧪 Testing

The project uses Jest and React Testing Library for comprehensive testing:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test.file.ts

# Run tests with coverage
pnpm test --coverage

# Watch mode for development
pnpm test-watch
```

## 🌍 Internationalization

### Supported Languages

- English (`en`) — Default
- Spanish (`es`)
- Russian (`ru`)

### Adding Translations

1. Update `src/i18n/types.ts` with new locale
2. Add locale file in `src/i18n/locales/`
3. Use `useT` hook in components for translations

## 📊 Database Schema

Key models include:

- **User**: Core user entity with roles and subscriptions
- **Topic**: Learning topics with questions
- **Question & Answer**: Quiz content
- **WorkoutStats**: Progress tracking
- **Category**: Topic categorization
- **UserPayment**: Payment records
- **AIGeneration**: AI usage tracking

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Automatic deployments on push to `main`

### Manual Deployment

```bash
# Build and start
pnpm build
pnpm start

# Or use Docker
docker build -t mindstack .
docker run -p 3000:3000 mindstack
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Write tests for new features
5. Submit a pull request

### Coding Standards

- Use TypeScript strictly (no `any` types)
- Follow existing project patterns
- Write comprehensive tests
- Update documentation for new features
- Use Tailwind CSS for styling
- Follow internationalization practices

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## ☂ Support

- **Issues**: [https://github.com/lilliputten/mindstack/issues](https://github.com/lilliputten/mindstack/issues)
- **Email**: [lilliputten@gmail.com](mailto:lilliputten@gmail.com)
- **Documentation**: [https://mindstack.lilliputten.com/](https://mindstack.lilliputten.com/)

## 🔗 Resources

- **Live Application**: [https://mindstack.lilliputten.com/](https://mindstack.lilliputten.com/)
- **Vercel Deployment**: [https://mind-stack-trainer.vercel.app/](https://mind-stack-trainer.vercel.app/)
- **GitHub Repository**: [https://github.com/lilliputten/mindstack/](https://github.com/lilliputten/mindstack/)
- **Project Reference**: [https://lilliputten.com/projects/2026/mindstack/](https://lilliputten.com/projects/2026/mindstack/)

<a href="https://www.producthunt.com/products/mindstack-personal-knowledge-trainer?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-mindstack-personal-knowledge-trainer" target="_blank" rel="noopener noreferrer"><img alt="MindStack: Personal Knowledge Trainer - Turn Your Knowledge Into Repeatable Trainings | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1124734&amp;theme=light&amp;t=1776288902603"></a>

---

See [CHANGELOG.md](CHANGELOG.md) for recent updates info.

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
