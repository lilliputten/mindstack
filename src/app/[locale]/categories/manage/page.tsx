import { redirect } from 'next/navigation';

import { constructMetadata } from '@/lib/constructMetadata';
import { prisma } from '@/lib/db';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { auth } from '@/auth';
import { isDev, startAliasRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { TCategoryId } from '@/features/categories';
import { TAwaitedLocaleProps } from '@/i18n';

import { ManageCategoriesPageModalsWrapper } from './ManageCategoriesPageModalsWrapper';
import { ManageCategoriesTable } from './ManageCategoriesTable';

type TAwaitedProps = TAwaitedLocaleProps; // <{ scope: TTopicsManageScopeId }>;

interface TManageCategoriesPageHolderProps extends TAwaitedProps {
  showAddModal?: boolean;
  deleteCategoryId?: TCategoryId;
  editCategoryId?: TCategoryId;
  from?: string;
}

export async function generateMetadata({ params }: TAwaitedProps) {
  const { locale } = await params;
  // const t = await getT({ locale });
  return constructMetadata({
    locale,
    title: 'Manage Categories',
  });
}
export default async function ManageCategoriesPageHolder(props: TManageCategoriesPageHolderProps) {
  const {
    showAddModal,
    deleteCategoryId,
    editCategoryId,
    from,
    // params,
  } = props;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesPageHolder] Redirecting to auth');
    }
    redirect(startAliasRoute);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

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
          isDev && '__ManageCategoriesPageHolder', // DEBUG
        )}
        innerClassName={cn(
          isDev && '__ManageCategoriesPageHolder_Inner', // DEBUG
          'w-full rounded-lg gap-6 py-6',
        )}
        limitWidth
      >
        <ManageCategoriesPageModalsWrapper
          showAddModal={showAddModal}
          deleteCategoryId={deleteCategoryId}
          editCategoryId={editCategoryId}
          from={from}
        />

        {/*
      <section className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Manage Categories</h1>
        <p className="mb-8 text-muted-foreground">Manage your categories here</p>
        <div className="space-y-6">
          <ManageCategoriesTable />
        </div>
        <ManageCategoriesPageModalsWrapper />
        <ManageCategoriesTable />
      </section>
      */}
      </PageWrapper>
    </CategoriesProvider>
  );
}
