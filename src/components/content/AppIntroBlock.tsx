'use client';

import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import {
  aboutAliasRoute,
  availableCategoriesRoute,
  availableTopicsRoute,
  myTopicsRoute,
  pricingAliasRoute,
} from '@/config';
import { isDev } from '@/constants';
import { getUserStatusText } from '@/features/users/helpers/getUserStatusText';
import { useSessionData } from '@/hooks';

import { Skeleton } from '../ui/Skeleton';

export function AppIntroBlock(props: TPropsWithClassName) {
  const t = useT();
  const { className } = props;
  const { user, loading: isUserLoading } = useSessionData();
  const isUser = !!user;
  const isAdmin = user?.role === 'ADMIN';
  return (
    <div
      className={cn(
        isDev && '__AppIntroBlock', // DEBUG
        'flex flex-col gap-2',
        'content-text',
        className,
      )}
    >
      <h3>{t('AppIntro.Subtitle')}</h3>

      <p>
        {t.rich('AppIntro.BlockContent', {
          AboutLink: (chunks) => <Link href={aboutAliasRoute}>{chunks}</Link>,
        })}
      </p>

      {isUserLoading ? (
        <>
          {generateArray(1).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-lg" />
          ))}
        </>
      ) : (
        <>
          <p className="font-medium">
            {t('AppIntro.CurrentUserStatus', { status: getUserStatusText(user, t) })}
          </p>

          {/* Guest specific */}
          {!user && (
            <p>
              {t.rich('AppIntro.GuestSpecificText', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          )}

          {/* Logged-in user */}
          {isUser && (
            <>
              <p>
                {t.rich('AppIntro.LoggedInUserText1', {
                  LinkMyTopics: (chunks) => <Link href={myTopicsRoute}>{chunks}</Link>,
                })}
              </p>
              <p>
                {t.rich('AppIntro.LoggedInUserText2', {
                  LinkCategories: (chunks) => <Link href={availableCategoriesRoute}>{chunks}</Link>,
                })}
              </p>
            </>
          )}

          {/* Admin */}
          {isAdmin && (
            <p className="border-l-2 border-red-500 pl-3">
              {t.rich('AppIntro.AdminAccessText', {
                strong: (chunks) => <strong>{chunks}</strong>,
                LinkMyTopics: (chunks) => <Link href={myTopicsRoute}>{chunks}</Link>,
              })}
            </p>
          )}
        </>
      )}

      {/* Features available to all */}
      <div className="space-y-1">
        <p>
          <strong>{t('AppIntro.EveryoneCan')}</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            {t.rich('AppIntro.EveryoneCanList1', {
              LinkAvailableTopics: (chunks) => <Link href={availableTopicsRoute}>{chunks}</Link>,
            })}
          </li>
          <li>{t('AppIntro.EveryoneCanList2')}</li>
          <li>{t('AppIntro.EveryoneCanList3')}</li>
          <li>{t('AppIntro.EveryoneCanList4')}</li>
        </ul>
      </div>

      {/* PRO features */}
      <div className="space-y-1">
        <p>
          {t.rich('AppIntro.ProUsersAlsoGet', {
            strong: (chunks) => <strong>{chunks}</strong>,
            LinkPricing: (chunks) => <Link href={pricingAliasRoute}>{chunks}</Link>,
          })}
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('AppIntro.ProUsersList1')}</li>
          <li>{t('AppIntro.ProUsersList2')}</li>
          <li>{t('AppIntro.ProUsersList3')}</li>
          <li>{t('AppIntro.ProUsersList4')}</li>
        </ul>
      </div>
    </div>
  );
}
