'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { isDev } from '@/config';

export function BigImageCTASection() {
  return (
    <section
      className={cn(
        isDev && '__BigImageCTASection', // DEBUG
        'py-12',
      )}
    >
      <div className="mb-3 max-w-2xl">
        <h2 className="mb-4 mt-0 text-3xl font-semibold leading-tight tracking-tight text-theme lg:text-4xl">
          Start Your Memory Training Journey Today
        </h2>
        <p className="mb-6 text-base leading-6 text-muted-foreground lg:text-lg">
          Join thousands of learners who are already improving their memory and knowledge retention
          with MindStack. Create your first topic and begin training in minutes.
        </p>
        <div className="mb-6 flex flex-wrap gap-3">
          <Button variant="theme" size="lg" rounded="lg">
            Try It Free
          </Button>
        </div>
      </div>
      <div className="relative mt-4 w-full max-w-none">
        <div className="relative aspect-[2356/1404] w-full overflow-hidden rounded-lg">
          <Image
            src="/static/landing/placeholder-main-ui.png"
            alt="MindStack dashboard overview"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
