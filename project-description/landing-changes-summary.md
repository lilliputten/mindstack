# Landing Page Changes Summary

**Quick Reference Guide** - What's Changing and Why

---

## Core Messaging Shift

| Aspect | OLD | NEW |
|--------|-----|-----|
| **Primary Focus** | Learning/consuming content | Creating personal training systems |
| **User Role** | Student/learner | Author/builder |
| **Value Prop** | "Train your brain" | "Build from your knowledge" |
| **Key Workflow** | Study → Practice → Improve | Create → Validate → Train → Iterate |

---

## Section Changes at a Glance

### 1. HeroSection ✅ High Priority
- **Title:** "Train Your Brain" → **"Turn Your Knowledge Into Repeatable Trainings"**
- **Description:** Generic AI message → **Specific workflow description**
- **CTA:** "Start Training Free" → **"Start Creating Your First Topic"**
- **Visual:** Plain screenshot → **Composite/collage showing creation flow**

### 2. FeaturesSection ✅ High Priority
**Complete card rewrite:**
1. ❌ "Practice Within Community" → ✅ **"Build From Your Own Knowledge"**
2. ❌ "AI-Powered Content Creation" → ✅ **"Generate, Check, Perfect"** (emphasizes review)
3. ❌ "Multi-Language Learning" → ✅ **"Keep Your Data Clean"** (duplicate detection)
4. ❌ "Progress Analytics" → ✅ **"Edit Without Context Switching"** (in-place editing)
5. ❌ "Share and Collaborate" → ✅ **"Control Your Privacy"** (private by default)
6. ➕ NEW: **"Organized Hierarchy That Grows With You"** (structure for scale)

### 3. CardsWithIconsSection 🔄 Medium Priority
**From learning theory to workflow:**
- ❌ "Timed Reviews" → ✅ **"Quick Setup"**
- ❌ "Retrieval Practice" → ✅ **"Review Before Save"**
- ❌ "Smart Focus" → ✅ **"Train Instantly"**

### 4. BigImageCTASection 🔄 Medium Priority
- **Title:** "Build Your Knowledge Base Today" → **"Your Knowledge Deserves Better Than Flashcards"**
- **Focus:** Passive accumulation → **Active transformation of scattered notes**
- **Visual:** Single screenshot → **Before/after transformation**

### 5. HowItWorksCards 🔄 Medium Priority
**Emphasize validation step:**
1. "Create or Choose Topics" → **"Define Your Topic"** (clearer)
2. "Train with Smart Workouts" → **"Generate, Review, Refine"** (adds validation)
3. "Track and Improve" → **"Practice and Iterate"** (continuous improvement)

### 6. FAQSection ✅ High Priority
**Major overhaul - remove 4, add 4:**

**REMOVE:**
- ❌ "What learning techniques does MindStack use?"
- ❌ "Is there a mobile app?"
- ❌ "Can I use MindStack for learning programming?"
- ❌ "How do I track my progress?" (merge into main FAQ)

**ADD:**
- ✅ "How is this different from Anki or Quizlet?"
- ✅ "Do I need to write all questions manually?"
- ✅ "How does duplicate detection work?"
- ✅ "What if I'm not satisfied with AI-generated content?"

**KEEP & UPDATE:**
- ✓ "What is MindStack?" (rewrite for creation focus)
- ✓ "Can I keep topics private?" (emphasize default privacy)
- ✓ "What's included in free plan?" (link to /pricing)
- ✓ "Can I use without registering?" (clarify guest limitations)

### 7. PromoCTASection 🔄 Medium Priority
- **Title:** Generic CTA → **"Ready to Build Your First Training System?"**
- **Tone:** Passive → **Action-oriented with social proof**

### 8. DescriptionCodeSection ❌ Remove
- Not needed for main audience
- Consider for separate technical docs page

---

## Visual Asset Requirements

### Real Screenshots Available (from landing-screenshots.md)

✅ **All required screenshots already exist!** No need for new captures or AI generation.

**Screenshot Mapping:**

1. **HeroSection** 
   - ✅ Use: `v.0.1.4/welcome page with premium account info and unlimited ai generations.png`
   - Shows welcome/onboarding experience with value proposition

2. **FeaturesSection** (6 cards)
   - Card 1: ✅ `v.0.1.3/categories.png` - Category browsing/filtering
   - Card 2: ✅ `v.0.1.4/generate questions dialog 3.png` - AI generation interface
   - Card 3: ✅ `v.0.1.4/questions comparison.png` - Duplicate detection with similarity rates
   - Card 4: ✅ `v.0.1.4/edit topic questions and answers.png` - Inline editing workflow
   - Card 5: ✅ `v.0.1.4/mobile panel.png` - Settings/privacy controls
   - Card 6: ✅ `v.0.1.4/available topics list with a filter.png` - Topic organization

3. **BigImageCTASection**
   - ✅ Use: `v.0.1.4/generated questions saved with active comparison.png`
   - Shows complete workflow: generated content with validation

4. **HowItWorksCards** (3 steps)
   - Step 1: ✅ `v.0.1.4/signin popup screen.png` - Getting started
   - Step 2: ✅ `v.0.1.4/generated questions with opened and editing answer.png` - Generation + editing
   - Step 3: ✅ `v.0.1.3/trainig step questions 2.png` - Training in action

5. **PromoCTASection** (optional)
   - ✅ Use: `v.0.1.3/pricing.png` - Shows pricing transparency

### Additional Available Screenshots (for future use)

- `v.0.1.4/delete questions confirmation.png` - Editing process/deletion
- `v.0.1.4/generated questions filtering.png` - Content filtering
- `v.0.1.4/generated questions and answers list.png` - Generated Q&A overview
- `v.0.1.3/training results.png` - Training outcomes
- `v.0.1.4/not started training.png` - Training preparation
- `v.0.1.3/payment method.png` - Payment options
- `v.0.1.4/language selection.png` - Multi-language support
- `v.0.1.3/settings.png` - User settings (mobile)

### Screenshot Optimization Checklist

**Current State:**
- All screenshots from v.0.1.3 and v.0.1.4
- Various resolutions and formats
- Located in project assets folder

**Required Actions:**
- [ ] Verify all screenshots use consistent theme (light/dark mode)
- [ ] Optimize resolution (target: 1920x1080 max, WebP format)
- [ ] Compress for web (target: <200KB per image)
- [ ] Move to `/public/static/landing/features/` directory
- [ ] Rename with descriptive names (e.g., `feature-duplicate-detection.webp`)
- [ ] Write alt text for each image (accessibility)
- [ ] Test loading performance on landing page

**Estimated Effort:** 2-3 hours for optimization and organization

---

## Implementation Checklist

### Phase 1: Copy Updates (Days 1-3)

**Locale Files (en.json, ru.json, es.json):**
- [ ] Update `Landing.HeroSection.*`
- [ ] Update `Landing.FeaturesSection.Card-*` (all 6 cards)
- [ ] Update `Landing.CardsWithIconsSection.*` (all 3 cards)
- [ ] Update `Landing.BigImageCTASection.*`
- [ ] Update `Landing.HowItWorksCards.*` (all 3 cards)
- [ ] Update `Landing.FAQSection.*` (remove 4, add 4, update 4)
- [ ] Update `Landing.PromoCTASection.*`

**Component Files:**
- [ ] Verify no hardcoded text in components
- [ ] Test all translations render correctly
- [ ] Check layout doesn't break with new text lengths

### Phase 2: Visual Updates (Days 4-7)

**Screenshot Capture:**
- [ ] Capture hero composite (or generate via AI)
- [ ] Capture 6 feature card screenshots
- [ ] Capture before/after for CTA section
- [ ] Optimize images (compress, resize)
- [ ] Upload to `/public/static/landing/features/`

**Component Updates:**
- [ ] Update `HeroSection.tsx` image path
- [ ] Update `FeaturesSection.tsx` image paths (6 cards)
- [ ] Update `BigImageCTASection.tsx` image path
- [ ] Add alt text for accessibility

### Phase 3: Testing & Polish (Days 8-10)

**Functional Testing:**
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify all links work (especially /pricing)

**Performance Testing:**
- [ ] Check page load time (target: <3s)
- [ ] Verify image lazy loading works
- [ ] Test with slow network connection

**Content Review:**
- [ ] Proofread all English copy
- [ ] Review Russian translations (native speaker if possible)
- [ ] Review Spanish translations (native speaker if possible)
- [ ] Check for consistency in terminology

### Phase 4: Launch & Monitor (Ongoing)

**Pre-Launch:**
- [ ] Create backup branch (in case rollback needed)
- [ ] Set up analytics tracking for new CTAs
- [ ] Prepare A/B test variations (if applicable)

**Post-Launch (Week 1):**
- [ ] Monitor conversion rate (landing → signup)
- [ ] Track scroll depth
- [ ] Collect user feedback
- [ ] Watch for support tickets about confusion

**Post-Launch (Week 2-4):**
- [ ] Analyze A/B test results (if running)
- [ ] Iterate based on data
- [ ] Plan next optimization cycle

---

## Risk Mitigation

### Potential Issues & Solutions

**Issue 1: New copy is too long/short for existing layout**
- **Solution:** Test with extreme text lengths during development
- **Fallback:** Adjust CSS (line-height, font-size) or truncate with ellipsis

**Issue 2: Screenshots look outdated after UI changes**
- **Solution:** Use CSS overlays/arrows to highlight features instead of relying on exact UI state
- **Fallback:** Use illustrated placeholders until stable UI version

**Issue 3: Users confused by "creation" vs "learning" messaging**
- **Solution:** A/B test hybrid approach ("Create AND Learn")
- **Fallback:** Keep some learning language as secondary message

**Issue 4: Translation quality issues**
- **Solution:** Hire native speakers for review
- **Fallback:** Temporarily revert to simpler translations

**Issue 5: Conversion rate drops**
- **Solution:** Quick rollback to previous version
- **Fallback:** Hybrid messaging (blend old and new)

---

## Success Metrics

### Quantitative Targets

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Landing → Signup Conversion | TBD | +15-20% increase | Analytics funnel |
| Time on Landing Page | TBD | >90 seconds | Google Analytics |
| Scroll Depth (reach FAQ) | TBD | >70% of users | Heatmap tool |
| Primary CTA Click Rate | TBD | >5% | Event tracking |
| Bounce Rate | TBD | <40% | Analytics |

### Qualitative Targets

- [ ] User feedback mentions "creating own topics" within first week
- [ ] Support tickets don't increase with "what is this?" questions
- [ ] Social media/reviews describe product as "training builder" not just "learning app"
- [ ] Demo calls/showcases emphasize creation workflow

---

## Communication Plan

### Stakeholder Updates

**Before Launch:**
- Share `landing-rewrite-draft.md` for approval
- Present screenshot mockups
- Confirm timeline and resource allocation

**During Implementation:**
- Daily standup updates on progress
- Flag any blockers immediately (e.g., screenshot delays)

**After Launch:**
- Week 1: Initial metrics report
- Week 2: A/B test results (if applicable)
- Month 1: Comprehensive review and next steps

### User Communication

**In-App Messages:**
- Optional: Brief tooltip explaining new features on first login
- Don't overwhelm—keep it subtle

**Email Newsletter:**
- Announce positioning update to existing users
- Highlight new capabilities (duplicate detection, improved workflow)
- Invite feedback

**Social Media:**
- Thread explaining "Why we're focusing on creation, not just consumption"
- Behind-the-scenes: How we built the duplicate detection feature
- User spotlight: Someone who created an impressive topic library

---

## Budget Estimate

### Time Investment

| Task | Estimated Hours | Who |
|------|----------------|-----|
| Copy updates (locale files) | 8-12 hours | Developer + Translator |
| Screenshot capture/editing | 6-10 hours | Designer/Developer |
| Component updates | 4-6 hours | Developer |
| Testing & QA | 4-6 hours | QA/Developer |
| **Total** | **22-34 hours** | |

### Financial Costs (if outsourcing)

- **Translation Review:** $100-300 (native speaker review for ru/es)
- **Professional Screenshots:** $200-500 (designer time)
- **AI Image Generation:** $20-50 (Midjourney/DALL-E subscription)
- **A/B Testing Tool:** $0-100/month (if not using built-in analytics)

**Total Estimated Cost:** $320-950 (if fully outsourced)  
**DIY Cost:** $0-50 (just AI tools)

---

## Decision Points Requiring Your Input

### Immediate Decisions (Before Implementation)

1. **Approve Core Messaging:**
   - [ ] Yes, proceed with "creation-focused" positioning
   - [ ] No, keep hybrid "create AND learn" approach
   - [ ] Other: _______________

2. **Screenshot Strategy:**
   - [ ] Real UI screenshots (authentic but may date quickly)
   - [ ] AI-generated illustrations (polished but less authentic)
   - [ ] Hybrid: Real screenshots with illustrated overlays

3. **FAQ Approach:**
   - [ ] Aggressive replacement (remove 4, add 4)
   - [ ] Conservative update (keep most, tweak wording)
   - [ ] Expand to 15+ FAQs for comprehensive coverage

4. **Timeline:**
   - [ ] Fast rollout (1 week, minimal testing)
   - [ ] Standard rollout (2 weeks, full testing)
   - [ ] Phased rollout (section by section over 4 weeks)

### Secondary Decisions (Can Decide Later)

5. **A/B Testing:**
   - [ ] Yes, test multiple hero title variations
   - [ ] No, commit to one version and iterate based on qualitative feedback

6. **Additional Sections:**
   - [ ] Add testimonials section (if we have quotes)
   - [ ] Add use cases section (6 cards)
   - [ ] Add comparison table (vs. Anki/Quizlet)
   - [ ] Skip extras, focus on core sections

7. **Interactive Elements:**
   - [ ] Build embedded demo widget (higher effort)
   - [ ] Add simple hover animations only
   - [ ] Keep static for now, enhance later

---

## Next Steps

**Immediate Actions (Today):**
1. ✅ Review `landing-rewrite-draft.md` (detailed section proposals)
2. ✅ Review `additional-content-ideas.md` (strategic suggestions)
3. ⏳ Review this summary document
4. ⏳ Provide decisions on decision points above
5. ⏳ Approve timeline and resource allocation

**Once Approved:**
1. I'll update locale files with new copy
2. We'll coordinate screenshot capture
3. I'll implement component changes
4. We'll test thoroughly
5. Launch and monitor

---

**Questions?** Let me know which sections need clarification or adjustment before we proceed!

