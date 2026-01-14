import { setRequestLocale } from 'next-intl/server';

import { TAwaitedLocaleProps } from '@/i18n/types';

type TAwaitedProps = TAwaitedLocaleProps;

type TLayoutProps = TAwaitedProps & {
  children: React.ReactNode;
};

export default async function AvailableCategoriesLayout(props: TLayoutProps) {
  const { children, params } = props;
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <>{children}</>;
}
