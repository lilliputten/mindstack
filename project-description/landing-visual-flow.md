# Landing Page Visual Flow Diagram

**Purpose:** Visual representation of current vs. proposed landing page structure

---

## Current Landing Page Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HERO SECTION                             │
│  Title: "Train Your Brain. Build Your Knowledge."           │
│  Desc: Generic AI-powered memory training message           │
│  CTA: [Start Training Free] [Available Categories]          │
│  Visual: Screenshot (14clean.jpg)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  FEATURES SECTION                            │
│  Title: "Everything You Need for Effective Learning"        │
│                                                               │
│  [Create & Organize]  [Practice in Community]               │
│  [AI Content Gen]     [Multi-Language]                      │
│  [Progress Analytics] [Share & Collaborate]                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              RECENT CATEGORIES SECTION                       │
│  (DB-driven category cards with links) ✅ Keep             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            CARDS WITH ICONS SECTION                          │
│  Title: "Why We Built It This Way"                          │
│  [Timed Reviews] [Retrieval Practice] [Smart Focus]         │
│  ❌ Problem: About learning theory, not creation workflow   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              BIG IMAGE CTA SECTION                           │
│  Title: "Build Your Knowledge Base Today"                   │
│  Desc: Generic multi-purpose learning statement             │
│  CTA: [Try It Free]                                         │
│  Visual: Screenshot (02.jpg)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               RECENT TOPICS SECTION                          │
│  (DB-driven topic cards with links) ✅ Keep                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              HOW IT WORKS CARDS                              │
│  Title: "Start Learning in 3 Simple Steps"                  │
│  [Create/Choose Topics] [Train Workouts] [Track Progress]   │
│  ❌ Problem: Missing validation/review step                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FAQ SECTION                               │
│  12 FAQs - Several problematic:                             │
│  ❌ "What learning techniques...?"                          │
│  ❌ "Is there a mobile app?"                                │
│  ❌ "Can I use for programming?"                            │
│  ❌ Too focused on consumption, not creation                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 PROMO CTA SECTION                            │
│  Generic "start training" banner                            │
│  ❌ Weak messaging, passive tone                            │
└─────────────────────────────────────────────────────────────┘
```

**Issues with Current Flow:**
- Emphasizes passive learning over active creation
- Missing key differentiators (duplicate detection, review workflow)
- FAQ doesn't address creation-focused questions
- No clear emphasis on privacy/personal-first approach

---

## Proposed Landing Page Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HERO SECTION                             │
│  Title: "Turn Your Knowledge Into Repeatable Trainings"     │
│  Desc: Create structured Q&A datasets, validate with AI,    │
│        run repetition trainings—all in one workflow         │
│  CTA: [Start Creating Your First Topic]                     │
│       [Explore Public Topics]                               │
│  Visual: Composite showing Create→Validate→Train flow       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  FEATURES SECTION                            │
│  Title: "Everything You Need to Build Quality Training      │
│         Datasets"                                            │
│                                                               │
│  [Build From Your     [Generate, Check,   [Keep Data Clean] │
│   Own Knowledge]       Perfect]            (dup detect)     │
│                                                               │
│  [Edit Without        [Control Your       [Organized        │
│   Context Switch]      Privacy]            Hierarchy]        │
│                                                               │
│  ✅ All cards emphasize creation & validation workflow      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              RECENT CATEGORIES SECTION                       │
│  (DB-driven category cards with links) ✅ Keep             │
│  + Clarify: "Browse or request new categories"              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            CARDS WITH ICONS SECTION                          │
│  Title: "Streamlined From Creation to Practice"             │
│  Desc: "Every step optimized for speed and control"         │
│                                                               │
│  [Quick Setup]  [Review Before Save]  [Train Instantly]     │
│                                                               │
│  ✅ Focused on authoring workflow efficiency                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              BIG IMAGE CTA SECTION                           │
│  Title: "Your Knowledge Deserves Better Than Flashcards"    │
│  Desc: Transform scattered notes into organized, trainable  │
│        datasets with built-in quality checks                │
│  CTA: [Create Your First Topic Now]                         │
│  Visual: Before/After transformation (chaos→order)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               RECENT TOPICS SECTION                          │
│  (DB-driven topic cards with links) ✅ Keep                │
│  + Clarify: "Recently updated public topics"                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              HOW IT WORKS CARDS                              │
│  Title: "How MindStack Works"                               │
│  Desc: "A complete workflow from idea to mastery"           │
│                                                               │
│  [Define Your Topic] → [Generate, Review, Refine] →         │
│  [Practice and Iterate]                                     │
│                                                               │
│  ✅ Emphasizes validation step & iterative improvement      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FAQ SECTION                               │
│  10 FAQs - Creation-focused:                                │
│                                                               │
│  ✅ "What is MindStack?" (rewritten)                        │
│  ✅ "How is this different from Anki/Quizlet?" (NEW)        │
│  ✅ "Do I need to write all questions manually?" (NEW)      │
│  ✅ "How does duplicate detection work?" (NEW)              │
│  ✅ "Can I keep topics private?" (emphasized)               │
│  ✅ "What if not satisfied with AI content?" (NEW)          │
│  ✅ "What's included in free plan?" (updated)               │
│  ✅ "Can I use without registering?" (clarified)            │
│  ✅ "How to request new category?" (kept)                   │
│  ✅ "Is there a Telegram bot?" (kept, honest about limits)  │
│                                                               │
│  ❌ Removed: Learning techniques, mobile app, programming   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 PROMO CTA SECTION                            │
│  Title: "Ready to Build Your First Training System?"        │
│  Desc: Join users transforming work docs, study materials,  │
│        and references into structured, trainable datasets   │
│  CTA: [Start Building Now]                                  │
│  Optional: Add social proof (stats/testimonials)            │
└─────────────────────────────────────────────────────────────┘
```

**Improvements in Proposed Flow:**
- ✅ Clear creation-focused messaging throughout
- ✅ Highlights unique features (duplicate detection, review workflow)
- ✅ Emphasizes privacy-first approach
- ✅ FAQ addresses real user concerns about creation
- ✅ Every section guides toward "create your first topic"
- ✅ Consistent terminology and positioning

---

## User Journey Comparison

### Current Journey (Learning-Focused)

```
Visitor Lands on Page
    ↓
Sees: "Train Your Brain"
    ↓
Thinks: "Another learning app..."
    ↓
Scrolls past generic features
    ↓
May explore public topics
    ↓
Signs up to "start training"
    ↓
Discovers they can create topics (surprise!)
    ↓
Learns creation workflow through exploration
```

**Problem:** Value proposition (personal training creation) is hidden

---

### Proposed Journey (Creation-Focused)

```
Visitor Lands on Page
    ↓
Sees: "Turn Your Knowledge Into Repeatable Trainings"
    ↓
Thinks: "I can build from MY topics!"
    ↓
Sees features emphasizing creation & validation
    ↓
Understands workflow: Create → Validate → Train
    ↓
Clicks "Start Creating Your First Topic"
    ↓
Signs up with clear expectation
    ↓
Immediately starts building (matches expectation)
```

**Benefit:** Value proposition is clear from first second

---

## Feature Card Evolution

### FeaturesSection - Before & After

```
BEFORE (Learning-Focused):                AFTER (Creation-Focused):
┌──────────────────────┐                 ┌──────────────────────┐
│ Create & Organize    │                 │ Build From Your Own  │
│ Your Knowledge       │    ────────►    │ Knowledge            │
│ (Generic)            │                 │ (Personal-first)     │
└──────────────────────┘                 └──────────────────────┘

┌──────────────────────┐                 ┌──────────────────────┐
│ Practice Within      │                 │ Generate, Check,     │
│ Community            │    ────────►    │ Perfect              │
│ (Passive)            │                 │ (Active validation)  │
└──────────────────────┘                 └──────────────────────┘

┌──────────────────────┐                 ┌──────────────────────┐
│ AI-Powered Content   │                 │ Keep Your Data Clean │
│ Creation             │    ────────►    │ (Dup detection)      │
│ (Just generation)    │                 │ (Quality control)    │
└──────────────────────┘                 └──────────────────────┘

┌──────────────────────┐                 ┌──────────────────────┐
│ Multi-Language       │                 │ Edit Without Context │
│ Learning             │    ────────►    │ Switching            │
│ (Secondary feature)  │                 │ (UX efficiency)      │
└──────────────────────┘                 └──────────────────────┘

┌──────────────────────┐                 ┌──────────────────────┐
│ Progress Analytics   │                 │ Control Your Privacy │
│ (Common feature)     │    ────────►    │ (Private by default) │
└──────────────────────┘                 └──────────────────────┘

┌──────────────────────┐                 ┌──────────────────────┐
│ Share & Collaborate  │                 │ Organized Hierarchy  │
│ (Optional feature)   │    ────────►    │ That Grows With You  │
│                      │                 │ (Scalability)        │
└──────────────────────┘                 └──────────────────────┘
```

---

## FAQ Evolution

### Questions Removed vs. Added

```
REMOVED (Not aligned with creation focus):
❌ "What learning techniques does MindStack use?"
   → Too theoretical, doesn't help users understand product
   
❌ "Is there a mobile app?"
   → PWA covers this, not a key differentiator
   
❌ "Can I use MindStack for learning programming?"
   → Too narrow; general FAQs cover all use cases
   
❌ "How do I track my progress?"
   → Merged into main "What is MindStack" answer


ADDED (Address creation workflow concerns):
✅ "How is this different from Anki or Quizlet?"
   → Positions against competitors, highlights unique features
   
✅ "Do I need to write all questions and answers manually?"
   → Clarifies AI assistance + human validation workflow
   
✅ "How does the duplicate detection work?"
   → Explains technical differentiator transparently
   
✅ "What happens if I'm not satisfied with AI-generated content?"
   → Reassures users about control and quality


UPDATED (Reframed for creation focus):
🔄 "What is MindStack?"
   → Now emphasizes creation workflow, not just training
   
🔄 "Can I keep my topics private?"
   → Now emphasizes "private by default" as core principle
   
🔄 "What's included in free plan?"
   → Updated to reflect current pricing structure
   
🔄 "Can I use MindStack without registering?"
   → Clarifies guest limitations more clearly
```

---

## Visual Strategy Evolution

### Screenshot Requirements

```
CURRENT STATE:
- 2 screenshots used (14clean.jpg, 02.jpg)
- Generic UI captures
- No clear narrative flow

PROPOSED STATE:
- 8-10 targeted screenshots
- Each showing specific feature/value prop
- Consistent theme and style
- Clear focal points

SPECIFIC SCREENSHOTS NEEDED:

Hero Section:
┌─────────────────────────────────────────┐
│ Option A: Composite/Collage             │
│ [Topic Form] [Editor] [Training Card]   │
│                                          │
│ Option B: Enhanced Screenshot           │
│ [Main UI with overlay arrows/callouts]  │
└─────────────────────────────────────────┘

Features Section (6 cards):
┌─────────────────────────────────────────┐
│ Card 1: "My Topics" list view           │
│ Card 2: Editor with "Generate AI" btn   │
│ Card 3: Duplicate warning UI            │
│ Card 4: Inline editing cursor visible   │
│ Card 5: Privacy toggle in settings      │
│ Card 6: Category→Topic hierarchy view   │
└─────────────────────────────────────────┘

BigImageCTA Section:
┌─────────────────────────────────────────┐
│ Before/After Transformation             │
│ [Messy Notes] → [Organized Topic]       │
└─────────────────────────────────────────┘
```

---

## Messaging Tone Comparison

### Hero Section Examples

```
OLD TONE (Passive/Learning):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Train Your Brain. Build Your Knowledge."

MindStack transforms how you learn and 
remember with AI‑powered memory training, 
spaced repetition, and active recall.

[Start Training Free]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User thinks: "Another flashcard app..."


NEW TONE (Active/Creation):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Turn Your Knowledge Into Repeatable 
Trainings"

MindStack helps you create structured 
question-answer datasets from your 
personal topics, validate them with AI 
assistance, and run effective repetition 
trainings—all in one workflow.

[Start Creating Your First Topic]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User thinks: "I can build from MY data!"
```

---

## Conversion Funnel Impact

### Expected Changes

```
METRIC                    CURRENT      TARGET       WHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time on Page              ~60s         >90s         More engaging copy
Scroll Depth              ~50%         >70%         Clearer value prop
Primary CTA Click Rate    ~3%          >5%          Action-oriented text
Landing → Signup Conv.    TBD          +15-20%      Better expectation setting
Bounce Rate               ~50%         <40%         Immediate relevance
Support Tickets           TBD          No increase  Clearer FAQ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY DRIVER:
Users understand product purpose within 5 seconds
↓
Self-select as good fit (or leave quickly)
↓
Higher quality signups
↓
Better retention and engagement
```

---

## Implementation Complexity

### Effort by Section

```
SECTION                  COMPLEXITY    TIME ESTIMATE    NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HeroSection              Medium        2-3 hours        New composite image needed
FeaturesSection          High          4-6 hours        6 new screenshots + copy
CardsWithIconsSection    Low           1-2 hours        Copy only
BigImageCTASection       Medium        2-3 hours        Before/after image needed
HowItWorksCards          Low           1-2 hours        Copy only
FAQSection               Medium        3-4 hours        8 updates, verify rich text
PromoCTASection          Low           1 hour           Copy only
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL (Copy Only)        -             12-16 hours      No screenshots
TOTAL (With Screenshots) -             22-34 hours      Includes capture/edit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK FACTORS:
- Translation length variations may break layouts
- Screenshot quality consistency
- Mobile responsiveness with new content
- Cross-browser testing time
```

---

## Next Steps Visualization

```
YOUR REVIEW (Now)
    ↓
[Approve Core Messaging]
[Decide Screenshot Strategy]
[Confirm Timeline]
    ↓
    ├─→ If Approved:
    │       ↓
    │   PHASE 1: Copy Updates (Days 1-3)
    │       ↓
    │   Update locale files (en, ru, es)
    │       ↓
    │   Test translations render correctly
    │       ↓
    │   PHASE 2: Visual Updates (Days 4-7)
    │       ↓
    │   Capture/create screenshots
    │       ↓
    │   Update component image paths
    │       ↓
    │   PHASE 3: Testing (Days 8-10)
    │       ↓
    │   Desktop + Mobile testing
    │       ↓
    │   Accessibility audit
    │       ↓
    │   LAUNCH 🚀
    │
    └─→ If Changes Needed:
            ↓
        Provide feedback
            ↓
        I revise proposals
            ↓
        Second review round
            ↓
        Then proceed to approval path
```

---

**This visual guide should help you quickly grasp the scope and direction of changes!**
