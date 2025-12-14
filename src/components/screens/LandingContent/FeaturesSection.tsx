'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';

import { FeatureCard } from './shared';

export function FeaturesSection() {
  return (
    <section
      className={cn(
        isDev && '__FeaturesSection', // DEBUG
        'py-12',
        'gap-6',
      )}
    >
      <div className="mb-3 max-w-2xl">
        <h2 className="mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          Powerful Features for Memory Training
        </h2>
        <p className="text-base leading-6 text-muted-foreground lg:text-lg">
          MindStack provides everything you need to create, organize, and practice your learning
          materials. Build your knowledge base with topics, questions, and answers, then train your
          memory with interactive workouts.
        </p>
      </div>

      {/* Single Feature Card */}
      <div className="my-6 grid gap-3">
        <FeatureCard
          debugId="CreateCustomTopics"
          title="Create Custom Topics"
          description="Organize your learning materials into custom topics. Each topic can contain multiple questions and answers, allowing you to structure your knowledge base exactly how you need it. Support for multiple languages helps you learn in your preferred language."
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt="Custom topics creation interface"
          imageAspectRatio="aspect-video"
          // descriptionSize="lg"
          contentMaxWidth="max-w-2xl"
        />
      </div>

      {/* Two Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-2">
        <FeatureCard
          debugId="InteractiveWorkouts"
          title="Interactive Workouts"
          description="Practice your knowledge with interactive workout sessions. Answer questions, track your progress, and improve your memory retention through spaced repetition and active recall techniques."
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt="Interactive workout interface"
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="QuestionAnswerSystem"
          title="Question & Answer System"
          description="Build comprehensive Q&A sets for each topic. Create multiple answer options and mark correct answers to test your understanding effectively."
          imageSrc="/static/landing/placeholder-feature-4-3.png"
          imageAlt="Question and answer management"
          imageAspectRatio="aspect-[4/3]"
        />
      </div>

      {/* Three Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-3">
        <FeatureCard
          debugId="MultiLanguageSupport"
          title="Multi-language Support"
          description="Learn and practice in multiple languages. Switch between languages seamlessly to enhance your multilingual learning experience."
          imageSrc="/static/landing/placeholder-feature.png"
          imageAlt="Multi-language support"
          imageAspectRatio="aspect-square"
        />
        <FeatureCard
          debugId="ProgressTracking"
          title="Progress Tracking"
          description="Monitor your learning progress with detailed statistics. Track your performance across different topics, see your improvement over time, and identify areas that need more practice."
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt="Progress tracking dashboard"
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="ShareCollaborate"
          title="Share & Collaborate"
          description="Share your topics with others or explore topics created by the community. Learn together and build knowledge collaboratively."
          imageSrc="/static/landing/placeholder-feature-4-3.png"
          imageAlt="Sharing and collaboration features"
          imageAspectRatio="aspect-[4/3]"
        />
      </div>
    </section>
  );
}
