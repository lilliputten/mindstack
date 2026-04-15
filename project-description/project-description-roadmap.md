# Project Description Roadmap

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done.

## Goal

Rebuild the product positioning around the core value: **MindStack helps users create and run repetition trainings for their own private topics and real use cases**, not generic public learning content.

## Step-by-Step TODO

### Step 1. Positioning Draft (core message and user value)

- [x] Re-formulate project goal with focus on "create your own trainings".
- [x] Define main user advantages and practical outcomes.
- [x] Add feature notes and constraints (beta compare algorithms, generation review loop).
- [x] Prepare a reusable base text for content pages and third-party reviews.
- Output file: `project-description-positioning.md`

### Step 2. Product Structure Draft (data and pages)

- [x] Describe hierarchical data model: categories -> topics -> questions -> answers.
- [x] Describe how trainings consume this structure.
- [x] Document key page relationships and user flows (guest vs registered vs paid).
- [x] Add links to related product pages (`/pricing`, categories, topics, start flow).
- Output file: `project-description-structure.md`

### Step 3. Landing Rewrite Plan (section-by-section copy and visuals)

- [x] Keep current landing section structure and rewrite each section intent.
- [x] Propose new titles, descriptions, card texts, CTA copy.
- [x] Propose screenshot-first illustration strategy (what to capture per section).
- [x] Define which sections should be reframed vs simplified.
- [x] Replace weak "learning-only" framing with "build your own training pipeline".
- [x] Output file: `landing-rewrite-draft.md` - Comprehensive section-by-section proposals created
- [x] Output file: `additional-content-ideas.md` - Supplementary strategic suggestions
- [x] Output file: `landing-changes-summary.md` - Quick reference implementation guide
- [x] Output file: `landing-screenshots.md` - Real app screenshots catalog (pre-existing)
- [x] Output file: `landing-visual-flow.md` - Visual diagrams and comparisons
- [x] Output file: `step-3-completion-summary.md` - Phase completion summary
- [x] Mapped all sections to real screenshots from landing-screenshots.md
- [x] All auxiliary files organized in project-description/ folder
- [x] Awaiting your review and approval before proceeding to implementation (Step 5)

### Step 4. Technical Article Draft (architecture and stack)

- [x] Create technical overview draft: stack, data pipeline, generation and validation cycle.
- [x] Explain text comparator module and current beta limitations.
- [x] Describe auth options, pricing tiers, and payment integrations at system level.
- [x] Add section for current limitations and near-term roadmap (Telegram bot, algorithm improvements).
- [x] Output file: `project-description-technical-draft.md` - Comprehensive technical architecture document
- [x] Covered: Technology stack, system architecture, data pipeline, text comparator details
- [x] Covered: Authentication, authorization, payment integration (Stripe + YooMoney)
- [x] Covered: Current limitations (beta features, scalability, feature gaps)
- [x] Covered: Roadmap (short-term Q2 2026, mid-term Q3-Q4 2026, long-term 2027+)
- [x] Covered: Development guidelines, code standards, testing strategy, deployment process

### Step 5. Landing Implementation (content + translations)

- [x] Create detailed implementation plan: `project-description/step-5-landing-update-plan.md`
- [x] Plan includes: Phase-by-phase instructions for all locale files (en, ru, es)
- [x] Plan includes: Component update guidelines with screenshot mappings
- [x] Plan includes: Complete testing checklist (functional, responsive, accessibility, performance)
- [x] Plan includes: Deployment preparation and rollback procedures
- [x] Plan includes: Troubleshooting guide and success metrics
- [x] Apply approved content updates in landing components and locale files.
  - Updated HeroSection, FeaturesSection, BigImageCTASection, CardsWithIconsSection, HowItWorksCards, PromoCTASection
  - All three locales (en, ru, es) translated and validated
- [x] Remove/replace outdated FAQ items, add new ones.
  - Removed: LearningTechniques, MobileApp, LearningProgramming, WorkoutSystem
  - Added: DuplicateDetection, AIGeneratedContent, ManualQuestions, DifferenceFromAnki, PrivacyControl, NewCategoryRequest, TelegramBot
  - Updated FAQSection.tsx component with new FAQ structure (15 total FAQs)
- [x] Update section visuals references (temporary placeholders if assets are pending; use images listed in the `landing-screenshots.md` -- they'll be added later).
  - FeaturesSection: Updated all 6 feature cards with real app screenshots per landing-rewrite-draft.md mapping
  - HeroSection: Kept current image (14clean.jpg) as per plan
  - BigImageCTASection: Kept current image (02.jpg) as per plan
  - CardsWithIconsSection: Updated icons (Rocket, Eye, Play)
  - HowItWorksCards: Updated icons (BookOpen, WandSparkles, Refresh)
- [x] Run lint on changed files.
  - ESLint passed for all modified component files
- [x] Run full TypeScript check (`npx tsc --noEmit`).
  - TypeScript compilation passed with 0 errors
- [x] Output files:
  - Updated: `src/components/screens/LandingContent/*` (FAQSection, CardsWithIconsSection, HowItWorksCards, FeaturesSection)
  - Updated: `src/i18n/locales/en.json`, `ru.json`, `es.json`
  - Created: `project-description/step-used-images.txt` (comprehensive image inventory)

### Step 6. Public Project Documentation Updates

- [x] Update `README.md` with the approved project goal, user value, and key workflow.
  - Rewrote overview with "personal knowledge training" positioning
  - Updated core features to emphasize creation workflow (in-place editing, duplicate detection, generation review)
  - Added accurate technology stack details (Cloudflare AI, removed Redis reference)
  - Included pricing page link
  - Enhanced planned features section with realistic roadmap items
- [x] Add/update links to relevant pages and docs (including `/pricing` where appropriate).
  - Added pricing link in Quick Links section
  - Referenced /pricing in user roles section
- [x] Keep wording aligned with approved landing and description drafts.
  - Consistent messaging: "Turn Your Knowledge Into Repeatable Trainings"
  - Emphasized personal-first approach throughout
  - Highlighted key differentiators (generation control, duplicate detection, privacy)
- [x] Update user documentation page (`/docs`), including all possible useful information.
  - Complete rewrite of DocsContentEn.md (200+ lines → 500+ lines)
  - Added comprehensive "Getting Started" guide with step-by-step instructions
  - Explained data hierarchy and creation workflow
  - Detailed feature explanations (HeadlessEditor, duplicate detection, generation review loop)
  - User roles and permissions breakdown
  - Authentication options explained
  - Payment systems documentation
  - Expanded FAQ section with creation-focused questions
  - Technical requirements and troubleshooting guide
  - Privacy and security information
- [x] Output files:
  - Updated: `README.md` - Complete overhaul with new positioning
  - Updated: `src/app/[locale]/public/docs/DocsContentEn.md` - Comprehensive English documentation

### Step 7. Multi-Language Docs & Metadata Updates

- [x] Create Russian translation of docs page (`DocsContentRu.md`).
  - Complete translation of all 548 lines from English
  - Preserved all variable placeholders and formatting
  - Technical terms appropriately localized
- [x] Spanish translation created by user (`DocsContentEs.md`).
- [x] Connect all translations in `DocsPage.tsx`.
  - Added locale switch for 'es' and 'ru' cases
  - Follows same pattern as ContactsPage
  - Automatic locale detection works correctly
- [x] Add docs link to landing page PromoCTASection.
  - Added third button: "Read Documentation" → /docs
  - Button layout: Start Training | Read Docs | Explore Categories
  - Used BookOpen icon for visual clarity
- [x] Add translation key `ReadDocsText` to all locales (en, ru, es).
- [x] Update project metadata with new positioning.
  - **package.json:** Updated description and added 7 SEO keywords
  - **env.ts:** Updated siteTitle, siteDescription, siteKeywords
  - **Locale files:** Updated Pages.RootTitle, RootDescription, RootKeywords in all 3 languages
- [x] Output files:
  - Created: `src/app/[locale]/public/docs/DocsContentRu.md`
  - Updated: `src/app/[locale]/public/docs/DocsPage.tsx`
  - Updated: `src/components/screens/LandingContent/PromoCTASection.tsx`
  - Updated: `src/i18n/locales/en.json`, `ru.json`, `es.json`
  - Updated: `package.json`, `src/config/env.ts`

### Step 8. Changelog Update

- [ ] Add a clear entry in `CHANGELOG.md` describing positioning/content updates.
- [ ] Mention major documentation and landing copy changes.
- [ ] Use existing changelog style and date/version format.

## Review Workflow

After each step:

1. You review wording and priorities.
2. I apply your corrections.
3. We move to the next step.
