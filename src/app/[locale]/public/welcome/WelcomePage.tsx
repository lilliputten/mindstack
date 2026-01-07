import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { isLoggedUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { isDev } from '@/constants';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale });
  return constructMetadata({
    title: t('Pages.WelcomeTitle'),
    locale,
  });
}

export async function WelcomePage({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;

  const isLogged = await isLoggedUser();

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <PageWrapper
      id="WelcomePage"
      className={cn(
        isDev && '__WelcomePage', // DEBUG
      )}
      innerClassName={cn(
        isDev && '__WelcomePage_Inner', // DEBUG
        'size-full',
      )}
    >
      <WelcomeScreen
        className={cn(
          isDev && '__WelcomePage_WelcomeScreen', // DEBUG
        )}
        isLogged={isLogged}
      />
    </PageWrapper>
  );
}
