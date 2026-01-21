import { setRequestLocale } from 'next-intl/server';

import { TAwaitedLocaleProps } from '@/i18n/types';

type TAwaitedProps = TAwaitedLocaleProps;

type TAvailableCategoriesLayoutProps = TAwaitedProps & {
  children: React.ReactNode;
  suggestCategoryModal: React.ReactNode; // slot from @suggestCategoryModal
};

export default async function AvailableCategoriesLayout(props: TAvailableCategoriesLayoutProps) {
  const { children, suggestCategoryModal, params } = props;
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      {children}
      {suggestCategoryModal}
    </>
  );
}
