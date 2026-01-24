'use client';

import React from 'react';

import { ContentFooter } from '@/components/shared';

import { BigImageCTASection } from './BigImageCTASection';
import { CardsWithIconsSection } from './CardsWithIconsSection';
import { CategoriesSection } from './CategoriesSection';
import { FAQSection } from './FAQSection';
import { FeaturesSection } from './FeaturesSection';
import { HeroSection } from './HeroSection';
import { HowItWorksCards } from './HowItWorksCards';
import { PromoCTASection } from './PromoCTASection';

export function LandingContent() {
  return (
    <>
      <main className="flex w-full max-w-6xl flex-col px-6">
        {/* // DEBUG: Hide temporarily
        <HeroSection />
        <FeaturesSection />
        */}
        <CategoriesSection />
        <CardsWithIconsSection />
        <BigImageCTASection />
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
