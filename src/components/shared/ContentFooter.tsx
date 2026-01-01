'use client';

import React from 'react';
import PublicLink from 'next/link';

import {
  legalCookiesRoute,
  legalPrivacyRoute,
  legalTermsRoute,
  publicContactsRoute,
  publicDocsRoute,
  publicPricingRoute,
} from '@/config/routesConfig';
import { cn } from '@/lib/utils';
import { ExternalLink, Github } from '@/components/shared/Icons';
import { authorSite, currentYear, isDev, siteTitle } from '@/config';
import { useT } from '@/i18n';
import { Link as LocalLink } from '@/i18n/routing';

export function ContentFooter() {
  const t = useT();

  return (
    <footer
      className={cn(
        isDev && '__Footer', // DEBUG
        'mt-auto w-full pb-6 pt-12',
        'border-t border-theme-700/50',
        'bg-header-gradient',
        'text-white',
        'relative',
      )}
    >
      <div
        className={cn(
          isDev && '__Footer_Decor', // DEBUG
          'absolute inset-0 overflow-hidden',
          'bg-header-gradient',
          'after-header-decor',
          'z-0',
        )}
      />
      <div className="z-1 relative mx-auto mb-6 grid max-w-6xl gap-4 px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-sm leading-5">
            © {currentYear}, {siteTitle}
            <br />
            {t('ContentFooter.AppDescription')}
            <br />
            {t.rich('ContentFooter.BuiltWithText', {
              authorSite,
              NextJSLink: (chunks) => (
                <PublicLink
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-80"
                >
                  {chunks}
                </PublicLink>
              ),
              VercelLink: (chunks) => (
                <PublicLink
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-80"
                >
                  {chunks}
                </PublicLink>
              ),
              AuthorLink: (chunks) => (
                <PublicLink
                  href="https://lilliputten.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-80"
                >
                  {chunks}
                </PublicLink>
              ),
            })}
          </p>
        </div>
        <div>
          <div className="flex flex-col items-start gap-4 pt-3 text-sm">
            <LocalLink href={publicDocsRoute} className="hover:underline">
              {t('ContentFooter.DocumentationLink')}
            </LocalLink>
            {/*
            <PublicLink
              href="https://github.com/lilliputten/mindstack"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:underline"
            >
              GitHub <ExternalLink className="size-3" />
            </PublicLink>
            <LocalLink href={blogLink} className="hover:underline">
              Blog
            </LocalLink>
            <LocalLink href={supportLink} className="hover:underline">
              Support
            </LocalLink>
            */}
          </div>
        </div>
        <div>
          <div className="flex flex-col items-start gap-4 pt-3 text-sm">
            <PublicLink
              href="https://github.com/lilliputten/mindstack"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:underline"
            >
              <Github className="size-4" />
              GitHub <ExternalLink className="size-3" />
            </PublicLink>
            {/*
            <PublicLink
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:underline"
            >
              <Twitter className="size-4" />
              X.com
            </PublicLink>
            */}
          </div>
        </div>
      </div>
      <div className="z-1 relative mx-auto flex max-w-6xl flex-wrap gap-6 gap-y-2 px-6 text-sm max-sm:flex-col max-sm:items-start">
        <LocalLink href={legalPrivacyRoute} className="hover:underline">
          {t('ContentFooter.PrivacyPolicyLink')}
        </LocalLink>
        <LocalLink href={legalTermsRoute} className="hover:underline">
          {t('ContentFooter.TermsOfServiceLink')}
        </LocalLink>
        <LocalLink href={legalCookiesRoute} className="hover:underline">
          {t('ContentFooter.CookiePolicyLink')}
        </LocalLink>
        <LocalLink href={publicPricingRoute} className="hover:underline">
          {t('ContentFooter.PricingLink')}
        </LocalLink>
        <LocalLink href={publicContactsRoute} className="hover:underline">
          {t('ContentFooter.ContactsLink')}
        </LocalLink>
      </div>
    </footer>
  );
}
