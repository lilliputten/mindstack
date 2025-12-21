'use client';

import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import NotFoundScreen from '@/components/pages/shared/NotFoundScreen';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/constants';
import { useT } from '@/i18n';

// TODO: Force 404 status code for the response

export default function NotFound() {
  const t = useT();
  return (
    <PageWrapper
      className={cn(
        isDev && '__NotFoundPage', // DEBUG
        'w-full px-6',
      )}
      innerClassName="gap-6 justify-center items-center"
      scrollable
      limitWidth
    >
      <NotFoundScreen
        className={cn(
          isDev && '__NotFoundPage_Screen', // DEBUG
          'w-full',
        )}
        icon={Icons.Topics}
        title={t('NotFoundPages.WrongTopicsPageRequested')}
      />
    </PageWrapper>
  );
}
