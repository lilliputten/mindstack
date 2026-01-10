import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { InfoScreen } from '@/components/screens/InfoScreen';
import { isDev } from '@/constants';

type TInfoPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.InfoTitle'),
    locale,
  });
}

export async function InfoPage({ params }: TInfoPageProps) {
  const { locale } = await params;

  const isLogged = await isLoggedUser();

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <PageWrapper
      id="InfoPage"
      className={cn(
        isDev && '__InfoPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__InfoPage_Inner', // DEBUG
        'size-full',
      )}
    >
      <InfoScreen
        className={cn(
          isDev && '__InfoPage_InfoScreen', // DEBUG
        )}
        isLogged={isLogged}
      />
    </PageWrapper>
  );
}
