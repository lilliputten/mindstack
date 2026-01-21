import { TAwaitedLocaleProps } from '@/i18n/types';

import AvailableCategoriesPage from '../page';

type TAwaitedProps = TAwaitedLocaleProps;

export default function SuggestCategoryPage({ params }: TAwaitedProps) {
  return <AvailableCategoriesPage showSuggestModal params={params} />;
}
