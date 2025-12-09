'use client';

import React from 'react';

import { BigImageCTASection } from './BigImageCTASection';
import { CardsWithIconsSection } from './CardsWithIconsSection';
import { ClientsSection } from './ClientsSection';
import { DescriptionCodeSection } from './DescriptionCodeSection';
import { FAQSection } from './FAQSection';
import { FeaturesSection } from './FeaturesSection';
import { Footer } from './Footer';
import { HeroSection } from './HeroSection';
import { PromoCTASection } from './PromoCTASection';

export function LandingContent() {
  return (
    <>
      <main className="flex w-full max-w-6xl flex-col px-6">
        <HeroSection />
        {/* <ClientsSection /> */}
        <FeaturesSection />
        <CardsWithIconsSection />
        <BigImageCTASection />
        <DescriptionCodeSection />
        <FAQSection />
        <PromoCTASection />
      </main>
      <Footer />
    </>
  );
}
