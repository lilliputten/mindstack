import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';
import { TAwaitedLocaleProps } from '@/i18n/types';

import { AvailableTopicsListWrapper } from './AvailableTopicsListWrapper';

type TAwaitedProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const title = 'Availbale Topics';
  return constructMetadata({
    locale,
    title,
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
