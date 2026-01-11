import { TAwaitedLocaleProps } from '@/i18n/types';

import ManageCategoriesPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps;

interface DeleteCategoryPageProps {
  searchParams: Promise<{ categoryId: string; from?: string }>;
}

export default async function DeleteCategoryPage({
  params,
}: DeleteCategoryPageProps & TAwaitedProps) {
  return <ManageCategoriesPage params={params} />;
}
