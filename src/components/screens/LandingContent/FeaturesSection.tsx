'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { isDev } from '@/config';
import { useT } from '@/i18n';

import { FeatureCard } from './shared';

export function FeaturesSection() {
  const t = useT();
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
          {t('FeaturesSection.Title')}
        </h2>
        <p className="text-base leading-6 text-muted-foreground lg:text-lg">
          {t('FeaturesSection.Description')}
        </p>
      </div>

      {/* Single Feature Card */}
      <div className="my-6 grid gap-3">
        <FeatureCard
          debugId="CreateCustomTopics"
          title={t('FeaturesSection.CreateCustomTopics')}
          description={t('FeaturesSection.CreateCustomTopicsDescription')}
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
          title={t('FeaturesSection.InteractiveWorkouts')}
          description={t('FeaturesSection.InteractiveWorkoutsDescription')}
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt="Interactive workout interface"
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="QuestionAnswerSystem"
          title={t('FeaturesSection.QuestionAndAnswerSystem')}
          description={t('FeaturesSection.QuestionAndAnswerSystemDescription')}
          imageSrc="/static/landing/placeholder-feature-4-3.png"
          imageAlt="Question and answer management"
          imageAspectRatio="aspect-[4/3]"
        />
      </div>

      {/* Three Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-3">
        <FeatureCard
          debugId="MultiLanguageSupport"
          title={t('FeaturesSection.MultiLanguageSupport')}
          description={t('FeaturesSection.MultiLanguageSupportDescription')}
          imageSrc="/static/landing/placeholder-feature.png"
          imageAlt="Multi-language support"
          imageAspectRatio="aspect-square"
        />
        <FeatureCard
          debugId="ProgressTracking"
          title={t('FeaturesSection.ProgressTracking')}
          description={t('FeaturesSection.ProgressTrackingDescription')}
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt="Progress tracking dashboard"
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="ShareCollaborate"
          title={t('FeaturesSection.ShareAndCollaborate')}
          description={t('FeaturesSection.ShareAndCollaborateDescription')}
          imageSrc="/static/landing/placeholder-feature-4-3.png"
          imageAlt="Sharing and collaboration features"
          imageAspectRatio="aspect-[4/3]"
        />
      </div>
    </section>
  );
}
