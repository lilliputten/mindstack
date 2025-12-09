'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { isDev } from '@/config';

interface FAQAccordionItemProps {
  debugId?: string;
  value: string;
  question: string;
  answer: React.ReactNode;
}

export function FAQAccordionItem({ debugId, value, question, answer }: FAQAccordionItemProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        isDev && debugId && `__FAQAccordionItem_${debugId || value}`, // DEBUG
        // 'border-b border-border/20',
        'bg-theme/20',
        // 'border-0',
        // 'mb-[1px]',
      )}
    >
      <AccordionTrigger className="px-6 py-6 text-base font-semibold">{question}</AccordionTrigger>
      <AccordionContent className="px-6 pb-6 text-base">{answer}</AccordionContent>
    </AccordionItem>
  );
}
