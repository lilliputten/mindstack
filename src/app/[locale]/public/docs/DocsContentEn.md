# MindStack Documentation

Welcome to **{siteTitle}** — a platform for creating personal repetition training systems from your own knowledge and datasets.

## What is MindStack?

MindStack helps you **turn your own knowledge into repeatable trainings**. Instead of using generic public courses, you build personal training systems from your real work materials, study subjects, technical references, or any topics that matter to you.

The platform provides tools for:
- Creating structured question-answer datasets from your topics
- Validating content quality with AI assistance and duplicate detection
- Running effective spaced repetition training sessions
- Tracking your progress and refining your datasets over time

**Core principle:** You control the entire workflow—from initial idea to active training session. AI assists but never replaces your judgment.

---

## Getting Started

### 1. Choose Your Access Level

**Guest (No Account Required)**
- Browse public topics created by other users
- Try sample workouts to understand the training experience
- Limited functionality—progress is not saved

**Registered User (Free Account)**
- Create unlimited private topics
- Generate questions and answers with AI (limited quota)
- Run training sessions and track your progress
- Share selected topics publicly (optional)
- Access via OAuth (Google, GitHub, Yandex) or OTP (Email, Telegram)

**Premium Plans (Paid)**
- Higher AI generation quotas
- Advanced analytics and insights
- Priority support
- See [Pricing Page](/pricing) for details

### 2. Create Your First Topic

1. **Sign up** for a free account (takes seconds via OAuth or OTP)
2. Navigate to **"My Topics"** in your dashboard
3. Click **"Create Topic"**
4. Fill in:
   - **Title:** What subject are you training on?
   - **Category:** Choose from existing categories or request a new one
   - **Language:** Select the primary language for this topic
   - **Privacy:** Private (default) or Public
5. Click **"Create"** — your topic is ready!

### 3. Add Questions and Answers

You have two options:

**Option A: Write Manually**
- Click **"Add Question"** in your topic
- Type your question and answer directly
- Use the rich HeadlessEditor for formatting (bold, lists, code blocks, etc.)
- Save when ready

**Option B: Generate with AI**
- Click **"Generate with AI"** button
- Provide a brief description of what you want to cover
- AI generates draft questions and answers
- **Review each item carefully:**
  - Edit any text that needs improvement
  - Regenerate specific items if unsatisfied
  - Delete irrelevant questions
- **Approve and save** only when you're satisfied with quality

> **Important:** Generated content stays in "draft" mode until you explicitly approve it. Nothing is saved to your database without your confirmation.

### 4. Start Training

Once you have at least one question-answer pair:
- Click **"Start Workout"** on your topic page
- Answer questions as they appear
- The system tracks your performance
- Spaced repetition algorithms schedule optimal review times
- Return later for follow-up sessions based on your results

---

## How MindStack Works

### Data Hierarchy

MindStack organizes your knowledge in a clear structure:

```python
Categories (broad subjects)
  └─ Topics (specific areas within categories)
      └─ Questions (individual queries)
          └─ Answers (one or more per question)
```

**Example:**
```python
Programming Languages
  └─ Python Basics
      ├─ What is a list comprehension?
      │   └─ A concise way to create lists in Python...
      └─ How do you handle exceptions?
          └─ Using try-except blocks...
```

This hierarchy keeps your knowledge base manageable whether you have 10 or 1000 items.

### The Creation Workflow

**Step 1: Define Your Topic**
- Choose a category or request a new one
- Set privacy preferences (private by default)
- Define the scope of what you want to learn/train

**Step 2: Generate, Review, Refine**
- Add questions manually or use AI generation
- Compare new items against existing ones (duplicate detection)
- Edit in place using HeadlessEditor
- Regenerate unsatisfactory items
- Iterate until quality meets your standards

**Step 3: Practice and Iterate**
- Run repetition sessions on your validated data
- Track performance statistics
- Identify weak areas that need more attention
- Continuously refine your topic as you learn
- Add new questions as gaps emerge

---

## Key Features Explained

### In-Place Editing (HeadlessEditor)

Edit questions and answers directly where you see them—no separate editing mode needed.

**Capabilities:**
- Rich text formatting (bold, italic, lists)
- Code blocks with syntax highlighting
- Links and images
- Markdown support (GitHub Flavored Markdown)

**Benefit:** Reduces context switching and speeds up content refinement.

### Duplicate Detection (Beta)

When you generate or add new questions, MindStack compares them against existing items in your topic.

**How it works:**
- Uses n-gram similarity algorithms with multilingual stemming
- Flags items with similarity score ≥ 25%
- Shows you potential duplicates before saving
- You decide: merge, rephrase, or keep both

**Current limitations:**
- Detects lexical similarity (same/similar words), not semantic meaning
- May miss paraphrased duplicates (same meaning, different words)
- Works best with clear, distinct phrasing
- Algorithm is in beta and actively improving

**Future improvements:** Semantic similarity via embeddings and vector databases (planned).

### Generation Review Loop

AI-generated content never saves automatically. You maintain full control:

1. AI generates draft questions and answers
2. You review each item in the generation dialog
3. Options for each item:
   - ✅ **Accept** — Approve and add to topic
   - ✏️ **Edit** — Modify text before accepting
   - 🔄 **Regenerate** — Ask AI to try again
   - ❌ **Delete** — Discard the item
4. Only approved items save to your database

**Benefit:** Ensures quality control and prevents low-quality AI output from polluting your dataset.

### Privacy Control

Topics are **private by default**. Only you can see and train on them.

**Sharing options:**
- Keep topics private for personal use (recommended for sensitive work materials)
- Make topics public to contribute to the community
- Change privacy settings anytime
- Public topics appear in category listings for others to discover

**Use cases for private topics:**
- Work-related training materials
- Proprietary technical knowledge
- Personal study notes
- Sensitive subject matter

**Use cases for public topics:**
- General knowledge sharing
- Language learning resources
- Open-source documentation practice
- Community contribution

---

## User Roles & Permissions

### Guest (Unauthenticated)

**Can:**
- Browse public topics and categories
- Try sample workouts (limited)
- View basic topic information

**Cannot:**
- Create or edit topics
- Save progress or history
- Access AI generation
- Track detailed analytics

### Basic (Free, Registered)

**Can:**
- Everything Guest can do, plus:
- Create unlimited private topics
- Generate questions/answers (limited daily quota)
- Run full training sessions
- Track progress and view statistics
- Share topics publicly (optional)
- Request new categories

**Limits:**
- AI generation quota resets daily
- Basic analytics only

### Pro (Paid)

**Includes everything Basic, plus:**
- Higher AI generation quotas
- Advanced analytics dashboard
- Priority email support
- Early access to new features

### Premium (Paid, Highest Tier)

**Includes everything Pro, plus:**
- Unlimited AI generations
- All advanced features
- Custom branding options (future)
- API access (future)
- Dedicated support

See [Pricing Page](/pricing) for current pricing and feature comparison.

---

## Authentication Options

MindStack offers multiple ways to sign in:

### OAuth Providers

**Google**
- Most common option
- One-click authentication
- Global availability

**GitHub**
- Popular with developers
- Links to your coding profile
- Great for technical topics

**Yandex**
- Russian market focus
- Local authentication provider
- Convenient for CIS region users

### OTP (One-Time Password)

**Email OTP**
- Universal fallback method
- No social account required
- Verification code sent to your email

**Telegram OTP**
- Authenticate via Telegram bot
- Receive codes through Telegram chat
- Growing channel for user engagement

**Note:** You can link multiple authentication methods to the same account for flexibility.

---

## Payment Systems

MindStack supports payments in multiple regions:

### International Payments (Stripe)

**Accepted methods:**
- Credit/debit cards (Visa, Mastercard, Amex)
- Apple Pay, Google Pay
- Bank transfers (in supported countries)

**Features:**
- Automatic subscription renewals
- Customer portal for management
- Prorated upgrades/downgrades
- Receipt emails

### Russian Payments (YooMoney)

**Accepted methods:**
- Russian bank cards (Mir, Visa, Mastercard)
- Sberbank Online
- Tinkoff
- YooMoney wallet
- Other local payment methods

**Compliance:**
- Meets Russian regulatory requirements
- Ruble-denominated transactions
- Local customer support

### Subscription Management

- Monthly or annual billing cycles (annual typically discounted)
- Cancel anytime (no long-term contracts)
- Downgrade to free tier if needed
- Reactivate paused subscriptions easily

---

## Frequently Asked Questions

### What makes MindStack different from Anki or Quizlet?

While those tools focus on flashcard management, MindStack emphasizes the **entire content creation workflow**. You get:
- AI-assisted generation with review loops
- Duplicate detection to maintain dataset quality
- In-place editing without context switching
- Structured hierarchy (categories → topics → questions → answers)
- Privacy-first design with optional sharing

It's designed for **building quality datasets**, not just storing cards.

### Do I need to write all questions manually?

No. You can:
- Write them manually
- Use AI to generate drafts
- Combine both approaches

The key difference is that **generated content stays in review mode**—you check, edit, and approve everything before it becomes part of your training dataset.

### What if I'm not satisfied with AI-generated content?

You have full control:
- Edit any generated item using HeadlessEditor
- Regenerate specific questions until quality improves
- Delete items entirely
- Mix AI-generated and manual questions in the same topic

Think of AI as a **drafting assistant**, not an autopilot.

### How does duplicate detection work?

Our beta similarity algorithm:
- Compares new questions/answers against existing ones in your topic
- Uses text analysis including word stemming (for better matching across word forms)
- Flags potential duplicates with a similarity score (0-100%)
- Lets you decide whether to merge, rephrase, or keep both

**Note:** This feature is still improving and works best with clear, distinct phrasing. It detects lexical similarity (similar words), not semantic meaning (same idea, different words).

### Can I keep my topics completely private?

Yes. Topics are **private by default**. Only you can see and train on them. You must explicitly choose to make a topic public. This is ideal for:
- Work-related training materials
- Proprietary technical knowledge
- Personal study notes
- Any sensitive content

### How do I request a new category?

Registered users can submit category creation requests:
1. Go to the Categories page
2. Look for **"Suggest Your Category"** or similar button
3. Fill out the embedded form with:
   - Proposed category name
   - Description
   - Why it's useful
4. Our team reviews submissions and adds relevant categories

This keeps the system organized while allowing community input.

### Is there a Telegram bot?

Yes, but it's currently limited to **authentication only**:
- Link your Telegram account to MindStack
- Receive OTP codes for login
- Future updates planned: progress tracking, payment support, daily reminders

### Can I use MindStack without registering?

Guests can explore public topics and try sample workouts, but **progress isn't saved**. To create your own topics, save data, and track history, you'll need a free account. Registration takes seconds via OAuth or OTP.

### Does MindStack support multiple languages?

Yes! You can:
- Create topics in different languages
- Switch interface language (English, Spanish, Russian)
- Train on multilingual content
- Use AI generation in supported languages

This is especially useful for language learning or studying materials in different languages.

### How do I track my progress?

MindStack provides detailed statistics:
- Performance per topic (success rate, average response time)
- Historical trends over time
- Weak area identification
- Workout history with timestamps
- Retention metrics showing how well you remember content

Premium users get enhanced analytics with visualizations and recommendations.

---

## Technical Information

### Browser Compatibility

MindStack works best with modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### System Requirements

- **Internet Connection:** Required for account sync, AI generation, and updates
- **JavaScript:** Must be enabled
- **Cookies:** Required for authentication and preferences
- **Local Storage:** Used for offline progress tracking (PWA feature)

### Performance Features

- Server-side rendering for fast initial loads
- Progressive loading of content
- Optimized images and assets
- Efficient caching strategies via React Query
- PWA capabilities for offline training sessions

---

## Privacy and Security

### Data Protection

Your privacy is important:
- Personal data is encrypted and securely stored
- Progress data is associated with your account
- Topics are private by default—you control sharing
- No personal information is sold to third parties
- Regular security audits and updates

### What We Store

- Your questions and answers (encrypted at rest)
- Training session history and performance data
- Account information (email, authentication tokens)
- AI generation usage logs (for quota tracking)

### What We Don't Store

- Payment card details (handled by Stripe/YooMoney)
- Plain-text passwords (hashed and salted)
- Third-party tracking cookies (minimal analytics only)

For detailed information, see our [Privacy Policy]({privacyAliasRoute}) and [Cookie Policy]({cookiesAliasRoute}).

---

## Troubleshooting

### Common Issues

**Login Problems**
- Verify your email and password
- Check for caps lock or typing errors
- Try resetting your password
- Ensure OAuth provider permissions are granted

**AI Generation Not Working**
- Check your daily generation quota (Basic users have limits)
- Verify internet connection
- Try regenerating if output seems low quality
- Contact support if quota appears incorrect

**Progress Not Saving**
- Ensure you're logged in to your account
- Check your internet connection
- Verify cookies are enabled
- Clear browser cache if issues persist
- Contact support if problem continues

**Performance Issues**
- Clear your browser cache
- Disable browser extensions temporarily
- Check your internet connection speed
- Try using a different browser
- Ensure JavaScript is enabled

### Getting Help

If you encounter issues or have questions:

1. **Check this documentation** for common solutions
2. **Contact Support:** [{contactEmail}](mailto:{contactEmail})
3. **Visit our website:** [{publicAddr}]({publicAddr})
4. **Report bugs:** [GitHub Issues](https://github.com/lilliputten/mindstack/issues)

---

## Legal Information

By using MindStack, you agree to our:

- [Terms of Service]({termsAliasRoute}) — Usage rules and conditions
- [Privacy Policy]({privacyAliasRoute}) — How we handle your data
- [Cookie Policy]({cookiesAliasRoute}) — Information about cookies and tracking

---

## Updates and Changelog

MindStack is regularly updated with:
- New features and improvements
- Performance optimizations
- Security enhancements
- Bug fixes and stability improvements

Check the application for update notifications or visit our [CHANGELOG.md](https://github.com/lilliputten/mindstack/blob/main/CHANGELOG.md) for detailed version history.

---

**Version:** {versionInfo}

For the most current information and updates, visit our website or contact our support team at [{contactEmail}](mailto:{contactEmail}).
