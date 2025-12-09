'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { isDev } from '@/config';

export function DescriptionCodeSection() {
  const codeExample = `\`\`\`python
# Example: Creating a topic
# MindStack API usage

POST /api/topics

{
  "title": "JavaScript Fundamentals",
  "language": "en",
  "scope": "my"
}

# Add questions and answers
POST /api/topics/{topicId}/questions
\`\`\``;

  return (
    <section
      className={cn(
        isDev && '__DescriptionCodeSection', // DEBUG
        'py-12',
      )}
    >
      <div className="grid gap-12 md:grid-cols-[0.5fr_1fr]">
        <div className="max-w-2xl">
          <h2 className="mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
            Built for Developers and Learners
          </h2>
          <p className="text-base leading-6 text-muted-foreground lg:text-lg">
            MindStack is built with modern web technologies, making it fast, reliable, and easy to
            use. Whether you're learning programming concepts, languages, or any other subject,
            MindStack adapts to your learning style.
          </p>
        </div>
        <MarkdownText className="overflow-auto">{codeExample}</MarkdownText>
      </div>
    </section>
  );
}
