import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/config';

import { AvailableCategoriesListWrapper } from './AvailableCategoriesListWrapper';

interface TAvailableCategoriesPageProps extends TAwaitedLocaleProps {
  showSuggestModal?: boolean;
}

export async function generateMetadata({ params }: TAvailableCategoriesPageProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t('Pages.CategoriesTitle'),
  });
}

export default async function AvailableCategoriesPageHolder(props: TAvailableCategoriesPageProps) {
  const { showSuggestModal } = props;
  const params = await props.params;

  return (
    <PageWrapper
      className={cn(
        isDev && '__AvailableCategoriesPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__AvailableCategoriesPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <AvailableCategoriesListWrapper showSuggestModal={showSuggestModal} params={params} />
    </PageWrapper>
  );
}
