'use client';

import React from 'react';

import { ContentFooter } from '@/components/shared';

import { BigImageCTASection } from './BigImageCTASection';
import { CardsWithIconsSection } from './CardsWithIconsSection';
import { FAQSection } from './FAQSection';
import { FeaturesSection } from './FeaturesSection';
import { HeroSection } from './HeroSection';
import { HowItWorksCards } from './HowItWorksCards';
import { PromoCTASection } from './PromoCTASection';
import { RecentCategoriesSection } from './RecentCategoriesSection';
import { RecentTopicsSection } from './RecentTopicsSection';

export function LandingContent() {
  return (
    <>
      <main className="flex w-full max-w-6xl flex-col px-6">
        <HeroSection />
        <FeaturesSection />
        <RecentCategoriesSection />
        <CardsWithIconsSection />
        <BigImageCTASection />
        <RecentTopicsSection />
        <HowItWorksCards />
        {/*
        <DescriptionCodeSection />
        */}
        <FAQSection />
        <PromoCTASection />
      </main>
      <ContentFooter />
    </>
  );
}
