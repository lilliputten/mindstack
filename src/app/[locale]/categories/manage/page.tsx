import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { getCurrentUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { TAwaitedLocaleProps } from '@/i18n';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev, startAliasRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { TCategoryId } from '@/features/categories';

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

interface TManageCategoriesPageRouteProps extends TAwaitedProps {
  showAddModal?: boolean;
  deleteCategoryId?: TCategoryId;
  editCategoryId?: TCategoryId;
  editTopicsCategoryId?: TCategoryId;
  from?: string;
}

export default async function ManageCategoriesPageRoute(props: TManageCategoriesPageRouteProps) {
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

  if (/* !user?.id || */ user?.role !== 'ADMIN') {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesPageRoute] User is not admin, redirecting to home');
    }
    redirect(startAliasRoute);
  }

  return (
    <CategoriesProvider>
      <PageWrapper
        className={cn(
          isDev && '__ManageCategoriesPageRoute', // DEBUG class for outer container
        )}
        innerClassName={cn(
          isDev && '__ManageCategoriesPageRoute_Inner', // DEBUG class for inner container
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
