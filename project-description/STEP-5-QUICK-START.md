# Step 5 Quick Start Guide

**Need to update the landing page? Start here.**

## TL;DR - What Needs to Happen

Update **3 locale files** with new copy that shifts positioning from "learning app" to "dataset creation platform":

1. `src/i18n/locales/en.json` - English (source)
2. `src/i18n/locales/ru.json` - Russian (translate from English)
3. `src/i18n/locales/es.json` - Spanish (translate from English)

Plus optional component updates for screenshots.

## Fastest Path to Completion

Use [`step-5-landing-update-plan.md`](./step-5-landing-update-plan.md) as your guide:

1. Open the plan document
2. Follow Phase 1 step-by-step for English
3. Translate to Russian (Phase 2)
4. Translate to Spanish (Phase 3)
5. Update components if needed (Phase 4)
6. Test thoroughly (Phase 5)
7. Deploy (Phase 6)

## Key Changes Summary

### Hero Section

- **Old:** "Train Your Brain. Build Your Knowledge."
- **New:** "Turn Your Knowledge Into Repeatable Trainings"

### Features (6 Cards)

- **Old:** Learning techniques, community practice, AI generation
- **New:** Build from own knowledge, generate/check/perfect, keep data clean, edit without context switching, control privacy, organized hierarchy

### FAQ

- **Remove:** Learning techniques, mobile app, programming use case, workout system
- **Add:** Duplicate detection, AI content control, manual vs AI questions, difference from Anki, privacy control, category requests, Telegram bot status

### All CTAs

- **Old:** "Start Training", "Try It Free"
- **New:** "Create Your First Topic", "Start Building Now"

## Screenshots to Use

From `landing-screenshots.md`:

| Section      | Screenshot                                       |
| ------------ | ------------------------------------------------ |
| Feature 1    | `v.0.1.4/categories-list-with-a-filter.jpg`      |
| Feature 2    | `v.0.1.4/generated-questions-dialog.jpg`         |
| Feature 3    | `v.0.1.4/comparison-results-panel.jpg`           |
| Feature 4    | `v.0.1.4/mobile-panel-with-editor.jpg`           |
| Feature 5    | `v.0.1.4/topics-list-with-visibility-toggle.jpg` |
| Feature 6    | `v.0.1.4/topic-hierarchy-visualization.jpg`      |
| HowItWorks 1 | `v.0.1.4/signin-modal.jpg`                       |
| HowItWorks 2 | Composite: generation + comparison               |
| HowItWorks 3 | Workout session screen                           |

## If Something Goes Wrong

### JSON Syntax Error

```bash
# Restore backup
cp src/i18n/locales/en.json.backup src/i18n/locales/en.json
# Or with git
git checkout src/i18n/locales/en.json
```

### Missing Translation

```bash
# Check key exists in all three files
grep -n "HeroSection.Title" src/i18n/locales/*.json
```

## Need Help?

**Reference Documents:**

- Full plan: [`step-5-landing-update-plan.md`](./step-5-landing-update-plan.md)
- Copy details: [`landing-rewrite-draft.md`](./landing-rewrite-draft.md)
- Screenshot catalog: [`landing-screenshots.md`](./landing-screenshots.md)
- Change summary: [`landing-changes-summary.md`](./landing-changes-summary.md)

**Quick Questions:**

- "What's the new Hero headline?" → See Phase 1, Step 1.2
- "Which FAQs to remove?" → See Phase 1, Step 1.7
- "What screenshot for Feature 3?" → See table above or Phase 1, Step 1.3
