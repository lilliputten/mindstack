'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/constants';
import { predefinedLanguagesHash } from '@/constants/languages';

interface TProps {
  className?: string;
  langCode?: string | null;
  langName?: string | null;
  hideCode?: boolean;
}

export function LanguageName(props: TProps) {
  const { langCode, langName, className, hideCode } = props;
  const t = useT();
  const name = React.useMemo(() => {
    let name: string = langName || '';
    if (!name && langCode) {
      if (predefinedLanguagesHash[langCode]) {
        name = predefinedLanguagesHash[langCode];
      }
    }
    const trId = name ? `languages.${name}` : undefined;
    const translated = trId && t(trId);
    return translated !== trId ? translated : name;
  }, [t, langCode, langName]);
  if (!name && !langCode) {
    return null;
  }
  const items = [
    (name || langCode) && (
      <span key="langName" className="truncate">
        {name || langCode}
      </span>
    ),
    !hideCode && name && langCode && langCode !== name && (
      <span key="langCode" className="truncate opacity-50">
        ({langCode})
      </span>
    ),
  ]
    .filter(Boolean)
    // Interleave with delimiters
    .flatMap((item) => [item, ' '])
    // Remove the last delimiter
    .slice(0, -1);
  return (
    <span
      className={cn(
        isDev && '__LanguageName', // DEBUG
        'truncate',
        className,
      )}
    >
      {items}
    </span>
  );
}
