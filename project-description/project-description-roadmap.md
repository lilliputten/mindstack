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

- [ ] Apply approved content updates in landing components and locale files.
- [ ] Remove/replace outdated FAQ items, add new ones.
- [ ] Update section visuals references (temporary placeholders if assets are pending; use images listed in the `landing-screenshots.md` -- they'll be added later).
- [ ] Run lint on changed files.
- [ ] Run full TypeScript check (`npx tsc --noEmit`).
- Output: updated `src/components/screens/LandingContent/*` and locale files.

### Step 6. Public Project Documentation Updates

- [ ] Update `README.md` with the approved project goal, user value, and key workflow.
- [ ] Add/update links to relevant pages and docs (including `/pricing` where appropriate).
- [ ] Keep wording aligned with approved landing and description drafts.
- [ ] Update user documentation page (`/docs`), including all possible useful information.

### Step 7. Changelog Update

- [ ] Add a clear entry in `CHANGELOG.md` describing positioning/content updates.
- [ ] Mention major documentation and landing copy changes.
- [ ] Use existing changelog style and date/version format.

## Review Workflow

After each step:

1. You review wording and priorities.
2. I apply your corrections.
3. We move to the next step.
