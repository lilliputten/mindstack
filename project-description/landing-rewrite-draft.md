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
Instead of a plain screenshot, suggest a **collage/composite image** showing:
- Left side: Topic creation interface (form with title, category selection)
- Center: Question-answer editor with AI generation button highlighted
- Right side: Training session in progress
- Overlay elements: Checkmarks for validation steps, arrows showing workflow

**Image Generation Prompt Ideas:**
```
Modern UI collage showing three panels:
1. Topic creation form with clean inputs
2. Rich text editor with Q&A pairs and AI sparkles icon
3. Interactive quiz card with answer reveal
Color scheme: professional blue-purple gradient
Style: Clean, modern SaaS dashboard aesthetic
Mood: Productive, focused, empowering
```

**Alternative:** Use an actual screenshot but add overlay graphics (arrows, callouts) highlighting the "Create → Validate → Train" flow.

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
- **Image:** Screenshot of topic creation page or "My Topics" view
- **Why:** Establishes the core value proposition immediately

**Card 2: Smart Content Generation & Review**
- **Title:** "Generate, Check, Perfect"
- **Text:** "Use AI to draft questions and answers instantly, then review and edit before saving. Regenerate until quality meets your standards."
- **Image:** Screenshot showing AI generation button + inline editor
- **Why:** Highlights the unique generation-validation workflow

**Card 3: Duplicate Detection**
- **Title:** "Keep Your Data Clean"
- **Text:** "Compare new items against existing ones to catch duplicates and near-duplicates. Beta similarity algorithms help maintain dataset quality as it grows."
- **Image:** Screenshot of comparison interface or duplicate warning UI
- **Why:** Technical differentiator that solves a real pain point

**Card 4: In-Place Editing Workflow**
- **Title:** "Edit Without Context Switching"
- **Text:** "Modify questions and answers directly in the training interface using our rich HeadlessEditor. No separate editing mode needed."
- **Image:** Screenshot of inline editing in action
- **Why:** Emphasizes UX efficiency

**Card 5: Private or Public—Your Choice**
- **Title:** "Control Your Privacy"
- **Text:** "Keep topics private by default for personal use. Share selected topics publicly when you want to contribute to the community."
- **Image:** Screenshot showing privacy toggle or public/private topic badges
- **Why:** Addresses data ownership concerns

**Card 6: Structured for Scale**
- **Title:** "Organized Hierarchy That Grows With You"
- **Text:** "Categories → Topics → Questions → Answers. A clear structure that keeps your knowledge base manageable whether you have 10 or 1000 items."
- **Image:** Diagram or screenshot showing the hierarchy visually
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
Show a **before/after transformation**:
- Left: Messy notes, scattered documents, browser tabs (chaos)
- Arrow pointing right
- Right: Clean MindStack interface with organized topic, structured Q&A (order)

**Image Prompt:**
```
Split-screen composition:
Left side: Disorganized workspace with sticky notes, open books, multiple browser windows, handwritten notes
Right side: Clean MindStack UI showing organized topic with categorized questions
Center: Bold arrow connecting left to right
Style: Modern, professional, slightly aspirational
Colors: Warm tones on left (chaos), cool professional blues on right (order)
```

---

### 6. RecentTopicsSection

**Current State:** ✅ Good—shows real DB data

**Minor Enhancement:**
Add context: "Recently updated public topics from the community" to clarify these are shared examples, not the primary use case.

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

**Card 2: Build & Validate Content**
- **Icon:** `Icons.CheckCircle` or `Icons.Shield`
- **Title:** "Generate, Review, Refine"
- **Text:** "Add questions manually or use AI generation. Compare new items against existing ones to avoid duplicates. Edit in place until everything looks right."

**Card 3: Train & Iterate**
- **Icon:** `Icons.Repeat` or `Icons.TrendingUp`
- **Title:** "Practice and Improve"
- **Text:** "Run repetition sessions on your validated data. Track performance, identify weak areas, and continuously refine your topic as you learn."

**Section Title:** "How MindStack Works"  
**Section Description:** "A complete workflow from idea to mastery"

**Alternative 6-Card Version** (if you want more detail):

1. **Pick a Category** — Browse existing or request new ones
2. **Create a Topic** — Private by default, public if you choose
3. **Add Questions** — Write manually or generate with AI
4. **Validate Content** — Check for duplicates, edit in place
5. **Save & Organize** — Approved data goes into your structured library
6. **Start Training** — Run sessions, track progress, iterate

---

### 8. DescriptionCodeSection

**Current State:** Unused

**Proposal:** **Remove this section entirely** unless you have a specific technical audience use case.

**Alternative Idea** (if kept): Show a JSON snippet representing the data structure:

```json
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

---

## Visual Asset Strategy

### Screenshot Capture Guidelines

For each feature card, capture screenshots showing:

1. **Real UI states** (not mockups)—authenticity builds trust
2. **Clear focal points**—use browser dev tools to highlight buttons/sections if needed
3. **Consistent theme**—all screenshots should use the same color theme (light or dark, pick one)
4. **Minimal chrome**—crop out browser URL bar, use full-window captures
5. **Annotated overlays** (optional)—add arrows/callouts in post-production to guide attention

### Specific Screenshots Needed

**HeroSection:**
- Composite: Topic creation + Editor + Training session (or generate via AI prompt above)

**FeaturesSection:**
1. Card 1: "My Topics" page showing topic list with create button
2. Card 2: Question editor with "Generate with AI" button visible
3. Card 3: Duplicate warning/comparison UI (if exists, otherwise mock up)
4. Card 4: Inline editing in action (cursor in editable field)
5. Card 5: Topic settings showing privacy toggle
6. Card 6: Category → Topic → Question hierarchy visualization

**BigImageCTASection:**
- Before/after composite (messy notes → organized MindStack topic)

**HowItWorksCards:**
- Icons are sufficient, but could add small thumbnail screenshots below each card

### Temporary Solution

If screenshots aren't ready yet:
- Use placeholder gradients with text overlays describing what will be shown
- Example: `bg-gradient-to-br from-blue-500 to-purple-600` with centered text "Topic Creation Interface"
- Update roadmap to mark "Capture production screenshots" as pending task

---

## Implementation Priority

**Phase 1: Copy Updates (High Priority)**
1. Update locale files with new text (en.json, ru.json, es.json)
2. Test all translations render correctly
3. Verify no broken layout due to text length changes

**Phase 2: Visual Updates (Medium Priority)**
1. Capture/create new screenshots
2. Replace image paths in components
3. Add alt text for accessibility

**Phase 3: Structural Changes (Lower Priority)**
1. Remove DescriptionCodeSection if decided
2. Reorder sections if needed based on user feedback
3. A/B test different CTA copy variations

---

## Open Questions for Review

1. **Tone:** Should we be more aggressive about "NOT a learning platform" or keep it softer?
2. **Technical Depth:** How much should we mention the beta status of similarity algorithms? (Currently being transparent but not alarming)
3. **Screenshots vs. Illustrations:** Invest in real UI captures or use generated/artistic visuals for hero sections?
4. **Social Proof:** Do we have user stats/testimonials to add, or should we skip for now?
5. **Mobile Responsiveness:** All proposed screenshots are desktop-oriented—should we capture mobile views too?

---

## Next Steps

After your review:
1. ✅ Mark this document as reviewed/approved with comments
2. 📝 I'll update `project-description-roadmap.md` to mark Step 3 as in progress
3. 🔧 Begin implementing approved changes in locale files and components
4. 📸 Coordinate screenshot capture/creation tasks
5. 🧪 Test all changes before marking Step 3 complete

