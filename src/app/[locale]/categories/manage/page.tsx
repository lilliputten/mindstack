import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { isDev, startAliasRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { getT } from '@/i18n';

import { ManageCategoriesListCard } from './ManageCategoriesListCard';
import { ManageCategoriesPageModalsWrapper } from './ManageCategoriesPageModalsWrapper';
import { ManageCategoriesTable } from './ManageCategoriesTable';

export default async function ManageCategoriesPage() {
  const t = await getT();

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesPage] Redirecting to auth');
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
      console.debug('[ManageCategoriesPage] User is not admin, redirecting to home');
    }
    redirect('/');
  }

  return (
    <CategoriesProvider>
      <section className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">{t('CategoriesPage.Title')}</h1>
        <p className="mb-8 text-muted-foreground">{t('CategoriesPage.Description')}</p>

        <div className="space-y-6">
          <ManageCategoriesListCard>
            <ManageCategoriesTable />
          </ManageCategoriesListCard>
        </div>

        <ManageCategoriesPageModalsWrapper />
      </section>
    </CategoriesProvider>
  );
}
