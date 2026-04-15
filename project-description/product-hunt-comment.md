# MindStack - ProductHunt Launch Comment

## 🎯 Tagline
**Turn your knowledge into repeatable trainings with AI-assisted creation and spaced repetition.**

## 📝 Description

MindStack is a **personal-first knowledge training platform** that helps you build custom repetition training systems from YOUR own topics, work materials, study subjects, or technical references—not generic pre-made courses.

Unlike traditional flashcard apps that focus on card management, MindStack emphasizes the **entire content creation workflow**: generate questions with AI, review and edit before saving, detect duplicates, and practice with spaced repetition—all in one streamlined interface.

### ✨ What Makes It Different

**🔧 Personal-First Approach**
Create trainings from your real-world data instead of adapting to someone else's curriculum. Build datasets around your work projects, university studies, language learning, or any topic that matters to you.

**✅ Generation Control & Quality Assurance**
AI-generated content stays in draft mode until YOU approve it. Edit, regenerate, or discard drafts—full control over what enters your training dataset. Think of AI as a drafting assistant, not an autopilot.

**🔍 Duplicate Detection (Beta)**
Built-in similarity algorithms compare new items against existing ones to catch duplicates and near-duplicates, keeping your datasets clean as they grow. Uses stemming-based text comparison for better matching.

**✏️ In-Place Editing with HeadlessEditor**
Modify questions and answers directly in the training interface using our rich text editor. No context switching between "view mode" and "edit mode"—just seamless editing where you need it.

**🔒 Privacy by Default**
Topics are private unless you choose to share them. Keep personal knowledge bases secure while optionally contributing public topics to the community.

**📊 Structured Hierarchy**
Categories → Topics → Questions → Answers. A clear organizational structure that scales from 10 to 1000+ items without becoming unmanageable.

### 🚀 Key Features

**Content Creation:**
- Create topics from your own knowledge areas
- Manual question/answer writing OR AI-assisted generation
- Multi-language support (English, Spanish, Russian)
- Real-time duplicate detection during content creation
- Rich text editing with Markdown support

**Training & Practice:**
- Interactive workout sessions using spaced repetition algorithms
- Progress tracking with detailed statistics per topic
- Performance history and retention metrics
- Start training immediately after creating first question

**AI-Powered Assistance:**
- Generate questions and answers instantly using LangChain
- Cloudflare Workers AI with flexible model switching (Meta Llama, Mistral, etc.)
- GigaChat integration optimized for Russian language content
- Generation quota tracking based on subscription tier

**Authentication & Access:**
- Multiple OAuth providers: Google, GitHub, Yandex
- Email OTP authentication
- Telegram bot OTP authentication
- Role-based access: Guest, Basic (free), Pro, Premium

**Payment Options:**
- International payments via Stripe (credit cards, subscriptions)
- Russian market payments via YooMoney
- Multiple subscription tiers with different AI generation quotas

### 💡 Who Is This For?

- **Students** building study guides from lecture notes and textbooks
- **Professionals** creating training materials from work documentation
- **Language learners** practicing vocabulary and grammar from real content
- **Developers** memorizing APIs, frameworks, and coding concepts
- **Anyone** who wants to systematize their knowledge with active recall

### 🌐 Links

- **Live App:** [https://mindstack.lilliputten.com/](https://mindstack.lilliputten.com/)
- **GitHub:** [https://github.com/lilliputten/mindstack/](https://github.com/lilliputten/mindstack/)
- **Pricing:** [https://mindstack.lilliputten.com/pricing](https://mindstack.lilliputten.com/pricing)
- **Project Reference:** [https://lilliputten.com/projects/2026/mindstack/](https://lilliputten.com/projects/2026/mindstack/)

### 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **AI:** LangChain, Cloudflare Workers AI, GigaChat
- **Auth:** Auth.js (NextAuth) with OAuth + OTP
- **Payments:** Stripe + YooMoney
- **UI:** Tailwind CSS, Radix UI, HeadlessEditor (Tiptap-based)
- **State:** TanStack Query, Zustand
- **i18n:** next-intl (EN, ES, RU)

### 📈 Current Status

**Version:** 0.1.5 (Released April 2026)

**Implemented:**
✅ Core content creation workflow (categories → topics → questions → answers)  
✅ AI-assisted generation with review loop  
✅ Beta duplicate detection with text comparison  
✅ In-place editing with HeadlessEditor  
✅ Spaced repetition training sessions  
✅ Progress tracking and statistics  
✅ Multi-language support (3 languages)  
✅ Multiple authentication methods  
✅ Payment integration (Stripe + YooMoney)  
✅ Privacy controls (private/public topics)  
✅ Telegram bot (authentication only)  

**In Development:**
🔮 Enhanced semantic similarity detection (vector database integration)  
🔮 Smart topic suggestions based on user interests  
🔮 Content expansion from URLs or uploaded documents  
🔮 Telegram bot progress tracking and reminders  
🔮 Additional LLM providers (OpenAI, Anthropic)  

### 💬 Honest Notes

- Text comparison algorithms are in beta and still improving
- Currently uses wasm-enabled stemmer logic for similarity detection
- Telegram bot functionality is intentionally limited at this stage (auth only)
- User settings are currently basic (theme, app language, preferred data language)

### 🎁 Launch Offer

**Free tier includes:**
- Core features for creating topics, questions, and workouts
- Limited AI generation quota
- Public topic exploration
- Basic progress tracking

**Premium plans unlock:**
- Unlimited topics and questions
- Advanced analytics
- Higher AI generation limits
- Priority support

---

**Ready to turn your knowledge into a trainable system?** Start creating your first topic now—it's free! 🚀
