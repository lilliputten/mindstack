import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { isDev, manageCategoriesRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';

type TAwaitedLocaleProps = {
  params: Promise<{ locale: string }>;
};

type TManageCategoriesLayoutProps = TAwaitedLocaleProps & {
  children: React.ReactNode;
  addCategoryModal: React.ReactNode; // slot from @addCategoryModal
  editCategoryModal: React.ReactNode; // slot from @editCategoryModal
  deleteCategoriesModal: React.ReactNode; // slot from @deleteCategoriesModal
};

export default async function ManageCategoriesLayout(props: TManageCategoriesLayoutProps) {
  const {
    children,
    addCategoryModal, // slot from @addCategoryModal
    editCategoryModal, // slot from @editCategoryModal
    deleteCategoriesModal, // slot from @deleteCategoriesModal
    params,
  } = props;
  const { locale } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesLayout] Redirecting to auth');
    }
    redirect(manageCategoriesRoute);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesLayout] User is not admin, redirecting to home');
    }
    redirect('/');
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <CategoriesProvider>
      {children}
      {addCategoryModal}
      {editCategoryModal}
      {deleteCategoriesModal}
    </CategoriesProvider>
  );
}
