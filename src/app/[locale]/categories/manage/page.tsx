import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { isDev, startAliasRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';

import { ManageCategoriesPageModalsWrapper } from './ManageCategoriesPageModalsWrapper';
import { ManageCategoriesTable } from './ManageCategoriesTable';

export default async function ManageCategoriesPage() {
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
        <h1 className="mb-6 text-3xl font-bold">Manage Categories</h1>
        <p className="mb-8 text-muted-foreground">Manage your categories here</p>
        <div className="space-y-6">
          <ManageCategoriesTable />
        </div>
        <ManageCategoriesPageModalsWrapper />
      </section>
    </CategoriesProvider>
  );
}
