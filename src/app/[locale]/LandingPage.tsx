import { getTranslations, setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { InfoScreen } from '@/components/screens/InfoScreen';
import { isDev } from '@/constants';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TLandingPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'InfoPage' });
  return constructMetadata({
    title: t('title'),
    locale,
  });
}

export async function LandingPage({ params }: TLandingPageProps) {
  const { locale } = await params;

  const isLogged = await isLoggedUser();

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <PageWrapper
      id="LandingPage"
      className={cn(
        isDev && '__LandingPage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__LandingPage_Inner', // DEBUG
        'w-full h-full',
      )}
      // scrollable
      // limitWidth
    >
      <InfoScreen
        className={cn(
          isDev && '__LandingPage_InfoScreen', // DEBUG
        )}
        isLogged={isLogged}
      />
    </PageWrapper>
  );
}
