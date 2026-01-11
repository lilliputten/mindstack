import { TAwaitedLocaleProps } from '@/i18n/types';

import ManageCategoriesPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps;

interface EditCategoryPageProps {
  searchParams: Promise<{ categoryId: string; from?: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps & TAwaitedProps) {
  return <ManageCategoriesPage params={params} />;
}
