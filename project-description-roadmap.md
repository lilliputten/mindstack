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

- [ ] Keep current landing section structure and rewrite each section intent.
- [ ] Propose new titles, descriptions, card texts, CTA copy.
- [ ] Propose screenshot-first illustration strategy (what to capture per section).
- [ ] Define which sections should be reframed vs simplified.
- [ ] Replace weak "learning-only" framing with "build your own training pipeline".
- Output file: `landing-rewrite-draft.md`

### Step 4. Technical Article Draft (architecture and stack)

- [ ] Create technical overview draft: stack, data pipeline, generation and validation cycle.
- [ ] Explain text comparator module and current beta limitations.
- [ ] Describe auth options, pricing tiers, and payment integrations at system level.
- [ ] Add section for current limitations and near-term roadmap (Telegram bot, algorithm improvements).
- Output file: `project-description-technical-draft.md`

### Step 5. Landing Implementation (code + translations)

- [ ] Apply approved copy updates in landing components and locale files.
- [ ] Remove/replace outdated FAQ items.
- [ ] Update section visuals references (temporary placeholders if assets are pending).
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
