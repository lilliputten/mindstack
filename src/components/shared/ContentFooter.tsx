'use client';

import React from 'react';
import PublicLink from 'next/link';

import {
  cookiesRoute,
  docsRoute,
  pricingRoute,
  privacyRoute,
  termsRoute,
} from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { ExternalLink, Github } from '@/components/shared/Icons';
import { isDev } from '@/config';
import { Link as LocalLink } from '@/i18n/routing';

export function ContentFooter() {
  return (
    <footer
      className={cn(
        isDev && '__Footer', // DEBUG
        'mt-auto w-full px-6 pb-6 pt-12',
        'border-t border-theme-700/50',
        // 'bg-theme-700/70',
        'bg-header-gradient',
        'text-white',
        'relative',
      )}
    >
      <div
        className={cn(
          isDev && '__PromoCTASection_Decor', // DEBUG
          'absolute inset-0 overflow-hidden',
          'bg-header-gradient',
          'after-header-decor',
          'z-0',
        )}
      />
      <div className="z-1 relative mx-auto mb-6 grid max-w-6xl gap-4 px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-sm leading-5">
            © 2025 MindStack
            <br />
            NextJS Memory Training Application
            <br />
            Built with{' '}
            <PublicLink href="https://nextjs.org" target="_blank" className="underline">
              Next.js
            </PublicLink>{' '}
            and{' '}
            <PublicLink href="https://vercel.com" target="_blank" className="underline">
              Vercel
            </PublicLink>
          </p>
        </div>
        <div>
          <div className="flex flex-col gap-4 pt-3">
            <LocalLink href={docsRoute} className="text-sm underline-offset-4 hover:underline">
              Documentation
            </LocalLink>
            {/*
            <PublicLink
              href="https://github.com/lilliputten/mindstack"
              target="_blank"
              className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              GitHub <ExternalLink className="size-3" />
            </PublicLink>
            <LocalLink href={blogLink} className="text-sm underline-offset-4 hover:underline">
              Blog
            </LocalLink>
            <LocalLink href={supportLink} className="text-sm underline-offset-4 hover:underline">
              Support
            </LocalLink>
            */}
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-4 pt-3">
            <PublicLink
              href="https://github.com/lilliputten/mindstack"
              target="_blank"
              className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              <Github className="size-4" />
              GitHub <ExternalLink className="size-3" />
            </PublicLink>
            {/*
            <PublicLink
              href="https://x.com"
              target="_blank"
              className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              <Twitter className="size-4" />
              X.com
            </PublicLink>
            */}
          </div>
        </div>
      </div>
      <div className="z-1 relative mx-auto flex max-w-6xl flex-wrap gap-6 gap-y-2 px-6 max-sm:flex-col">
        <LocalLink href={privacyRoute} className="text-sm underline-offset-4 hover:underline">
          Privacy Policy
        </LocalLink>
        <LocalLink href={termsRoute} className="text-sm underline-offset-4 hover:underline">
          Terms of Service
        </LocalLink>
        <LocalLink href={cookiesRoute} className="text-sm underline-offset-4 hover:underline">
          Cookie Policy
        </LocalLink>
        <LocalLink href={pricingRoute} className="text-sm underline-offset-4 hover:underline">
          Pricing
        </LocalLink>
      </div>
    </footer>
  );
}
