'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Heart, Sparkles, Star } from '@/components/shared/Icons';
import { isDev } from '@/config';

import { CardWithIcon } from './shared';

export function CardsWithIconsSection() {
  return (
    <section
      className={cn(
        isDev && '__CardsWithIconsSection', // DEBUG
        'py-12',
      )}
    >
      <div className="mb-3 flex max-w-2xl flex-col">
        <h2 className="mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          Why Choose MindStack
        </h2>
        <p className="text-base leading-6 text-muted-foreground lg:text-lg">
          MindStack combines powerful features with an intuitive interface to make memory training
          effective and enjoyable. Build your knowledge base and practice anywhere, anytime.
        </p>
      </div>
      <div className="my-3 grid gap-6 py-6 lg:grid-cols-3">
        <CardWithIcon
          debugId="AIPoweredLearning"
          icon={Sparkles}
          title="AI-Powered Learning"
          description="Leverage advanced AI to enhance your learning experience. Get personalized recommendations and intelligent content generation."
        />
        <CardWithIcon
          debugId="SpacedRepetition"
          icon={Heart}
          title="Spaced Repetition"
          description="Built-in spaced repetition algorithms help you remember information longer by optimizing review intervals based on your performance."
        />
        <CardWithIcon
          debugId="ActiveRecallPractice"
          icon={Star}
          title="Active Recall Practice"
          description="Strengthen your memory through active recall. Practice retrieving information from memory rather than just re-reading, proven to be more effective for long-term retention."
        />
      </div>
    </section>
  );
}
