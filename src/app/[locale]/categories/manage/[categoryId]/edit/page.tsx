import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/config';
import { TTopicsManageScopeId } from '@/contexts/TopicsContext';

import { EditCategoryPageHolder } from './EditCategoryPageHolder';

type TAwaitedProps = TAwaitedLocaleProps<{ categoryId: string }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  const title = t('Pages.EditCategoryTitle');
  return constructMetadata({
    locale,
    title,
  });
}

export default async function EditCategoryPageWrapper({ params }: TAwaitedProps) {
  const { categoryId } = await params;

  if (!categoryId) {
    return <PageError error={'No category specified'} />;
  }

  return (
    <PageWrapper
      className={cn(
        isDev && '__EditCategoryPageWrapper', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__EditCategoryPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
      )}
      limitWidth
    >
      <EditCategoryPageHolder categoryId={categoryId} />
    </PageWrapper>
  );
}
