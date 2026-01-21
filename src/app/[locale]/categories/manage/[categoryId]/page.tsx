import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';

import { ViewCategoryPageHolder } from './ViewCategoryPageHolder';

type TAwaitedProps = TAwaitedLocaleProps<{ categoryId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: t('Pages.ViewCategoryTitle'),
  });
}

export default async function ViewCategoryPageWrapper({ params }: TAwaitedProps) {
  const { categoryId } = await params;

  if (!categoryId) {
    return <PageError error={'No category specified'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__ViewCategoryPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__ViewCategoryPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
      // vPadded
    >
      <ViewCategoryPageHolder categoryId={categoryId} />
    </PageWrapper>
  );
}
