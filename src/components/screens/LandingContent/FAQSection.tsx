'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { Accordion } from '@/components/ui/Accordion';
import { isDev } from '@/config';

import { FAQAccordionItem } from './shared';

export function FAQSection() {
  return (
    <section
      className={cn(
        isDev && '__FAQSection', // DEBUG
        'py-12',
      )}
    >
      <div className="mb-3 flex max-w-2xl flex-col">
        <h2 className="mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="text-base leading-6 text-muted-foreground lg:text-lg">
          Everything you need to know about MindStack and how to get started with memory training.
        </p>
      </div>
      <Accordion type="single" collapsible className="mt-3">
        <FAQAccordionItem
          value="WhatIsMindStack"
          question="What is MindStack?"
          answer={
            <p>
              MindStack is a memory training application that helps you create, organize, and
              practice learning materials. You can create custom topics with questions and answers,
              then use interactive workouts to train your memory through spaced repetition and
              active recall techniques.
            </p>
          }
        />
        <FAQAccordionItem
          value="HowToCreateFirstTopic"
          question="How do I create my first topic?"
          answer={
            <>
              <p>Creating a topic in MindStack is simple:</p>
              <ol className="mt-2 list-decimal space-y-2 pl-6">
                <li>Sign up for a free account</li>
                <li>Navigate to "My Topics" in the dashboard</li>
                <li>Click "Create Topic" and fill in the title and language</li>
                <li>Add questions and answers to your topic</li>
                <li>Start practicing with workouts!</li>
              </ol>
            </>
          }
        />
        <FAQAccordionItem
          value="LearningProgramming"
          question="Can I use MindStack for learning programming?"
          answer={
            <p>
              Absolutely! MindStack is perfect for learning programming concepts, syntax,
              algorithms, and more. Create topics for different programming languages, frameworks,
              or concepts. The spaced repetition system helps you remember code patterns and
              technical details effectively.
            </p>
          }
        />
        <FAQAccordionItem
          value="MultipleLanguages"
          question="Does MindStack support multiple languages?"
          answer={
            <p>
              Yes! MindStack supports multiple languages. You can create topics in different
              languages and switch between them seamlessly. This is especially useful for language
              learning or when studying materials in different languages.
            </p>
          }
        />
        <FAQAccordionItem
          value="WorkoutSystem"
          question="How does the workout system work?"
          answer={
            <p>
              Workouts present questions from your topics in a randomized order. You answer each
              question, and the system tracks your performance. Based on your answers, MindStack
              uses spaced repetition algorithms to schedule reviews at optimal intervals, helping
              you remember information for longer periods.
            </p>
          }
        />
        <FAQAccordionItem
          value="ShareTopics"
          question="Can I share my topics with others?"
          answer={
            <p>
              Yes! You can share your topics with the community or keep them private. Explore topics
              created by other users to discover new learning materials. This collaborative approach
              helps everyone learn together.
            </p>
          }
        />
        <FAQAccordionItem
          value="FreeToUse"
          question="Is MindStack free to use?"
          answer={
            <p>
              MindStack offers a free tier that includes core features for creating topics,
              questions, and workouts. Additional features and higher limits may be available in
              premium plans. Check our pricing page for more details.
            </p>
          }
        />
        <FAQAccordionItem
          value="TrackProgress"
          question="How do I track my progress?"
          answer={
            <p>
              MindStack provides detailed statistics and progress tracking. You can see your
              performance across different topics, track improvement over time, and identify areas
              that need more practice. The dashboard shows your workout history and success rates.
            </p>
          }
        />
      </Accordion>
    </section>
  );
}
