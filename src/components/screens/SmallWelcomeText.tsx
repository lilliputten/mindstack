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
        className,
        'flex flex-col gap-4',
        'text-content',
      )}
    >
      <h2 className="text-center text-2xl">{t('Pages.WelcomeTitle')}</h2>
      <AppIntroBlock />
    </div>
  );
}
