'use client';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { AppIntroBlock } from '@/components/content/AppIntroBlock';
import { isDev } from '@/constants';

export function SmallWelcomeText(props: TPropsWithClassName) {
  const { className } = props;
  const t = useT();

  return (
    <div
      className={cn(
        isDev && '__SmallWelcomeText', // DEBUG
        'flex flex-col gap-4',
        className,
      )}
    >
      <h2 className="content-truncate text-center text-3xl font-bold">
        <span className="content-truncate text-gr2">{t('Pages.WelcomeTitle')}</span>
      </h2>
      <AppIntroBlock />
    </div>
  );
}
