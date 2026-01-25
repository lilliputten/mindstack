<!--
 @since 2025.07.05
 @changed 2026.01.26, 01:16
-->

# MindStack Memory Trainer

NextJS Memory Training Application for interactive learning and spaced repetition practice.

## Build info (auto-generated)

![Application](public/static/opengraph-image.jpg 'Application')

- Project info: v.0.1.0 / 2026.01.26 01:17:35 +0300

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
- **Next.js 15** - React framework with App Router
- **TypeScript** - Full type safety
- **React 19** - Latest React features
- **Prisma 6** - Type-safe database ORM
- **PostgreSQL** - Production database

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible UI primitives
- **SCSS/Sass** - Advanced styling with CSS variables
- **next-themes** - Dark/light mode support

### State Management
- **React Query (TanStack Query 5)** - Server state management
- **Zustand 5** - Client state management
- **React Context** - Local component state

### Authentication & Validation
- **NextAuth.js 5** - Multi-provider authentication
- **Zod** - Schema validation
- **Telegram Auth** - Secure Telegram integration

### AI Integration
- **GigaChat** - AI content generation
- **LangChain** - AI model orchestration
- **Cloudflare Workers AI** - Alternative AI provider

### Payments
- **Stripe** - International payments
- **Yookassa** - Russian payment processing

### Testing & Quality
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Stylelint** - CSS/SCSS linting

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
Required variables in `.env`:
```env
# App Configuration
NEXT_PUBLIC_URL=your_app_url
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=your_auth_url

# AI (Optional)
GIGACHAT_CREDENTIALS=your_gigachat_credentials
GIGACHAT_MODEL=your_gigachat_model
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
- English (`en`) - Default
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

This project is licensed under the ISC License - see the LICENSE file for details.

## ?? Support

- **Issues**: https://github.com/lilliputten/mindstack/issues
- **Email**: lilliputten@gmail.com
- **Documentation**: https://mindstack.lilliputten.com/

## 🔗 Resources

- **Live Application**: https://mindstack.lilliputten.com/
- **Vercel Deployment**: https://mind-stack-trainer.vercel.app/
- **GitHub Repository**: https://github.com/lilliputten/mindstack/
- **Project Reference**: https://lilliputten.com/projects/2026/mindstack/
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
