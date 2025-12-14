import { setRequestLocale } from 'next-intl/server';

import { constructMetadata } from '@/lib/constructMetadata';
import { cn } from '@/lib/utils';
import { DemoList } from '@/components/debug/DemoList';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/constants';
import { getT } from '@/i18n';
import { TAwaitedLocaleProps } from '@/i18n/types';

type TDataPageProps = TAwaitedLocaleProps;

export async function generateMetadata({ params }: TAwaitedLocaleProps) {
  const { locale } = await params;
  const t = await getT({ locale, namespace: 'DataPage' });
  return constructMetadata({
    title: t('title'),
    locale,
  });
}

export async function DataPage({ params }: TDataPageProps) {
  const { locale } = await params;

  /* // NOTE: Checking NEXT_PUBLIC_USER_REQUIRED or existed user session
   * const user = await getCurrentUser();
   * if (!user && env.NEXT_PUBLIC_USER_REQUIRED) {
   *   redirect(welcomeRoute);
   * }
   */

  // Enable static rendering
  setRequestLocale(locale);

  /* // UNUSED: Data loading
   * const fetchParams: TFetchRecordsByParentWithChildrenCountParams = {
   *   parentId: null,
   *   userId: user?.id || null,
   * };
   * const rootRecords: TRecordWithChildrenOrCount[] =
   *   await fetchRecordsByParentWithChildrenCount(fetchParams);
   */

  return (
    <PageWrapper
      id="DataPage"
      className={cn(
        isDev && '__DataPage', // DEBUG
      )}
      innerClassName="w-full"
      limitWidth
      xPadded
    >
      <DemoList count={50} className="w-full" />
    </PageWrapper>
  );
}
