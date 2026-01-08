import { TAwaitedLocaleProps } from '@/i18n/types';

import ManageCategoriesPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps;

interface DeleteCategoryPageProps {
  searchParams: Promise<{ categoryId: string; from?: string }>;
}

export default async function DeleteCategoryPage({
  searchParams,
  params,
}: DeleteCategoryPageProps & TAwaitedProps) {
  const { categoryId, from } = await searchParams;

  return <ManageCategoriesPage params={params} />;
}
