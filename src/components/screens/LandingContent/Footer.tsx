'use client';

import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { ExternalLink, Github, Twitter } from '@/components/shared/Icons';
import { isDev } from '@/config';

export function Footer() {
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
            <Link href="https://nextjs.org" target="_blank" className="underline">
              Next.js
            </Link>{' '}
            and{' '}
            <Link href="https://vercel.com" target="_blank" className="underline">
              Vercel
            </Link>
          </p>
        </div>
        <div>
          <div className="flex flex-col gap-4 pt-3">
            <Link href="#" className="text-sm underline-offset-4 hover:underline">
              Documentation
            </Link>
            <Link href="#" className="text-sm underline-offset-4 hover:underline">
              API Reference
            </Link>
            <Link
              href="https://github.com/lilliputten/mindstack"
              target="_blank"
              className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              GitHub <ExternalLink className="size-3" />
            </Link>
            <Link href="#" className="text-sm underline-offset-4 hover:underline">
              Blog
            </Link>
            <Link href="#" className="text-sm underline-offset-4 hover:underline">
              Support
            </Link>
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-4 pt-3">
            <Link
              href="https://github.com/lilliputten/mindstack"
              target="_blank"
              className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              <Github className="size-4" />
              GitHub
            </Link>
            {/*
            <Link
              href="https://x.com"
              target="_blank"
              className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              <Twitter className="size-4" />
              X.com
            </Link>
            */}
          </div>
        </div>
      </div>
      <div className="z-1 relative mx-auto flex max-w-6xl flex-wrap gap-6 px-6">
        <Link href="#" className="text-sm underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        <Link href="#" className="text-sm underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        <Link href="#" className="text-sm underline-offset-4 hover:underline">
          Cookie Policy
        </Link>
      </div>
    </footer>
  );
}
