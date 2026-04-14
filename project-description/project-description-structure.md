# MindStack Product Structure Draft

## Core product model

MindStack is a personal-first training builder where users create and maintain their own knowledge datasets, then run repetition trainings on top of these datasets.

Primary hierarchy:

- `Category` -> broad domain grouping.
- `Topic` -> a concrete user subject inside a category.
- `Question` -> training prompt inside a topic.
- `Answer` -> expected response linked to a question.

This hierarchy is the backbone for:

- content creation and curation,
- generation and post-generation validation,
- duplicate/similarity control,
- training session execution.

## Data flow (authoring to training)

1. User chooses an existing category or submits a category creation request to the administrator (via embedded form).
2. User creates a topic (private by default or public if intended for sharing).
3. User adds or generates questions and answers.
4. User reviews generated content before persistence:
   - edits in place (HeadlessEditor),
   - compares candidate items with existing data (duplicate/similarity checks),
   - regenerates if quality is insufficient.
5. User saves validated data to the database.
6. Training modules consume the same structured entities and reuse them in repetition sessions.

## Quality-control loop

MindStack should be presented not only as a training app, but as a **training data management workflow**:

- Generate -> compare -> fix -> regenerate -> save -> train.

This loop is a key product differentiator because users keep control over dataset quality before training starts.

## Privacy and publishing model

- **Private topics:** default mode for personal knowledge and work-related materials.
- **Public topics:** optional mode for sharing curated content with others.
- **Category creation request:** users cannot create categories directly; registered users can send a category creation request to the administrator via the embedded form.

The positioning emphasis should remain on private/personal use first, with public sharing as a secondary capability.

## Access tiers and expected behavior

- **Guest:** can explore public topics; progress is limited and local-only (no full history persistence).
- **Basic (free):** registered entry level with personal data workflow.
- **Pro / Premium (paid):** extended capabilities (refer users to `/pricing` for current plan limits).

Billing and plan details are centralized on the pricing page:

- alias route: `/pricing`
- implementation entry: `src/components/screens/PricingContent/PricingContent.tsx`

## Authentication and entry points

Supported auth methods:

- OAuth providers: Google, Yandex, GitHub.
- OTP flows: email and Telegram.

Telegram bot status:

- current: authorization support,
- planned: progress tracking and payment support.

## Main page and route relations (high-level)

Deduplicated user-facing routes (short paths; alias/redirect duplicates skipped):

- Public content: `/`, `/welcome`, `/about`, `/contacts`, `/docs`, `/pricing`.
- Legal: `/cookies`, `/offer`, `/privacy`, `/terms`.
- Discovery and training: `/topics/available`, `/categories/available`, `/trainings/recent`.
- User workspace: `/topics/my`, `/topics/all`, `/categories/manage`, `/settings`.
- Service routes: `/auth/error`, `/pricing/choose`.
- Admin routes: `/admin`, `/admin/ui-demo`, `/admin/ai/test-text-query`, `/admin/bot/control`.

Main product flow routes for landing/content references:

- `/start` (onboarding shortcut, redirects to `/topics/available`).
- `/topics/available` and `/categories/available` (discovery).
- `/topics/my` (personal topic management and creation flow).
- `/trainings/recent` (training entry point for existing data).
- `/pricing` (plan details and billing options).

## Landing section relations to product structure

- **Hero + Features:** communicate the authoring workflow and personal-first value.
- **Recent categories/topics:** provide discovery examples and clear entry into creation.
- **Cards/How it works/FAQ/CTA:** should explain creation pipeline, quality checks, privacy modes, and tier differences.

## Suggested structural narrative for documentation pages

1. Product purpose (personal training creation).
2. Data hierarchy and why it matters.
3. Authoring + validation loop.
4. Training consumption of validated data.
5. Privacy/public sharing options.
6. Access tiers and payments.
7. Current limitations and roadmap notes.
