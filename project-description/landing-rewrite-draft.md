# Landing Page Rewrite Draft

**Status:** In Progress - Ready for Review  
**Date:** 2026-04-14  
**Focus:** Reframe landing from "learning platform" to "personal training creation tool"

---

## Core Messaging Shift

**OLD:** "Train Your Brain. Build Your Knowledge." (passive learning)  
**NEW:** "Create Custom Trainings From Your Own Knowledge" (active authoring)

**Key Principle:** MindStack is not about consuming pre-made courses—it's about building your own repetition training system from YOUR topics, YOUR questions, and YOUR use cases.

---

## Available Real Screenshots

See [landing-screenshots.md](./landing-screenshots.md) for complete catalog of available screenshots.

**Key Screenshots for Landing:**

**Hero Section:**
- `v.0.1.4/welcome page with premium account info and unlimited ai generations.png` - Welcome page showing value proposition

**Features Section:**
- Card 1 (Build From Your Own Knowledge): `v.0.1.3/categories.png` or `v.0.1.4/available topics list with a filter.png`
- Card 2 (Generate, Check, Perfect): `v.0.1.4/generate questions dialog 3.png`
- Card 3 (Keep Data Clean): `v.0.1.4/questions comparison.png` - Shows similarity detection
- Card 4 (Edit Without Context Switching): `v.0.1.4/edit topic questions and answers.png`
- Card 5 (Control Your Privacy): `v.0.1.4/mobile panel.png` - Shows settings/privacy
- Card 6 (Organized Hierarchy): `v.0.1.3/topics.png` - Shows filtering and organization

**How It Works:**
- Step 1: `v.0.1.4/signin popup screen.png` - Getting started
- Step 2: `v.0.1.4/generated questions with opened and editing answer.png` - Generation and editing
- Step 3: `v.0.1.3/trainig step questions 2.png` - Training in action

**Training/Results:**
- `v.0.1.3/training results.png` - Shows outcomes
- `v.0.1.4/not started training.png` - Training preparation

**Pricing/Payment:**
- `v.0.1.3/pricing.png` - Pricing plans
- `v.0.1.3/payment method.png` - Payment options

**Settings/User Info:**
- `v.0.1.4/language selection.png` - Multi-language support
- `v.0.1.3/settings.png` - User customization

---

## Section-by-Section Rewrite Plan

### 1. HeroSection

**Current State:**
- Title: "Train Your Brain. Build Your Knowledge."
- Description: Generic AI-powered memory training message
- Visual: Screenshot `/static/landing/features/14clean.jpg`
- CTAs: "Start Training Free" + "Available Categories"

**Issues:**
- Focuses on passive consumption ("train your brain")
- Doesn't communicate the core value: creating YOUR OWN training data
- Image is just a screenshot—needs more impact

**Proposed Changes:**

**Title Options:**
1. **"Turn Your Knowledge Into Repeatable Trainings"** (recommended)
2. "Build Personal Training Systems From Your Own Topics"
3. "Create, Validate, and Train With Your Own Data"

**Description Options:**
1. **"MindStack helps you create structured question-answer datasets from your personal topics, validate them with AI assistance, and run effective repetition trainings—all in one workflow."** (recommended)
2. "Stop adapting to generic courses. Build custom training modules from your real-world knowledge, check quality before saving, and practice what matters to you."
3. "A personal-first platform for creating, organizing, and training with your own topics. Generate, compare, edit, and master your unique knowledge base."

**CTA Button Text:**
- Primary: **"Start Creating Your First Topic"** or **"Build Your Training"**
- Secondary: "Explore Public Topics" (instead of "Available Categories")

**Visual Strategy:**
✅ **Use Real Screenshot:** `v.0.1.4/welcome page with premium account info and unlimited ai generations.png`
- Shows the welcome/onboarding experience
- Demonstrates value proposition visually
- More authentic than composite images

**Alternative:** If welcome page doesn't fit, use `v.0.1.4/available topics list with a filter.png` to show the breadth of available content.

---

### 2. FeaturesSection

**Current State:**
6 feature cards focused on:
1. Create and organize knowledge
2. Practice within community
3. AI-powered content creation
4. Multi-language learning
5. Progress analytics
6. Share and collaborate

**Issues:**
- Card 2 emphasizes community over personal creation
- Cards 4-6 are secondary features, not core differentiators
- Missing: duplicate checking, generation review loop, privacy control

**Proposed New Feature Set (6 cards):**

**Card 1: Personal-First Training Builder**
- **Title:** "Build From Your Own Knowledge"
- **Text:** "Create topics around your real work, studies, or interests. No generic courses—just your personalized training datasets organized by categories."
- **Image:** ✅ `v.0.1.3/categories.png` - Shows category browsing and filtering
- **Why:** Establishes the core value proposition immediately

**Card 2: Smart Content Generation & Review**
- **Title:** "Generate, Check, Perfect"
- **Text:** "Use AI to draft questions and answers instantly, then review and edit before saving. Regenerate until quality meets your standards."
- **Image:** ✅ `v.0.1.4/generate questions dialog 3.png` - Shows AI generation interface
- **Why:** Highlights the unique generation-validation workflow

**Card 3: Duplicate Detection**
- **Title:** "Keep Your Data Clean"
- **Text:** "Compare new items against existing ones to catch duplicates and near-duplicates. Beta similarity algorithms help maintain dataset quality as it grows."
- **Image:** ✅ `v.0.1.4/questions comparison.png` - Shows similarity comparison with different rates
- **Why:** Technical differentiator that solves a real pain point

**Card 4: In-Place Editing Workflow**
- **Title:** "Edit Without Context Switching"
- **Text:** "Modify questions and answers directly in the training interface using our rich HeadlessEditor. No separate editing mode needed."
- **Image:** ✅ `v.0.1.4/edit topic questions and answers.png` - Shows inline editing
- **Why:** Emphasizes UX efficiency

**Card 5: Private or Public—Your Choice**
- **Title:** "Control Your Privacy"
- **Text:** "Keep topics private by default for personal use. Share selected topics publicly when you want to contribute to the community."
- **Image:** ✅ `v.0.1.4/mobile panel.png` - Shows mobile settings panel with privacy controls
- **Why:** Addresses data ownership concerns

**Card 6: Structured for Scale**
- **Title:** "Organized Hierarchy That Grows With You"
- **Text:** "Categories → Topics → Questions → Answers. A clear structure that keeps your knowledge base manageable whether you have 10 or 1000 items."
- **Image:** ✅ `v.0.1.4/available topics list with a filter.png` - Shows topic organization with filters
- **Why:** Shows the system can handle complexity

**Section Title:** "Everything You Need to Build Quality Training Datasets"  
**Section Description:** "From initial idea to active training session, MindStack provides tools for creating, validating, and practicing with your personal knowledge base."

---

### 3. RecentCategoriesSection

**Current State:** ✅ Good—shows real DB data with links to explore/suggest

**Minor Enhancement:**
Add a subtitle or tooltip clarifying: "Browse existing categories or request new ones from administrators"

No major changes needed.

---

### 4. CardsWithIconsSection

**Current State:**
3 cards about learning science (timed reviews, retrieval practice, smart focus)

**Issues:**
- These explain WHY spaced repetition works, not WHAT MindStack does differently
- Users care more about creation workflow than learning theory
- Doesn't align with "training builder" positioning

**Proposed New Cards (3 cards):**

**Option A: Authoring Workflow Focus**

**Card 1: Fast Topic Creation**
- **Icon:** `Icons.Plus` or `Icons.FilePlus`
- **Title:** "Quick Setup"
- **Text:** "Create a topic in seconds. Choose a category, set privacy, add your first question—or let AI generate a starter set."

**Card 2: Generation Control**
- **Icon:** `Icons.WandSparkles` or `Icons.RefreshCw`
- **Title:** "Review Before Save"
- **Text:** "Generated content stays in draft mode until you approve it. Edit, regenerate, or discard—full control over your dataset."

**Card 3: Immediate Training**
- **Icon:** `Icons.Play` or `Icons.Dumbbell`
- **Title:** "Train Instantly"
- **Text:** "Start repetition sessions as soon as you save your first question. No waiting, no setup delays."

**Section Title:** "Streamlined From Creation to Practice"  
**Section Description:** "Every step optimized for speed and control"

---

**Option B: User Journey Focus** (alternative approach)

**Card 1: For Individual Learners**
- **Icon:** `Icons.User`
- **Title:** "Personal Knowledge Base"
- **Text:** "Build private training modules from your work materials, study notes, or hobby topics."

**Card 2: For Teams & Educators**
- **Icon:** `Icons.Users`
- **Title:** "Share Curated Content"
- **Text:** "Publish selected topics for students, colleagues, or community members while keeping sensitive data private."

**Card 3: For Developers & Tech Users**
- **Icon:** `Icons.Code` or `Icons.Terminal`
- **Title:** "API-Ready Structure"
- **Text:** "Clean hierarchical data model makes it easy to export, integrate, or build custom workflows."

**Section Title:** "Built for Different Use Cases"  
**Section Description:** "Whether personal, collaborative, or technical"

---

**Recommendation:** Go with **Option A** (Authoring Workflow) as it's more actionable and directly supports the "creation tool" positioning.

---

### 5. BigImageCTASection

**Current State:**
- Title: "Build Your Knowledge Base Today"
- Description: Generic multi-purpose learning statement
- CTA: "Try It Free"
- Visual: Screenshot `/static/landing/features/02.jpg`

**Issues:**
- Still sounds like passive knowledge accumulation
- Doesn't emphasize the active creation aspect
- Weak CTA

**Proposed Changes:**

**Title Options:**
1. **"Your Knowledge Deserves Better Than Flashcards"** (recommended—emotional hook)
2. "Stop Using Generic Courses. Build What Actually Matters to You."
3. "From Scattered Notes to Structured Training in Minutes"

**Description Options:**
1. **"MindStack transforms your raw information—work documents, study materials, technical references—into organized, trainable datasets with built-in quality checks."** (recommended)
2. "Whether you're preparing for certifications, mastering new technologies, or preserving institutional knowledge, create training systems tailored to your exact needs."
3. "No more adapting to someone else's curriculum. Define your own topics, generate smart question-answer pairs, and practice with confidence."

**CTA Button:**
- **"Create Your First Topic Now"** or **"Start Building Free"**

**Visual Strategy:**
✅ **Use Real Screenshot:** `v.0.1.4/generated questions saved with active comparison.png`
- Shows the complete workflow: generated questions with comparison active
- Demonstrates the value of validation before saving
- More authentic than before/after composite

**Alternative:** Use `v.0.1.4/generated questions filtering.png` to show how users can organize and filter their generated content.

---

### 6. RecentTopicsSection

**Current State:** ✅ Good—shows real DB data

**Minor Enhancement:**
Add context: "Recently updated public topics from the community" to clarify these are shared examples, not the primary use case.

**Screenshot Reference:** Already uses dynamic DB data - no static screenshot needed.

---

### 7. HowItWorksCards

**Current State:**
3 steps: Create/Choose Topics → Train with Smart Workouts → Track and Improve

**Issues:**
- Too focused on the training/consumption side
- Missing the critical validation/review step
- Doesn't show the iterative nature of content creation

**Proposed New Steps (3 cards):**

**Card 1: Define Your Topic**
- **Icon:** `Icons.FolderPlus` or `Icons.BookOpen`
- **Title:** "Create or Choose a Topic"
- **Text:** "Start a new topic under a relevant category, or browse public topics for inspiration. Set it as private or public based on your needs."
- **Visual:** ✅ `v.0.1.4/signin popup screen.png` - Shows getting started/authentication

**Card 2: Build & Validate Content**
- **Icon:** `Icons.CheckCircle` or `Icons.Shield`
- **Title:** "Generate, Review, Refine"
- **Text:** "Add questions manually or use AI generation. Compare new items against existing ones to avoid duplicates. Edit in place until everything looks right."
- **Visual:** ✅ `v.0.1.4/generated questions with opened and editing answer.png` - Shows generation + editing workflow

**Card 3: Train & Iterate**
- **Icon:** `Icons.Repeat` or `Icons.TrendingUp`
- **Title:** "Practice and Improve"
- **Text:** "Run repetition sessions on your validated data. Track performance, identify weak areas, and continuously refine your topic as you learn."
- **Visual:** ✅ `v.0.1.3/trainig step questions 2.png` - Shows training session in action

**Section Title:** "How MindStack Works"  
**Section Description:** "A complete workflow from idea to mastery"

**Alternative Visuals:**
- For Card 3, could also use `v.0.1.3/training results.png` to show outcomes
- Or `v.0.1.4/not started training.png` to show preparation phase

---

### 8. DescriptionCodeSection

**Current State:** Unused

**Proposal:** **Remove this section entirely** unless you have a specific technical audience use case.

**Alternative Idea** (if kept): Show a JSON snippet representing the data structure:

``json
{
  "category": "Programming",
  "topic": "React Hooks",
  "questions": [
    {
      "text": "What is useState?",
      "answer": "A Hook that lets you add React state to function components...",
      "similarity_score": 0.95,
      "status": "validated"
    }
  ]
}
```

**Caption:** "Clean, structured data model ready for training or export"

**Recommendation:** Skip this section for now. It adds complexity without clear value for the main landing audience.

---

### 9. FAQSection

**Current State:** 12 FAQs, several problematic:
- ❌ "What learning techniques does MindStack use?" (too academic)
- ❌ "Is there a mobile app?" (not relevant—PWA covers this)
- ❌ "Can I use MindStack for learning programming?" (too narrow)
- ❌ Several focus on consumption, not creation

**Proposed New FAQ Set (8-10 questions):**

**Q1: What is MindStack?**
**A:** "MindStack is a platform for creating personal repetition training systems. Instead of using pre-made courses, you build your own question-answer datasets from topics that matter to you—work materials, study subjects, technical references, or anything else. The system helps you generate, validate, and practice with your content."

**Q2: How is this different from Anki or Quizlet?**
**A:** "While those tools focus on flashcard management, MindStack emphasizes the entire content creation workflow. You get AI-assisted generation, duplicate detection, in-place editing, and a structured hierarchy (categories → topics → questions → answers). It's designed for building quality datasets, not just storing cards."

**Q3: Do I need to write all questions and answers manually?**
**A:** "No. You can write them manually, use AI to generate drafts, or combine both approaches. The key difference is that generated content stays in review mode—you check, edit, and approve everything before it becomes part of your training dataset."

**Q4: How does the duplicate detection work?**
**A:** "Our beta similarity algorithm compares new questions and answers against existing ones in your topic using text analysis (including stemming for better matching). It flags potential duplicates so you can decide whether to merge, rephrase, or keep both. Note: This feature is still improving and works best with clear, distinct phrasing."

**Q5: Can I keep my topics private?**
**A:** "Yes. Topics are private by default. Only you can see and train on them. You can optionally make topics public to share with the community, but this is completely your choice."

**Q6: What happens if I'm not satisfied with AI-generated content?**
**A:** "You have full control. You can edit any generated item, regenerate specific questions, or delete them entirely. Nothing is saved to your database until you explicitly approve it. Think of AI as a drafting assistant, not an autopilot."

**Q7: What's included in the free plan?**
**A:** "The Basic (free) tier gives you access to core creation and training features. Paid plans (Pro/Premium) unlock higher limits, advanced analytics, and priority AI usage. See our <LinkPricing>pricing page</LinkPricing> for detailed comparisons."

**Q8: Can I use MindStack without registering?**
**A:** "Guests can explore public topics and try sample workouts, but progress isn't saved. To create your own topics, save data, and track history, you'll need a free account. Registration takes seconds via OAuth (Google, GitHub, Yandex) or email/Telegram OTP."

**Q9: How do I request a new category?**
**A:** "Registered users can submit category creation requests through the embedded form on the categories page. Our team reviews submissions and adds relevant categories to keep the system organized."

**Q10: Is there a Telegram bot?**
**A:** "Yes, but it's currently limited to authentication only. We're working on adding progress tracking and payment support in future updates."

**Removed Questions:**
- "What learning techniques does MindStack use?" → Too theoretical
- "Is there a mobile app?" → Covered by PWA explanation
- "Can I use MindStack for learning programming?" → Too specific; general FAQs cover all use cases
- "How do I track my progress?" → Keep but simplify
- "How does the workout system work?" → Merge into Q1/Q6

**Section Title:** "Common Questions"  
**Section Description:** "Everything you need to know about creating and using personal training datasets"

---

### 10. PromoCTASection

**Current State:** Generic "start training" banner

**Issues:**
- Passive messaging
- Doesn't reinforce the creation value prop

**Proposed Changes:**

**Title Options:**
1. **"Ready to Build Your First Training System?"** (recommended)
2. "Your Knowledge Is Worth More Than Scattered Notes"
3. "Start Creating Smarter Study Materials Today"

**Description Options:**
1. **"Join users who are transforming their work docs, study materials, and reference guides into structured, trainable datasets. Free to start, powerful when you need it."**
2. "Stop searching for the perfect course. Create exactly what you need, validate it thoroughly, and practice with confidence."
3. "Whether you're studying for exams, onboarding new team members, or mastering a skill—MindStack adapts to your goals."

**CTA Button:**
- **"Create Your Account"** or **"Start Building Now"**

**Visual Element:**
Consider adding social proof here:
- "X+ topics created" / "Y+ active users" (if you have stats)
- Or a testimonial quote (even if placeholder for now)

**Screenshot Option:** Could use `v.0.1.3/pricing.png` to show pricing transparency, or `v.0.1.4/welcome page with premium account info and unlimited ai generations.png` to show premium benefits.

---

## Visual Asset Strategy

### Screenshot Mapping Summary

All screenshots referenced above are from the real application (see [landing-screenshots.md](./landing-screenshots.md)). Here's the complete mapping:

| Section | Screenshot Path | Purpose |
|---------|----------------|---------|
| **Hero** | `v.0.1.4/welcome page with premium account info and unlimited ai generations.png` | Welcome/onboarding value prop |
| **Feature 1** | `v.0.1.3/categories.png` | Category browsing/filtering |
| **Feature 2** | `v.0.1.4/generate questions dialog 3.png` | AI generation interface |
| **Feature 3** | `v.0.1.4/questions comparison.png` | Duplicate/similarity detection |
| **Feature 4** | `v.0.1.4/edit topic questions and answers.png` | Inline editing workflow |
| **Feature 5** | `v.0.1.4/mobile panel.png` | Privacy/settings controls |
| **Feature 6** | `v.0.1.4/available topics list with a filter.png` | Topic organization |
| **BigImageCTA** | `v.0.1.4/generated questions saved with active comparison.png` | Complete workflow demonstration |
| **HowItWorks 1** | `v.0.1.4/signin popup screen.png` | Getting started |
| **HowItWorks 2** | `v.0.1.4/generated questions with opened and editing answer.png` | Generation + editing |
| **HowItWorks 3** | `v.0.1.3/trainig step questions 2.png` | Training in action |
| **PromoCTA** | `v.0.1.3/pricing.png` (optional) | Pricing transparency |

### Screenshot Specifications

**Current State:**
- All screenshots are from v.0.1.3 and v.0.1.4
- Located in project folder (paths relative to assets directory)
- Mix of desktop and mobile views

**Requirements for Landing:**
1. **Consistent Theme:** Verify all screenshots use same color theme (light or dark)
2. **Resolution:** Ensure minimum 1920x1080 for desktop, optimize for web
3. **Format:** Convert to WebP or optimized JPG for faster loading
4. **Naming:** Use descriptive names like `feature-duplicate-detection.webp`
5. **Alt Text:** Write descriptive alt text for accessibility

**Location:** Move to `/public/static/landing/features/` with organized naming

### Temporary Solution

If some screenshots need optimization:
- Use current versions with CSS overlays to highlight key areas
- Add captions explaining what's shown
- Plan Phase 2 screenshot refresh after initial launch

---

## Implementation Priority

**Phase 1: Copy Updates (High Priority)**
1. Update locale files with new text (en.json, ru.json, es.json)
2. Test all translations render correctly
3. Verify no broken layout due to text length changes

**Phase 2: Visual Updates (Medium Priority)**
1. Optimize and organize screenshots from landing-screenshots.md
2. Map screenshots to component sections per table above
3. Update image paths in components
4. Add alt text for accessibility

**Phase 3: Structural Changes (Lower Priority)**
1. Remove DescriptionCodeSection if decided
2. Reorder sections if needed based on user feedback
3. A/B test different CTA copy variations

---

## Open Questions for Review

1. **Tone:** Should we be more aggressive about "NOT a learning platform" or keep it softer?
2. **Technical Depth:** How much should we mention the beta status of similarity algorithms? (Currently being transparent but not alarming)
3. **Screenshot Quality:** Do existing screenshots need enhancement (annotations, callouts) or are they clear enough as-is?
4. **Social Proof:** Do we have user stats/testimonials to add, or should we skip for now?
5. **Mobile Responsiveness:** Some screenshots are mobile views—should we prioritize desktop or show both?

---

## Next Steps

After your review:
1. ✅ Mark this document as reviewed/approved with comments
2. 📝 I'll update `project-description-roadmap.md` to mark Step 3 as in progress
3. 🔧 Begin implementing approved changes in locale files and components
4. 📸 Organize and optimize screenshots from landing-screenshots.md
5. 🧪 Test all changes before marking Step 3 complete

