'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import * as Icons from '@/components/shared/Icons';
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
        isDev && `__FAQAccordionItem_${debugId || value}`, // DEBUG
        'bg-theme/10',
      )}
    >
      <AccordionTrigger
        className={cn(
          isDev && '__FAQAccordionItem_AccordionTrigger', // DEBUG
          'content-truncate px-6 py-6 text-xl font-semibold text-theme-600 dark:text-theme-400 max-sm:text-base',
        )}
        wrapperClassName={cn(
          isDev && '__FAQAccordionItem_AccordionTrigger', // DEBUG
          'flex gap-4 items-center',
        )}
      >
        <Icons.MessageCircleQuestion className="size-8 text-theme opacity-50" />
        <span className="content-truncate flex-1">{question}</span>
      </AccordionTrigger>
      <AccordionContent
        className={cn(
          isDev && '__FAQAccordionItem_AccordionContent', // DEBUG
          'content-truncate px-6 pb-6 text-base',
        )}
      >
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
