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
        <h2 className="content-truncate mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          <div className="content-truncate text-gr2 py-2">{t('Landing.FeaturesSection.Title')}</div>
        </h2>
        <p className="content-truncate text-base leading-6 text-muted-foreground lg:text-lg">
          {t('Landing.FeaturesSection.Description')}
        </p>
      </div>

      {/* Single Feature Card */}
      <div className="my-6 grid gap-3">
        <FeatureCard
          debugId="EditWithoutContextSwitching"
          title={t('Landing.FeaturesSection.Card-4-Title')}
          description={t('Landing.FeaturesSection.Card-4-Text')}
          imageSrc="/static/landing/features/v.0.1.4/edit-topic-questions-and-answers.png"
          imageAlt={t('Landing.FeaturesSection.Card-4-Title')}
          imageAspectRatio="aspect-video"
        />
      </div>

      {/* Two Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-2">
        <FeatureCard
          debugId="GenerateCheckPerfect"
          title={t('Landing.FeaturesSection.Card-2-Title')}
          description={t('Landing.FeaturesSection.Card-2-Text')}
          imageSrc="/static/landing/features/v.0.1.4/generate-questions-dialog-sm.png"
          imageAlt={t('Landing.FeaturesSection.Card-2-Title')}
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="KeepDataClean"
          title={t('Landing.FeaturesSection.Card-3-Title')}
          description={t('Landing.FeaturesSection.Card-3-Text')}
          imageSrc="/static/landing/features/v.0.1.4/questions-comparison-sm.png"
          imageAlt={t('Landing.FeaturesSection.Card-3-Title')}
          imageAspectRatio="aspect-video"
        />
      </div>

      {/* Three Column Feature Cards */}
      <div className="my-6 grid gap-6 md:grid-cols-3">
        <FeatureCard
          debugId="BuildFromYourOwnKnowledge"
          title={t('Landing.FeaturesSection.Card-1-Title')}
          description={t('Landing.FeaturesSection.Card-1-Text')}
          imageSrc="/static/landing/features/v.0.1.3/categories-sm.png"
          imageAlt={t('Landing.FeaturesSection.Card-1-Title')}
          imageAspectRatio="aspect-video"
          contentMaxWidth="max-w-2xl"
        />
        <FeatureCard
          debugId="ControlYourPrivacy"
          title={t('Landing.FeaturesSection.Card-5-Title')}
          description={t('Landing.FeaturesSection.Card-5-Text')}
          imageSrc="/static/landing/features/v.0.1.4/topics-list.png"
          imageAlt={t('Landing.FeaturesSection.Card-5-Title')}
          imageAspectRatio="aspect-video"
        />
        <FeatureCard
          debugId="OrganizedHierarchy"
          title={t('Landing.FeaturesSection.Card-6-Title')}
          description={t('Landing.FeaturesSection.Card-6-Text')}
          imageSrc="/static/landing/features/v.0.1.4/topic-categories-sm.png"
          imageAlt={t('Landing.FeaturesSection.Card-6-Title')}
          imageAspectRatio="aspect-video"
        />
      </div>
    </section>
  );
}
