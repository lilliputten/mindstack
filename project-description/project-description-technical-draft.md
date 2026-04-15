# MindStack Technical Architecture Draft

**Status:** In Progress - Step 4
**Date:** 2026-04-14
**Purpose:** Technical overview for developers, architects, and technical reviewers

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Data Pipeline & Generation Workflow](#data-pipeline--generation-workflow)
4. [Text Comparator Module](#text-comparator-module)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment Integration](#payment-integration)
7. [Current Limitations](#current-limitations)
8. [Roadmap & Future Improvements](#roadmap--future-improvements)

---

## Technology Stack

### Core Framework

**Next.js 15.5.7** (App Router)
- Server-side rendering (SSR) and static site generation (SSG)
- React Server Components for performance
- File-based routing with internationalization support
- API routes for backend functionality

**React 19.1.2**
- Latest React features including concurrent rendering
- Client and server component separation
- Modern hooks and context APIs

### Database & ORM

**Prisma 6.18.0**
- Type-safe database client
- Schema-first development
- Automatic migration management
- PostgreSQL database (production)

**Database Features:**
- Hierarchical data model: Categories → Topics → Questions → Answers
- User subscription and payment tracking
- AI generation history and quotas
- Workout/session progress logging

### Backend Services

**Auth.js (NextAuth) 0.40.0**
- OAuth providers: Google, GitHub, **Yandex**
- **OTP authentication: Email and Telegram**
- Session management with JWT
- Role-based access control (guest, basic, pro, premium)

**LangChain 1.0.1** + **Cloudflare AI**
- AI/LLM orchestration framework
- **Cloudflare Workers AI integration** (`@langchain/cloudflare`)
- **Model switching capability** (flexible LLM provider selection)
- Integration with GigaChat (Russian LLM)
- Prompt templating and chaining
- Structured output parsing

**Stripe 20.1.0** + **YooMoney Checkout**
- International payments (Stripe)
- Russian market payments (YooMoney)
- Subscription management
- Webhook handling for payment events

### Frontend Technologies

**UI Component Library:**
- Radix UI primitives (accessible, unstyled components)
- Tailwind CSS for styling
- Custom component system with shadcn/ui patterns
- Lucide React icons

**State Management:**
- React Query (TanStack Query) for server state
- Zustand for client state (ManageTopicsStore)
- Context API for theme, locale, settings

**Rich Text Editing:**
- HeadlessEditor (custom Tiptap-based implementation)
- In-place editing for questions and answers
- Markdown support with GFM (GitHub Flavored Markdown)

### Internationalization

**next-intl 3.26.3**
- Multi-language support (English, Russian, Spanish)
- Locale-based routing (`/[locale]/...`)
- Rich translation values (HTML, links, components)
- Dynamic locale switching

### AI & NLP

**Multi-Provider LLM Integration:**

**Cloudflare Workers AI** (`@langchain/cloudflare`)
- **Flexible model switching** - Can swap between different AI models
- Serverless AI inference at the edge
- Cost-effective for variable workloads
- Integrated via LangChain framework
- Models available: Meta Llama, Mistral, and others (configurable)

**GigaChat Integration** (`gigachat-node`)
- Russian language LLM specialization
- Question and answer generation
- Content summarization and expansion
- Optimized for Cyrillic text processing

**LangChain 1.0.1** (Orchestration Layer)
- Unified interface for multiple LLM providers
- Prompt templating and chaining
- Structured output parsing
- Easy provider switching without code changes

**Natural Language Processing:**
- `multilingual-stemmer` 1.0.2 - Word stemming (WASM-based)
- `stopwords` libraries - Text preprocessing
- Custom text comparator module (see below)

### Development & Build Tools

**TypeScript** - Full type safety across codebase
**ESLint** + **Prettier** - Code quality and formatting
**Jest** + **React Testing Library** - Unit and integration tests
**Husky** + **Commitlint** - Git hooks and commit conventions
**PostCSS** + **Sass** - CSS processing and variables

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Web    │  │  Mobile  │  │ Telegram │             │
│  │  (PWA)   │  │  (PWA)   │  │   Bot    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                 Next.js Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages &    │  │  API Routes  │  │   Middleware │ │
│  │ Components   │  │  (Server)    │  │   (Auth,     │ │
│  │  (Client)    │  │              │  │    i18n)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Topics  │  │   AI     │  │Payments  │             │
│  │ Service  │  │Generation│  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Workouts  │  │  Text    │  │  Users   │             │
│  │ Service  │  │Comparator│  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  Data Layer                              │
│  ┌──────────┐                  ┌──────────┐             │
│  │ Prisma   │                  │  Vercel  │             │
│  │  ORM     │                  │  Blob    │             │
│  └──────────┘                  └──────────┘             │
│         ↓                            ↓                  │
│  ┌──────────┐                  ┌──────────┐             │
│  │PostgreSQL│                  │  Media   │             │
│  │   DB     │                  │ Storage  │             │
│  └──────────┘                  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│               External Services                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐         │
│  │GigaChat  │  │ Cloudflare   │  │ Stripe   │         │
│  │   AI     │  │ Workers AI   │  │Payments  │         │
│  └──────────┘  └──────────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐         │
│  │ YooMoney │  │  Google  │  │   GitHub     │         │
│  │Payments  │  │  OAuth   │  │   OAuth      │         │
│  └──────────┘  └──────────┘  └──────────────┘         │
│  ┌──────────┐                                          │
│  │  Yandex  │                                          │
│  │  OAuth   │                                          │
│  └──────────┘                                          │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

**1. Feature-Sliced Design (FSD)**
- Code organized by business domains (features/)
- Clear separation: entities, features, widgets, pages
- Shared utilities in lib/ and shared/
- See [README.FSD.md](../README.FSD.md) for details

**2. Server-First Approach**
- Maximum logic on server (security, data validation)
- Client components only when interactivity needed
- Server Actions for mutations
- API routes for external integrations

**3. Type Safety Throughout**
- TypeScript strict mode enabled
- Prisma generates types from schema
- Zod schemas for runtime validation
- No `any` types allowed (enforced by ESLint)

---

## Data Pipeline & Generation Workflow

### Content Creation Flow

```
User Input
    ↓
┌─────────────────────┐
│  Create/Edit Topic  │ ← Manual or AI-assisted
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Generate Questions  │ ← GigaChat LLM
│    & Answers        │   (draft mode)
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Validation Loop    │
│  ┌───────────────┐  │
│  │Compare with   │  │ ← Text Comparator
│  │Existing Items │  │   (duplicate check)
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  Edit In-Place│  │ ← HeadlessEditor
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Regenerate if │  │ ← Iterate until satisfied
│  │    Needed     │  │
│  └───────────────┘  │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Approve & Save     │ ← Explicit user action
│  to Database        │   (Prisma transaction)
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Available for      │
│  Training Sessions  │
└─────────────────────┘
```

### Key Characteristics

**1. Generation is Non-Destructive**
- AI-generated content stays in "draft" state
- User must explicitly approve before saving
- Can regenerate unlimited times
- Original manual content preserved

**2. Duplicate Detection Runs Pre-Save**
- Compares new items against existing topic data
- Uses n-gram similarity algorithm (beta)
- Flags potential duplicates for review
- User decides: merge, rephrase, or keep both

**3. Transactional Saves**
- All database operations in Prisma transactions
- Ensures data consistency
- Rolls back on any error
- Validates user ownership/permissions

**4. Audit Trail**
- Tracks generation history per user
- Monitors AI usage quotas
- Logs comparison results
- Stores version history (future)

---

## Text Comparator Module

### Overview

The text comparator is a custom-built module for detecting duplicate and similar questions/answers. Located in `src/packages/text-comparator/`, it uses NLP techniques to compare text similarity.

**Core Class:** `TextComparator` (note: typo in filename `TextComprarator.ts`)

### Algorithm Details

**Two Comparison Methods:**

1. **N-Gram Histogram Intersection (`compareNGrams`)**
   - Breaks text into n-grams (default: 2-grams / bigrams)
   - Creates frequency profiles: `Map<string, number>`
   - Calculates similarity: `Σ min(freq1, freq2) / Σ max(freq1, freq2)`
   - Complexity: O(n) where n = unique n-grams
   - Best for: Medium texts (1000-5000 chars), language-agnostic

2. **Cosine Similarity (`compareTokens`)**
   - Tokenizes text into words
   - Removes stopwords and stems words
   - Creates term frequency vectors
   - Computes cosine of angle between vectors
   - Complexity: O(n + m) construction + O(n) comparison
   - Best for: Order-sensitive comparison, shorter texts

### WASM-Based Stemming

**Multilingual Stemmer:**
- Uses WebAssembly for performance
- Supports English, Russian, Spanish
- Porter stemmer algorithm
- Cached for efficiency (avoid re-initialization)

**Stemming Process:**
```
"running" → "run"
"better" → "better" (English)
"бегающий" → "бег" (Russian)
"corriendo" → "corr" (Spanish)
```

**Why Stemming Matters:**
- "How to run" and "How to running" detected as similar
- Reduces false negatives in duplicate detection
- Language-aware processing

### Stopword Removal

**Purpose:** Remove common words that don't contribute to meaning
- English: "the", "is", "at", "which", etc.
- Russian: "и", "в", "не", "на", etc.
- Spanish: "el", "la", "de", "que", etc.

**Impact:** Improves accuracy by focusing on meaningful terms

### Performance Characteristics

| Text Size | compareNGrams Time | compareTokens Time | Memory Usage |
|-----------|-------------------|-------------------|--------------|
| 100 chars | ~0.1ms | ~0.2ms | ~2-5 KB |
| 500 chars | ~0.3ms | ~0.5ms | ~10-15 KB |
| 2000 chars | ~1ms | ~2ms | ~30-50 KB |
| 5000 chars | ~3ms | ~8ms | ~100-200 KB |

**Threshold:** `similarTreshold = 0.25`
- Scores ≥ 0.25 considered potentially similar
- Tunable based on use case
- Currently used for warning, not blocking

### Current Limitations (Beta Status)

**1. Accuracy Issues:**
- Struggles with paraphrased content (same meaning, different words)
- Semantic similarity not detected (only lexical)
- Short texts may produce false positives
- Long texts may miss subtle duplicates

**Example Problem:**
```
Text A: "What is React useState hook?"
Text B: "Explain the useState hook in React"
→ Low similarity score despite same meaning
```

**2. Language Support:**
- Only EN, RU, ES fully supported
- Other languages fall back to basic tokenization
- Stemming quality varies by language

**3. Performance at Scale:**
- Comparing against 1000+ items becomes slow
- No indexing or caching of comparisons
- Sequential comparison (not parallelized)

**4. No Semantic Understanding:**
- Purely statistical/textual comparison
- Doesn't understand context or meaning
- Can't detect conceptual duplicates

### Usage in Application

**Where Used:**
1. **Question Generation Dialog:** Compares generated questions against existing ones
2. **Answer Validation:** Checks new answers for similarity
3. **Bulk Import:** Validates imported content (future feature)

**User Experience:**
- Shows similarity score (0-100%)
- Highlights potentially duplicate items
- Allows user to: Edit, Regenerate, or Accept anyway
- Non-blocking: Warning only, doesn't prevent save

### Future Improvements Planned

**1. Semantic Similarity:**
- Integrate embeddings (vector similarity)
- Use sentence transformers
- Detect paraphrases and conceptual duplicates

**2. Performance Optimization:**
- Vector database for similarity search (e.g., pgvector)
- Indexing for faster lookups
- Batch comparison support

**3. Improved Algorithms:**
- TF-IDF weighting
- BM25 scoring
- Hybrid approach (lexical + semantic)

**4. Better UI:**
- Side-by-side comparison view
- Highlight differences visually
- Suggest merges automatically

---

## Authentication & Authorization

### Authentication Providers

**OAuth Providers:**
1. **Google OAuth** - Most common, global users
2. **GitHub OAuth** - Developer audience
3. **Yandex OAuth** - Russian market focus

**OTP (One-Time Password):**
1. **Email OTP** - Universal fallback
2. **Telegram OTP** - Growing channel, bot integration

**Implementation:** Auth.js (NextAuth) with custom adapters

### Session Management

**JWT-Based Sessions:**
- Encrypted tokens stored in cookies
- Contains: userId, role, subscription status
- Refresh mechanism for long sessions
- Server-side validation on each request

**Session Data Structure:**
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'guest' | 'basic' | 'pro' | 'premium';
    subscriptionStatus?: 'active' | 'expired' | 'none';
  };
  expires: Date;
}
```

### Role-Based Access Control

**User Roles:**

1. **Guest** (unauthenticated)
   - View public topics and categories
   - Try sample workouts (no progress saved)
   - Limited AI generations (if any)
   - Local-only data storage

2. **Basic** (free, registered)
   - Create private topics
   - Generate questions/answers (limited quota)
   - Run training sessions
   - Track progress history
   - Share topics publicly (optional)

3. **Pro** (paid)
   - Higher AI generation quotas
   - Advanced analytics
   - Priority support
   - Early access to features

4. **Premium** (paid, highest tier)
   - Unlimited AI generations
   - All Pro features
   - Custom branding (future)
   - API access (future)

**Access Control Implementation:**
- Server-side checks in API routes
- Middleware for route protection
- Component-level guards (client-side)
- Database-level ownership validation

### Telegram Bot Integration

**Current Status:** Limited functionality

**Implemented:**
- Authentication via Telegram OTP
- Link Telegram account to MindStack user
- Receive authentication codes

**Planned (Not Yet Implemented):**
- Progress tracking via bot commands
- Payment processing through bot
- Daily reminders for training
- Quick topic creation via chat

**Architecture:**
- Separate bot service (Node.js)
- Webhook integration with main app
- Shared database access
- Telegram Bot API

---

## Payment Integration

### Dual Payment System

**Why Two Systems:**
- **Stripe:** International markets, credit cards, subscriptions
- **YooMoney:** Russian market, local payment methods, compliance

### Stripe Integration

**Features:**
- Subscription management (monthly/yearly)
- One-time payments (future)
- Webhook handling for events
- Customer portal for management

**Implementation:**
- `@stripe/stripe-js` - Client SDK
- `stripe` - Server SDK
- Checkout sessions for payment flow
- Webhooks for: `checkout.session.completed`, `customer.subscription.updated`

**Pricing Tiers:**
- Basic: Free
- Pro: $X/month or $Y/year
- Premium: $A/month or $B/year

*(See `/pricing` page for current prices)*

### YooMoney Integration

**Package:** `@a2seven/yoo-checkout`

**Features:**
- Russian ruble payments
- Local payment methods (Sberbank, Tinkoff, etc.)
- Recurring payments (subscriptions)
- Compliance with Russian regulations

**Implementation:**
- Checkout URL generation
- Payment confirmation webhooks
- Status polling for async confirmations

### Subscription Management

**Database Schema:**
```prisma
model UserSubscription {
  id            String   @id
  userId        String
  plan          String   // "pro" | "premium"
  status        String   // "active" | "cancelled" | "expired"
  periodStart   DateTime
  periodEnd     DateTime
  paymentMethod String   // "stripe" | "yoomoney"
  // ...
}
```

**Quota Enforcement:**
- Check subscription status on AI generation requests
- Track usage counters
- Reset quotas at billing period start
- Graceful degradation when expired

### Payment Flow

```
User Clicks "Upgrade"
    ↓
Choose Plan (Pro/Premium)
    ↓
Choose Billing Period (Monthly/Yearly)
    ↓
Choose Payment Method (Stripe/YooMoney)
    ↓
Redirect to Payment Provider
    ↓
User Completes Payment
    ↓
Webhook Received by MindStack
    ↓
Update Subscription in Database
    ↓
Grant Access to Premium Features
    ↓
Notify User (email/in-app)
```

---

## Current Limitations

### Technical Limitations

**1. Text Comparator (Beta)**
- **Issue:** Only detects lexical similarity, not semantic
- **Impact:** Paraphrased duplicates may be missed
- **Workaround:** Manual review still recommended
- **Priority:** High - core differentiator feature

**2. AI Generation Quality**
- **Issue:** GigaChat primarily optimized for Russian
- **Impact:** English/Spanish generation quality varies
- **Workaround:** User editing and regeneration
- **Priority:** Medium - depends on user base geography

**3. No Real-Time Collaboration**
- **Issue:** Topics can't be edited by multiple users simultaneously
- **Impact:** Team collaboration limited
- **Workaround:** Export/import workflow (manual)
- **Priority:** Low - not core to personal-first positioning

**4. Limited Offline Support**
- **Issue:** PWA caching incomplete
- **Impact:** Can't train fully offline
- **Workaround:** Plan sessions while online
- **Priority:** Medium - important for mobile users

**5. Telegram Bot Functionality**
- **Issue:** Only authentication implemented
- **Impact:** Missed engagement opportunity
- **Workaround:** Use web app for full features
- **Priority:** Medium - planned for Q2 2026

### Scalability Limitations

**1. Database Query Performance**
- **Issue:** No query optimization for large topic libraries
- **Impact:** Slow loading with 1000+ topics
- **Current State:** Acceptable for typical users (<100 topics)
- **Future:** Implement pagination, indexing, caching

**2. AI Generation Rate Limits**
- **Issue:** GigaChat API has throughput limits
- **Impact:** Concurrent generations may queue
- **Mitigation:** User quotas prevent abuse
- **Future:** Multiple LLM providers for load balancing

**3. Image/Asset Storage**
- **Issue:** Using Vercel Blob (cost at scale)
- **Impact:** High storage costs with many screenshots
- **Current:** Manageable for current usage
- **Future:** Consider CDN or self-hosted solution

### Feature Gaps

**1. No Mobile App (Native)**
- **Status:** PWA only
- **Limitation:** No push notifications, limited offline
- **User Impact:** Moderate - PWA works but not ideal
- **Plan:** Evaluate React Native or Flutter in future

**2. Limited Analytics**
- **Status:** Basic progress tracking only
- **Missing:** Learning curves, retention analysis, A/B testing
- **Impact:** Users can't optimize study habits deeply
- **Plan:** Enhanced analytics dashboard (Premium feature)

**3. No API for Developers**
- **Status:** Internal APIs only
- **Missing:** Public REST/GraphQL API
- **Impact:** Can't integrate with external tools
- **Plan:** API v1 after core product stabilization

**4. Category Creation Bottleneck**
- **Status:** Admin approval required
- **Issue:** Slows down content organization
- **Workaround:** Request form with manual review
- **Future:** Community-driven category suggestions with voting

### Known Bugs & Issues

*(Refer to GitHub Issues for current list)*

**High Priority:**
- Issue #XX: Text comparator false positives with short texts
- Issue #YY: Session timeout during long training sessions

**Medium Priority:**
- Issue #ZZ: Translation inconsistencies in Spanish locale
- Issue #AA: Mobile panel overflow on small screens

---

## Roadmap & Future Improvements

### Short-Term (Q2 2026)

**1. Text Comparator Enhancements**
- [ ] Add semantic similarity via embeddings
- [ ] Implement vector database (pgvector)
- [ ] Improve UI for comparison results
- [ ] Add batch comparison mode
- **Expected Impact:** 50% better duplicate detection accuracy

**2. Telegram Bot Expansion**
- [ ] Progress tracking commands (`/progress`, `/stats`)
- [ ] Daily training reminders
- [ ] Quick topic creation via chat
- [ ] Payment link generation
- **Expected Impact:** 30% increase in daily active users

**3. Mobile Experience Improvements**
- [ ] Optimize PWA offline caching
- [ ] Improve touch interactions
- [ ] Add swipe gestures for training
- [ ] Better mobile editor UX
- **Expected Impact:** 40% increase in mobile session duration

**4. Performance Optimizations**
- [ ] Implement React Server Components more extensively
- [ ] Add server-side caching for frequent queries (in-memory or CDN)
- [ ] Optimize image loading (lazy, WebP)
- [ ] Database query optimization
- **Expected Impact:** 50% faster page loads

### Mid-Term (Q3-Q4 2026)

**1. Advanced AI Features**
- [x] Multi-LLM support via Cloudflare Workers AI (model switching implemented)
- [ ] Add OpenAI/Anthropic as additional fallback providers
- [ ] Smart topic suggestions based on user interests
- [ ] Automated difficulty assessment
- [ ] Content expansion from URLs/documents
- **Expected Impact:** 2x faster topic creation

**2. Collaboration Features**
- [ ] Shared topic editing (real-time)
- [ ] Team workspaces
- [ ] Comment/discussion on questions
- [ ] Version history and rollback
- **Expected Impact:** Open B2B/education market segment

**3. Analytics Dashboard**
- [ ] Learning curve visualization
- [ ] Retention rate tracking
- [ ] Weak area identification
- [ ] Study habit recommendations
- **Expected Impact:** Premium conversion rate +15%

**4. Public API (v1)**
- [ ] REST API for CRUD operations
- [ ] Webhook support for events
- [ ] API documentation and SDKs
- [ ] Developer portal
- **Expected Impact:** Integration ecosystem growth

### Long-Term (2027+)

**1. Native Mobile Apps**
- [ ] iOS app (Swift/SwiftUI)
- [ ] Android app (Kotlin/Jetpack Compose)
- [ ] Cross-platform sync
- [ ] Push notifications
- **Expected Impact:** 3x user acquisition

**2. Enterprise Features**
- [ ] SSO integration (SAML, OIDC)
- [ ] Admin dashboard for teams
- [ ] Compliance reporting (GDPR, SOC2)
- [ ] Custom branding
- **Expected Impact:** B2B revenue stream

**3. Advanced NLP**
- [ ] Full semantic understanding
- [ ] Automatic question categorization
- [ ] Difficulty prediction
- [ ] Personalized learning paths
- **Expected Impact:** AI becomes true co-pilot

**4. Marketplace**
- [ ] Paid topic templates
- [ ] Creator economy
- [ ] Revenue sharing
- [ ] Quality ratings and reviews
- **Expected Impact:** Network effects, user-generated content boom

### Technical Debt Reduction

**Ongoing Priorities:**

1. **Type Safety**
   - Eliminate remaining `any` types
   - Improve Zod schema coverage
   - Add runtime type guards

2. **Test Coverage**
   - Increase unit test coverage to 80%+
   - Add E2E tests for critical flows
   - Performance regression tests

3. **Code Quality**
   - Refactor legacy components
   - Improve component reusability
   - Document complex algorithms

4. **Security**
   - Regular dependency updates
   - Security audits (quarterly)
   - Penetration testing (annual)

5. **Documentation**
   - API documentation (when public API launches)
   - Architecture decision records (ADRs)
   - Onboarding guide for contributors

---

## Development Guidelines

### Code Standards

**TypeScript:**
- Strict mode enabled
- No `any` types (ESLint rule)
- Explicit return types for public APIs
- Interface over type when possible

**Component Structure:**
```typescript
'use client'; // or 'use server'

import React from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  const t = useT();

  return (
    <div className={cn('base-styles', 'conditional-styles')}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

**Server Actions:**
- Always validate input with Zod
- Check user authentication/authorization
- Use Prisma transactions for multiple writes
- Return structured responses (success/error)

**Example:**
```typescript
'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

const createTopicSchema = z.object({
  title: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  isPublic: z.boolean().default(false),
});

export async function createTopic(input: unknown) {
  // Validate input
  const validated = createTopicSchema.parse(input);

  // Check authentication
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // Perform operation in transaction
  return await prisma.$transaction(async (tx) => {
    const topic = await tx.topic.create({
      data: {
        ...validated,
        userId: user.id,
      },
    });

    return { success: true, topic };
  });
}
```

### Testing Strategy

**Unit Tests:**
- Test pure functions and utilities
- Mock external dependencies
- Aim for 80%+ coverage on critical paths

**Integration Tests:**
- Test API routes end-to-end
- Verify database interactions
- Test authentication flows

**E2E Tests:**
- Critical user journeys (signup, create topic, train)
- Payment flow testing
- Cross-browser compatibility

**Performance Tests:**
- Lighthouse scores monitoring
- Bundle size budgets
- API response time SLAs

### Deployment Process

**Environments:**
1. **Development:** Local development
2. **Staging:** Preview deployments (Vercel)
3. **Production:** Main application

**CI/CD Pipeline:**
1. Push to GitHub
2. Run linting and type checking
3. Execute test suite
4. Build application
5. Deploy to staging (preview URL)
6. Manual QA approval
7. Deploy to production

**Rollback Strategy:**
- Vercel instant rollbacks
- Database migrations reversible
- Feature flags for gradual rollout

---

## Conclusion

MindStack represents a modern approach to personal knowledge management, combining:

✅ **Cutting-edge stack:** Next.js 15, React 19, Prisma, TypeScript
✅ **AI-powered workflows:** GigaChat integration for content generation
✅ **Quality-focused design:** Validation loops, duplicate detection
✅ **Privacy-first architecture:** Private by default, user-controlled sharing
✅ **Scalable foundation:** Feature-sliced design, type safety, testing

**Current Focus:** Perfecting the personal training creation experience
**Next Steps:** Enhancing text comparator, expanding Telegram bot, improving mobile UX
**Vision:** Become the go-to platform for personalized, AI-assisted learning systems

---

## Appendix

### Useful Links

- **Repository:** [GitHub Link]
- **Documentation:** `/docs` route in application
- **API Documentation:** [Future: Swagger/OpenAPI]
- **Changelog:** [CHANGELOG.md](../CHANGELOG.md)
- **Contributing:** [CONTRIBUTING.md] (future)

### Contact

- **Technical Questions:** [tech@mindstack.app]
- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions

### License

MIT License - See [LICENSE](../LICENSE) file

---

**Document Version:** 1.0
**Last Updated:** 2026-04-14
**Maintained By:** MindStack Development Team

