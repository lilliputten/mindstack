'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { isDev } from '@/config';

export function HeroSection() {
  return (
    <section
      className={cn(
        isDev && '__HeroSection', // DEBUG
        'flex flex-col items-center py-12',
      )}
    >
      <div className="mb-3 flex max-w-2xl flex-col items-center text-center">
        {/* // Announce block
        <Link
          href="#"
          className="mb-3 inline-flex items-center rounded-2xl border border-border/30 bg-muted/50 px-3 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Version 0.0.3 released!
        </Link>
        */}
        <h1 className="text-gradient-brand mb-4 mt-0 text-balance p-4 text-5xl font-semibold leading-tight tracking-tight lg:text-6xl">
          Master Your Memory with MindStack
        </h1>
        <p className="mb-6 text-balance text-base leading-6 text-muted-foreground lg:text-lg">
          Create custom topics, questions, and answers to train your memory effectively. Build your
          knowledge base and practice with interactive workouts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="theme" size="lg" rounded="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg" rounded="lg">
            Learn More
          </Button>
        </div>
      </div>
      <div className="relative mt-3 w-full max-w-none">
        <div className="relative aspect-[2356/1404] w-full overflow-hidden rounded-lg">
          <Image
            src="/static/landing/placeholder-main-ui.png"
            alt="MindStack application interface"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
