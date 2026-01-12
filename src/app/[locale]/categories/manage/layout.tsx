import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { isDev, startAliasRoute } from '@/config';
import { CategoriesProvider } from '@/contexts/CategoriesContext';

type TAwaitedLocaleProps = {
  params: Promise<{ locale: string }>;
};

type TManageCategoriesLayoutProps = TAwaitedLocaleProps & {
  children: React.ReactNode;
  addCategoryModal: React.ReactNode; // slot from @addCategoryModal
  editCategoryModal: React.ReactNode; // slot from @editCategoryModal
  deleteCategoryModal: React.ReactNode; // slot from @deleteCategoryModal
};

export default async function ManageCategoriesLayout(props: TManageCategoriesLayoutProps) {
  const {
    children,
    addCategoryModal, // slot from @addCategoryModal
    editCategoryModal, // slot from @editCategoryModal
    deleteCategoryModal, // slot from @deleteCategoryModal
    params,
  } = props;
  const { locale } = await params;

  const session = await auth();
  const user = session?.user;

  if (user?.role !== 'ADMIN') {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[ManageCategoriesLayout] User is not admin, redirecting to home');
    }
    redirect(startAliasRoute);
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <CategoriesProvider>
      {children}
      {addCategoryModal}
      {editCategoryModal}
      {deleteCategoryModal}
    </CategoriesProvider>
  );
}
