'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/config';

import { FeatureCard } from './shared';

export function FeaturesSection() {
  const t = useT();
  return (
    <section
      className={cn(
        isDev && '__FeaturesSection', // DEBUG
        'py-8 pb-2',
        'gap-6',
      )}
    >
      <div className="mb-3 max-w-2xl">
        <h2 className="text-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          {t('Landing.FeaturesSection.Title')}
        </h2>
        <p className="text-truncate text-base leading-6 text-muted-foreground lg:text-lg">
          {t('Landing.FeaturesSection.Description')}
        </p>
      </div>

      {/* Single Feature Card */}
      <div className="my-6 grid gap-3">
        <FeatureCard
          debugId="CreateCustomTopics"
          title={t('Landing.FeaturesSection.Card-1-Title')}
          description={t('Landing.FeaturesSection.Card-1-Text')}
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt={t('Landing.FeaturesSection.Card-1-Title')}
          imageAspectRatio="aspect-video"
          // descriptionSize="lg"
          contentMaxWidth="max-w-2xl"
        />
      </div>

      {/* Two Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-2">
        <FeatureCard
          debugId="InteractiveWorkouts"
          title={t('Landing.FeaturesSection.Card-2-Title')}
          description={t('Landing.FeaturesSection.Card-2-Text')}
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt={t('Landing.FeaturesSection.Card-2-Title')}
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="QuestionAnswerSystem"
          title={t('Landing.FeaturesSection.Card-3-Title')}
          description={t('Landing.FeaturesSection.Card-3-Text')}
          imageSrc="/static/landing/placeholder-feature-4-3.png"
          imageAlt={t('Landing.FeaturesSection.Card-3-Title')}
          imageAspectRatio="aspect-[4/3]"
        />
      </div>

      {/* Three Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-3">
        <FeatureCard
          debugId="MultiLanguageSupport"
          title={t('Landing.FeaturesSection.Card-4-Title')}
          description={t('Landing.FeaturesSection.Card-4-Text')}
          imageSrc="/static/landing/placeholder-feature.png"
          imageAlt={t('Landing.FeaturesSection.Card-4-Title')}
          imageAspectRatio="aspect-square"
        />
        <FeatureCard
          debugId="ProgressTracking"
          title={t('Landing.FeaturesSection.Card-5-Title')}
          description={t('Landing.FeaturesSection.Card-5-Text')}
          imageSrc="/static/landing/placeholder-feature-16-9.png"
          imageAlt={t('Landing.FeaturesSection.Card-5-Title')}
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="ShareCollaborate"
          title={t('Landing.FeaturesSection.Card-6-Title')}
          description={t('Landing.FeaturesSection.Card-6-Text')}
          imageSrc="/static/landing/placeholder-feature-4-3.png"
          imageAlt={t('Landing.FeaturesSection.Card-6-Title')}
          imageAspectRatio="aspect-[4/3]"
        />
      </div>
    </section>
  );
}
