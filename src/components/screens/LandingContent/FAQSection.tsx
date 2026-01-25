'use client';

import React from 'react';
import { RichTranslationValues } from 'next-intl';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { Accordion } from '@/components/ui/Accordion';
import { isDev, pricingChooseRoute } from '@/config';

import { FAQAccordionItem } from './shared';

export function FAQSection() {
  const t = useT();

  const richTextTags: RichTranslationValues = {
    p: (chunks) => <p>{chunks}</p>,
    ol: (chunks) => <ol className="items">{chunks}</ol>,
    ul: (chunks) => <ul className="items">{chunks}</ul>,
    li: (chunks) => <li>{chunks}</li>,
    LinkPricing: (chunks) => <Link href={pricingChooseRoute}>{chunks}</Link>,
  };

  return (
    <section
      className={cn(
        isDev && '__FAQSection', // DEBUG
        'py-12',
      )}
    >
      <div className="mb-3 flex max-w-2xl flex-col">
        <h2 className="content-truncate mb-4 mt-0 py-2 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          {t('Landing.FAQSection.Title')}
        </h2>
        <p className="content-truncate ext-base leading-6 lg:text-lg">
          {t('Landing.FAQSection.Description')}
        </p>
      </div>
      <Accordion type="single" collapsible className="mt-8">
        <FAQAccordionItem
          value="WhatIsMindStack"
          question={t('Landing.FAQSection.WhatIsMindStack.Question')}
          answer={t.rich('Landing.FAQSection.WhatIsMindStack.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="HowToCreateFirstTopic"
          question={t('Landing.FAQSection.HowToCreateFirstTopic.Question')}
          answer={t.rich('Landing.FAQSection.HowToCreateFirstTopic.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="LearningProgramming"
          question={t('Landing.FAQSection.LearningProgramming.Question')}
          answer={t.rich('Landing.FAQSection.LearningProgramming.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="MultipleLanguages"
          question={t('Landing.FAQSection.MultipleLanguages.Question')}
          answer={t.rich('Landing.FAQSection.MultipleLanguages.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="WorkoutSystem"
          question={t('Landing.FAQSection.WorkoutSystem.Question')}
          answer={t.rich('Landing.FAQSection.WorkoutSystem.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="ShareTopics"
          question={t('Landing.FAQSection.ShareTopics.Question')}
          answer={t.rich('Landing.FAQSection.ShareTopics.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="TrackProgress"
          question={t('Landing.FAQSection.TrackProgress.Question')}
          answer={t.rich('Landing.FAQSection.TrackProgress.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="WithoutAccount"
          question={t('Landing.FAQSection.WithoutAccount.Question')}
          answer={t.rich('Landing.FAQSection.WithoutAccount.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="LearningTechniques"
          question={t('Landing.FAQSection.LearningTechniques.Question')}
          answer={t.rich('Landing.FAQSection.LearningTechniques.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="MobileApp"
          question={t('Landing.FAQSection.MobileApp.Question')}
          answer={t.rich('Landing.FAQSection.MobileApp.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="FreeToUse"
          question={t('Landing.FAQSection.FreeToUse.Question')}
          answer={t.rich('Landing.FAQSection.FreeToUse.Answer', richTextTags)}
        />
        <FAQAccordionItem
          value="Price"
          question={t('Landing.FAQSection.Price.Question')}
          answer={t.rich('Landing.FAQSection.Price.Answer', richTextTags)}
        />
      </Accordion>
    </section>
  );
}
