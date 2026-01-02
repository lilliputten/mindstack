'use client';

import React from 'react';

import * as Icons from '@/components/shared/Icons';
import { useT } from '@/i18n';

export function MarkdownHint() {
  const t = useT();

  return (
    <>
      {t.rich('MarkdownHint.Content', {
        MarkdownGuideLink: (chunks) => (
          <a
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:no-underline"
          >
            {chunks}
            <Icons.ExternalLink className="size-3.5" />
          </a>
        ),
      })}
    </>
  );
}
