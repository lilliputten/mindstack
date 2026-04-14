# Step 5: Landing Page Update Plan

**Status:** Planning Phase
**Date:** 2026-04-14
**Purpose:** Detailed implementation instructions for updating landing page content

## Overview

This document provides step-by-step instructions to update the landing page from "passive learning" positioning to "active creation" positioning. All changes are based on the approved copy from `landing-rewrite-draft.md`.

**Key Changes:**

- Hero section emphasizes creation workflow
- Features section highlights duplicate detection, generation review, privacy control
- FAQ removes learning-theory questions, adds creation-workflow questions
- All CTAs action-oriented toward "create your first topic"
- Real screenshots mapped from `landing-screenshots.md`

## Files to Modify

### Primary Files (Locale Translations)

1. `src/i18n/locales/en.json` - English translations
2. `src/i18n/locales/ru.json` - Russian translations
3. `src/i18n/locales/es.json` - Spanish translations

### Component Files (If Needed)

4. `src/components/screens/LandingContent/HeroSection.tsx` - Keep current image.
5. `src/components/screens/LandingContent/FeaturesSection.tsx` - May need screenshot updates
6. `src/components/screens/LandingContent/BigImageCTASection.tsx` - Keep current image.
7. `src/components/screens/LandingContent/CardsWithIconsSection.tsx` - May need screenshot updates
8. `src/components/screens/LandingContent/HowItWorksCards.tsx` - May need screenshot updates
9. `src/components/screens/LandingContent/FAQSection.tsx` - May need structure updates

## Phase 1: Update English Locale File

### Step 1.1: Backup Current File

```bash
cp src/i18n/locales/en.json src/i18n/locales/en.json.backup
```

### Step 1.2: Update HeroSection

**Location:** `Landing.HeroSection` in en.json

**Current:**

```json
"HeroSection": {
  "Description": "MindStack transforms how you learn and remember with AI‑powered memory training, spaced repetition, and active recall.",
  "ExploreAvailableCategoriesText": "Available Categories",
  "StartTrainingFreeText": "Start Training Free",
  "Title": "Train Your Brain. Build Your Knowledge."
}
```

**Replace With:**

```json
"HeroSection": {
  "Description": "MindStack helps you create structured question-answer datasets from your personal topics, validate them with AI assistance, and run effective repetition trainings—all in one workflow.",
  "ExploreAvailableCategoriesText": "Explore Public Topics",
  "StartTrainingFreeText": "Start Creating Your First Topic",
  "Title": "Turn Your Knowledge Into Repeatable Trainings"
}
```

### Step 1.3: Update FeaturesSection

**Location:** `Landing.FeaturesSection` in en.json

**Current:** 6 cards about learning techniques

**Replace With:**

```json
"FeaturesSection": {
  "Card-1-Text": "Create topics around your real work, studies, or interests. No generic courses—just your personalized training datasets organized by categories.",
  "Card-1-Title": "Build From Your Own Knowledge",
  "Card-2-Text": "Use AI to draft questions and answers instantly, then review and edit before saving. Regenerate until quality meets your standards.",
  "Card-2-Title": "Generate, Check, Perfect",
  "Card-3-Text": "Compare new items against existing ones to catch duplicates and near-duplicates. Beta similarity algorithms help maintain dataset quality as it grows.",
  "Card-3-Title": "Keep Your Data Clean",
  "Card-4-Text": "Modify questions and answers directly in the training interface using our rich HeadlessEditor. No separate editing mode needed.",
  "Card-4-Title": "Edit Without Context Switching",
  "Card-5-Text": "Keep topics private by default for personal use. Share selected topics publicly when you want to contribute to the community.",
  "Card-5-Title": "Control Your Privacy",
  "Card-6-Text": "Categories → Topics → Questions → Answers. A clear structure that keeps your knowledge base manageable whether you have 10 or 1000 items.",
  "Card-6-Title": "Organized Hierarchy That Grows With You",
  "Description": "From initial idea to active training session, MindStack provides tools for creating, validating, and practicing with your personal knowledge base.",
  "Title": "Everything You Need to Build Quality Training Datasets"
}
```

**Screenshots to Map (from landing-screenshots.md):**

- Card 1: `v.0.1.4/categories-list-with-a-filter.jpg` - Show category organization
- Card 2: `v.0.1.4/generated-questions-dialog.jpg` - Show AI generation interface
- Card 3: `v.0.1.4/comparison-results-panel.jpg` - Show duplicate detection
- Card 4: `v.0.1.4/mobile-panel-with-editor.jpg` - Show in-place editing
- Card 5: `v.0.1.4/topics-list-with-visibility-toggle.jpg` - Show privacy controls
- Card 6: `v.0.1.4/topic-hierarchy-visualization.jpg` - Show data structure

### Step 1.4: Update BigImageCTASection

**Location:** `Landing.BigImageCTASection` in en.json

**Current:**

```json
"BigImageCTASection": {
  "Description": "Whether you're learning a new language, preparing for exams, or mastering professional skills, MindStack adapts to your goals.",
  "Title": "Build Your Knowledge Base Today",
  "TryItFreeText": "Try It Free"
}
```

**Replace With:**

```json
"BigImageCTASection": {
  "Description": "MindStack transforms your raw information—work documents, study materials, technical references—into organized, trainable datasets with built-in quality checks.",
  "Title": "Your Knowledge Deserves Better Than Flashcards",
  "TryItFreeText": "Create Your First Topic Now"
}
```

**Screenshot to Use:** `v.0.1.4/generated-questions-with-opened-answers-and-filters-panel.jpg` - Show complete generation + validation workflow

### Step 1.5: Update CardsWithIconsSection

**Location:** `Landing.CardsWithIconsSection` in en.json

**Current:** 3 cards about learning process (Timed Reviews, Retrieval Practice, Smart Focus)

**Replace With:**

```json
"CardsWithIconsSection": {
  "Description": "Every step optimized for speed and control",
  "Text-1": "Create a topic in seconds. Choose a category, set privacy, add your first question—or let AI generate a starter set.",
  "Text-2": "Generated content stays in draft mode until you approve it. Edit, regenerate, or discard—full control over your dataset.",
  "Text-3": "Start repetition sessions as soon as you save your first question. No waiting, no setup delays.",
  "Title": "Streamlined From Creation to Practice",
  "Title-1": "Quick Setup",
  "Title-2": "Review Before Save",
  "Title-3": "Train Instantly"
}
```

**Icons Suggestion:**

- Quick Setup: Zap or Rocket icon
- Review Before Save: Eye or CheckCircle icon
- Train Instantly: Play or Dumbbell icon

### Step 1.6: Update HowItWorksCards

**Location:** `Landing.HowItWorksCards` in en.json

**Current:** 3 steps about learning (Create/Choose Topics, Train with Workouts, Track Progress)

**Replace With:**

```json
"HowItWorksCards": {
  "Description": "A complete workflow from idea to mastery",
  "Text-1": "Start a new topic under a relevant category, or browse public topics for inspiration. Set it as private or public based on your needs.",
  "Text-2": "Add questions manually or use AI generation. Compare new items against existing ones to avoid duplicates. Edit in place until everything looks right.",
  "Text-3": "Run repetition sessions on your validated data. Track performance, identify weak areas, and continuously refine your topic as you learn.",
  "Title": "How MindStack Works",
  "Title-1": "Define Your Topic",
  "Title-2": "Generate, Review, Refine",
  "Title-3": "Practice and Iterate"
}
```

Suggest suitable icons.

### Step 1.7: Update FAQSection

**Location:** `Landing.FAQSection` in en.json

**REMOVE These FAQs:**

- `LearningTechniques` - "What learning techniques does MindStack use?"
- `MobileApp` - "Is there a mobile app?"
- `LearningProgramming` - "Can I use MindStack for learning programming?"
- `WorkoutSystem` - "How does the workout system work?"

**ADD These New FAQs:**

- `DuplicateDetection` - "How does the duplicate detection work?"
- `AIGeneratedContent` - "What if I'm not satisfied with AI-generated content?"
- `ManualQuestions` - "Do I need to write all questions and answers manually?"
- `DifferenceFromAnki` - "How is this different from Anki or Quizlet?"
- `PrivacyControl` - "Can I keep my topics private?"
- `NewCategoryRequest` - "How do I request a new category?"
- `TelegramBot` - "Is there a Telegram bot?"

**UPDATE These FAQs:**

- `WhatIsMindStack` - Reposition from "memory training app" to "platform for creating personal training systems"
- `WithoutAccount` - Clarify guest limitations vs registered benefits
- `Price` - Ensure link to /pricing works correctly

**Complete Updated FAQ Section:**

```json
"FAQSection": {
  "Description": "Everything you need to know about creating and using personal training datasets",
  "Title": "Common Questions",
  "FreeToUse": {
    "Answer": "MindStack offers a free tier that includes core features for creating topics, questions, and workouts. Additional features and higher limits may be available in premium plans. Check our <LinkPricing>pricing page</LinkPricing> for more details.",
    "Question": "What's included in the free plan?"
  },
  "HowToCreateFirstTopic": {
    "Answer": "<p>Creating a topic in MindStack is simple:</p><ol><li>Sign up for a free account</li><li>Navigate to \"My Topics\" in the dashboard</li><li>Click \"Create Topic\" and fill in the title and language</li><li>Add questions manually or use AI generation</li><li>Review and validate your content</li><li>Start practicing with workouts!</li></ol>",
    "Question": "How do I create my first topic?"
  },
  "DuplicateDetection": {
    "Answer": "Our beta similarity algorithm compares new questions and answers against existing ones in your topic using text analysis (including stemming for better matching). It flags potential duplicates so you can decide whether to merge, rephrase, or keep both. Note: This feature is still improving and works best with clear, distinct phrasing.",
    "Question": "How does the duplicate detection work?"
  },
  "AIGeneratedContent": {
    "Answer": "You have full control. You can edit any generated item, regenerate specific questions, or delete them entirely. Nothing is saved to your database until you explicitly approve it. Think of AI as a drafting assistant, not an autopilot.",
    "Question": "What if I'm not satisfied with AI-generated content?"
  },
  "ManualQuestions": {
    "Answer": "No. You can write them manually, use AI to generate drafts, or combine both approaches. The key difference is that generated content stays in review mode—you check, edit, and approve everything before it becomes part of your training dataset.",
    "Question": "Do I need to write all questions and answers manually?"
  },
  "DifferenceFromAnki": {
    "Answer": "While those tools focus on flashcard management, MindStack emphasizes the entire content creation workflow. You get AI-assisted generation, duplicate detection, in-place editing, and a structured hierarchy (categories → topics → questions → answers). It's designed for building quality datasets, not just storing cards.",
    "Question": "How is this different from Anki or Quizlet?"
  },
  "MultipleLanguages": {
    "Answer": "Yes! MindStack supports multiple languages. You can create topics in different languages and switch between them seamlessly. This is especially useful for language learning or when studying materials in different languages.",
    "Question": "Does MindStack support multiple languages?"
  },
  "PrivacyControl": {
    "Answer": "Yes. Topics are private by default. Only you can see and train on them. You can optionally make topics public to share with the community, but this is completely your choice.",
    "Question": "Can I keep my topics private?"
  },
  "Price": {
    "Answer": "Basic features are free forever. Premium plans unlock unlimited topics, advanced analytics, and AI features. See <LinkPricing>pricing</LinkPricing> section.",
    "Question": "How much does it cost?"
  },
  "ShareTopics": {
    "Answer": "Yes! You can share your topics with the community or keep them private. Explore topics created by other users to discover new learning materials. This collaborative approach helps everyone learn together.",
    "Question": "Can I share my topics with others?"
  },
  "TrackProgress": {
    "Answer": "MindStack provides detailed statistics and progress tracking. You can see your performance across different topics, track improvement over time, and identify areas that need more practice. The dashboard shows your workout history and success rates.",
    "Question": "How do I track my progress?"
  },
  "WhatIsMindStack": {
    "Answer": "MindStack is a platform for creating personal repetition training systems. Instead of using pre-made courses, you build your own question-answer datasets from topics that matter to you—work materials, study subjects, technical references, or anything else. The system helps you generate, validate, and practice with your content.",
    "Question": "What is MindStack?"
  },
  "WithoutAccount": {
    "Answer": "Guests can explore public topics and try sample workouts, but progress isn't saved. To create your own topics, save data, and track history, you'll need a free account. Registration takes seconds via OAuth (Google, GitHub, Yandex) or email/Telegram OTP.",
    "Question": "Can I use MindStack without registering?"
  },
  "NewCategoryRequest": {
    "Answer": "Registered users can submit category creation requests through the embedded form on the categories page. Our team reviews submissions and adds relevant categories to keep the system organized.",
    "Question": "How do I request a new category?"
  },
  "TelegramBot": {
    "Answer": "Yes, but it's currently limited to authentication only. We're working on adding progress tracking and payment support in future updates.",
    "Question": "Is there a Telegram bot?"
  }
}
```

### Step 1.8: Update PromoCTASection

**Location:** `Landing.PromoCTASection` in en.json

**Current:**

```json
"PromoCTASection": {
  "Description": "Join a growing community of learners and discover a better way to remember",
  "ExploreCategoriesText": "Explore Categories",
  "StartFreeTrainingText": "Start Free Training",
  "Title": "Start Building Your Knowledge Today"
}
```

**Replace With:**

```json
"PromoCTASection": {
  "Description": "Join users who are transforming their work docs, study materials, and reference guides into structured, trainable datasets. Free to start, powerful when you need it.",
  "ExploreCategoriesText": "Explore Categories",
  "StartFreeTrainingText": "Start Building Now",
  "Title": "Ready to Build Your First Training System?"
}
```

### Step 1.9: Validation Checklist for English

After completing all updates to en.json:

- [ ] JSON syntax is valid (run `node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en.json', 'utf8'))"`)
- [ ] No missing commas or brackets
- [ ] All special characters properly escaped
- [ ] Link components (`<LinkPricing>`) preserved in FAQ answers
- [ ] HTML tags in FAQ answers properly formatted
- [ ] Test file loads without errors in application

## Phase 2: Update Russian Locale File

### Step 2.1: Translate English Changes to Russian

**File:** `src/i18n/locales/ru.json`

**Approach:**

1. Open ru.json alongside updated en.json
2. For each changed section in en.json, translate to Russian maintaining the same structure
3. Preserve all formatting, links, and HTML tags
4. Ensure cultural appropriateness (Yandex OAuth mention is important for Russian market)

**Key Sections to Update:**

- `Landing.HeroSection`
- `Landing.FeaturesSection` (all 6 cards)
- `Landing.BigImageCTASection`
- `Landing.CardsWithIconsSection`
- `Landing.HowItWorksCards`
- `Landing.FAQSection` (remove 4, add 7, update 4)
- `Landing.PromoCTASection`

**Translation Notes:**

- Keep technical terms consistent (AI, OAuth, etc.)
- Maintain tone: professional but accessible
- Ensure CTAs are action-oriented in Russian
- Preserve emoji usage if present in original

## Phase 3: Update Spanish Locale File

### Step 3.1: Translate English Changes to Spanish

**File:** `src/i18n/locales/es.json`

**Approach:**
Same as Phase 2, but translate to Spanish.

**Key Considerations:**

- Latin American Spanish preferred (neutral dialect)
- Maintain consistency with existing Spanish translations
- Check for gender-neutral language where possible
- Preserve all technical terms and formatting

## Phase 4: Component Updates (If Needed)

### Step 4.1: Review Screenshot Mappings

Check each component to ensure it uses the correct screenshots from `landing-screenshots.md`:

**HeroSection.tsx:**

- Keep currently used image.

**FeaturesSection.tsx:**

- Check if component accepts image props per card
- If yes, map images according to Step 1.3
- If no, consider adding image support or using CSS background images

**BigImageCTASection.tsx:**

- Keep currently used image.

**CardsWithIconsSection.tsx:**

- Verify icons match new titles (Quick Setup, Review Before Save, Train Instantly)
- Update icon imports if needed

**HowItWorksCards.tsx:**

- Update icons according to the items.

### Step 4.2: Update Component Code (If Required)

For each component that needs screenshot updates:

```typescript
// Example: HeroSection.tsx
export function HeroSection() {
  return (
    <section>
      <img src={heroImage.src} alt={description} />
      {/* ... rest of component */}
    </section>
  );
}
```

## Resources

- **Screenshot Catalog:** `project-description/landing-screenshots.md`
- **Copy Reference:** `project-description/landing-rewrite-draft.md`
- **Change Summary:** `project-description/landing-changes-summary.md`
- **Visual Flow:** `project-description/landing-visual-flow.md`
- **Technical Stack:** `project-description/project-description-technical-draft.md`
