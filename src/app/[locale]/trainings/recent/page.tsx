import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';

import { AvailableWorkoutsListWrapper } from './AvailableWorkoutsListWrapper';

// interface TRecentWorkoutsPageProps extends TAwaitedLocaleProps {}
type TRecentWorkoutsPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TRecentWorkoutsPageProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t('Pages.RecentWorkoutsTitle'),
  });
}

export default async function RecentWorkoutsPageHolder(props: TRecentWorkoutsPageProps) {
  const params = await props.params;

  return (
    <PageWrapper
      className={cn(
        isDev && '__RecentWorkoutsPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__RecentWorkoutsPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <AvailableWorkoutsListWrapper params={params} />
    </PageWrapper>
  );
}
