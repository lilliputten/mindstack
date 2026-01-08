import { TAwaitedLocaleProps } from '@/i18n/types';

import ManageCategoriesPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps;

export default function AddCategoryPage({ params }: TAwaitedProps) {
  return <ManageCategoriesPage showAddModal={true} params={params} />;
}
