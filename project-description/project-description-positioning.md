# MindStack Positioning Draft

## Re-formulated project goal

MindStack gives users a convenient system to create and run repetition trainings for their own topics, tasks, and real-life use cases.  
The product is designed first for personal knowledge workflows and private content management, with optional public sharing when users want it.

## Main user advantages

1. **Personal-first training creation**  
   Users build trainings from their own data instead of adapting to generic public courses.

2. **Fast in-place editing workflow**  
   Questions and answers can be edited directly in context (HeadlessEditor), reducing friction during content preparation.

3. **Generation control before save**  
   Generated questions/answers can be reviewed, fixed, and regenerated before saving to the database.

4. **Duplicate and similarity checks**  
   Users can compare items to detect potential duplicates and near-duplicates; this helps keep topic datasets clean.

5. **Structured data model for scaling**  
   Hierarchy `categories -> topics -> questions -> answers` keeps data organized from idea level to training-ready units.

6. **Flexible privacy and sharing**  
   Users can keep topics private or publish selected topics for others.

7. **Low-friction access and onboarding**  
   Multiple auth options: OAuth providers (Google, Yandex, GitHub) and OTP (email, Telegram).

8. **Progressive product tiers**  
   Guest, Basic, Pro, and Premium levels cover different needs from exploration to advanced usage (see `/pricing`).

9. **Multi-region payments**  
   Payments support both international (Stripe) and Russian (YooMoney) scenarios.

10. **Telegram entry point already available**  
    Telegram bot currently supports authorization; progress tracking and payments are planned.

## Feature constraints and honest product notes

- Text comparison algorithms are in beta and still need improvements.
- Current implementation is based on wasm-enabled stemmer logic in `src/packages/text-comparator/TextComprarator.ts`.
- User settings are currently basic (theme, app language, preferred data language).
- Telegram bot functionality is intentionally limited at this stage.

## Reusable short description (for pages and external reviews)

MindStack is a personal knowledge training platform focused on helping users create repetition trainings from their own topics and datasets.  
It combines fast in-place editing, generation review before save, duplicate checks, and a structured category-topic-question-answer model, so users can build and maintain high-quality private training content with optional public sharing.

## Reusable long description (editorial draft)

MindStack is built for people who want to systematize their own knowledge and train it repeatedly in a practical way.  
Instead of pushing users into fixed public courses, the platform provides tools for creating custom topics, writing and generating question-answer sets, checking quality, and running trainings on top of the same structured data model.

The product workflow is centered around authoring control. Users can edit content in place, compare generated items against existing data to detect likely duplicates, and validate generated material before saving. This reduces noise in datasets and improves long-term maintainability of personal knowledge bases.

MindStack supports both private and public content scenarios: users can keep personal topics private, then selectively share topics when needed. Access starts from a guest mode for public exploration and scales to paid plans for advanced use, with cross-region payment options.

Overall, the core product promise is simple: **a convenient and controllable way to turn your own knowledge into repeatable trainings**.

## Suggested messaging angles by audience

- **For end users:** "Build trainings from your own knowledge, not someone else's curriculum."
- **For reviewers/media:** "Personal-first repetition training platform with generation quality control."
- **For technical audiences:** "Structured content pipeline with compare-before-save and beta similarity detection."
