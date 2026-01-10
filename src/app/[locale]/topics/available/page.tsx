import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';

import { AvailableTopicsListWrapper } from './AvailableTopicsListWrapper';

type TAwaitedProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t('Pages.AvailableTopicsTitle'),
  });
}

export default async function AvailableTopicsPageHolder() {
  return (
    <PageWrapper
      className={cn(
        isDev && '__AvailableTopicsPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__AvailableTopicsPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <AvailableTopicsListWrapper />
    </PageWrapper>
  );
}
