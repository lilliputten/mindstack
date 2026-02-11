<!--
 @since 2025.07.05
 @changed 2026.02.08, 05:15
-->

# MindStack Memory Trainer

NextJS Memory Training Application for interactive learning and spaced repetition practice.

![Application](public/static/opengraph-image-v2.jpg 'Application Splash')

## ℹ️ Build info (auto-generated)

- Project info: v.0.1.3 / 2026.02.12 01:43:57 +0300

## 🌟 Overview

MindStack is a modern memory training application that helps users create, organize, and practice learning materials through interactive workouts. Built with Next.js 15 and TypeScript, it provides a comprehensive platform for knowledge retention using spaced repetition techniques and active recall.

- **Repository:** https://github.com/lilliputten/mindstack/
- **Live Application:** https://mindstack.lilliputten.com/
- **Vercel Deployment:** https://mind-stack-trainer.vercel.app/
- **Project reference:** https://lilliputten.com/projects/2026/mindstack/

![Application Preview](public/static/opengraph-image.jpg 'MindStack Memory Trainer')

## 🚀 Core Features

### ✅ Implemented Features

**Learning & Practice**

- Interactive workout sessions with spaced repetition algorithms
- Progress tracking and statistics for each topic
- Public topics available without authorization (limited analytics)
- Custom question and answer creation
- Topic categorization and tagging system
- Multi-language topic support (predefined and custom languages)

**Content Management**

- Create, edit, and manage topics with questions and answers
- Mark topics as private or share them with other users
- AI-powered question and answer generation
- Advanced topic search with multiple parameters
- Category management for topic organization

**Payment & Subscriptions**

- International payment processing via Stripe
- Russian payment processing via YooKassa
- Multiple subscription tiers (Basic, Pro, Premium, Unlimited)
- Payment status tracking and management

**Authentication & Security**

- Multiple OAuth providers: GitHub, Google, Yandex
- Email-based authentication
- Telegram bot authentication (via OTP)
- Role-based access control (USER, ADMIN)
- User grade system with tiered features

**Internationalization**

- Full interface support for English, Spanish, and Russian
- Dynamic language switching
- Automatic locale detection
- Language-specific topic support

### 🔮 Planned Features

**Content Enhancement**

- Custom illustrations for questions and answers
- AI-generated preview images for questions and answers
- Main page display of recent and popular topics

**User Experience**

- Link multiple authorized accounts
- Telegram bot statistics tracking
- In-app, email, and Telegram notifications
- User comparison and achievement sharing
- Badges and achievement system

**Advanced Features**

- Enhanced statistics and analytics dashboard
- Social sharing of topics and achievements
- Collaborative topic editing
- Export/import functionality for topics

## 🛠️ Technology Stack

### Core Framework

- **Next.js 15** — React framework with App Router
- **TypeScript** — Full type safety
- **React 19** — Latest React features
- **Prisma 6** — Type-safe database ORM
- **PostgreSQL** — Production database

### Styling & UI

- **Tailwind CSS 3.4** — Utility-first CSS framework
- **Radix UI** — Accessible UI primitives
- **SCSS/Sass** — Advanced styling with CSS variables
- **next-themes** — Dark/light mode support

### State Management

- **React Query (TanStack Query 5)** — Server state management
- **Zustand 5** — Client state management
- **React Context** — Local component state

### Authentication & Validation

- **NextAuth.js 5** — Multi-provider authentication
- **Zod** — Schema validation
- **Telegram Auth** — Secure Telegram integration

### AI Integration

- **LangChain** — AI model orchestration
- **GigaChat** — AI content generation (with different available model levels, `GIGACHAT_MODEL`: 'GigaChat' | 'GigaChat-Pro' | 'GigaChat-Max')
- **Cloudflare AI** — Alternative AI provider

See environment variable parameters.

### Payments

- **Stripe** — International payments
- **Yookassa** — Russian payment processing

### Testing & Quality

- **Jest** — Testing framework
- **React Testing Library** — Component testing
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Stylelint** — CSS/SCSS linting

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

- **Issues**: https://github.com/lilliputten/mindstack/issues
- **Email**: lilliputten@gmail.com
- **Documentation**: https://mindstack.lilliputten.com/

## 🔗 Resources

- **Live Application**: https://mindstack.lilliputten.com/
- **Vercel Deployment**: https://mind-stack-trainer.vercel.app/
- **GitHub Repository**: https://github.com/lilliputten/mindstack/
- **Project Reference**: https://lilliputten.com/projects/2026/mindstack/

---

See [CHANGELOG.md](CHANGELOG.md) for recent updates info.

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
