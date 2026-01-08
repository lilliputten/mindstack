import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev, manageCategoriesRoute, startAliasRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { TCategoryId } from '@/features/categories';
import { TAwaitedLocaleProps } from '@/i18n';

import { ManageCategoriesPageModalsWrapper } from './ManageCategoriesPageModalsWrapper';

type TAwaitedProps = TAwaitedLocaleProps; // <{ scope: TTopicsManageScopeId }>;

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  // const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: 'Manage Categories',
  });
}

interface TManageCategoriesPageHolderProps extends TAwaitedProps {
  showAddModal?: boolean;
  deleteCategoryId?: TCategoryId;
  editCategoryId?: TCategoryId;
  editTopicsCategoryId?: TCategoryId;
  from?: string;
}

export default async function ManageCategoriesPageHolder(props: TManageCategoriesPageHolderProps) {
  const {
    showAddModal,
    deleteCategoryId,
    editCategoryId,
    editTopicsCategoryId,
    from,
    // params,
  } = props;

  // Removed modal props since they will be handled by intercepted routes
  const params = await props.params;
  const locale = params.locale;

  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user?.id) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesPageHolder] Redirecting to auth');
    }
    redirect(startAliasRoute);
  }

  if (user?.role !== 'ADMIN') {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesPageHolder] User is not admin, redirecting to home');
    }
    redirect('/');
  }

  return (
    <CategoriesProvider>
      <PageWrapper
        className={cn(
          isDev && '__ManageCategoriesPageHolder', // DEBUG class for outer container
        )}
        innerClassName={cn(
          isDev && '__ManageCategoriesPageHolder_Inner', // DEBUG class for inner container
          'w-full rounded-lg gap-6 py-6',
        )}
        limitWidth
      >
        {/* Page wrapper provides consistent layout styling */}
        <ManageCategoriesPageModalsWrapper
          showAddModal={showAddModal}
          deleteCategoryId={deleteCategoryId}
          editCategoryId={editCategoryId}
          editTopicsCategoryId={editTopicsCategoryId}
          from={from}
        />
      </PageWrapper>
    </CategoriesProvider>
  );
}
