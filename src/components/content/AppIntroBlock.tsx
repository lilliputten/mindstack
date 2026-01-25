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
            You're currently <strong>{getUserStatusText(user)}</strong>.
          </p>

          {/* Guest specific */}
          {!user && (
            <p>
              Explore public topics, try workouts, and change settings. <strong>Sign in</strong> to
              save your progress and unlock creation features.
            </p>
          )}

          {/* Logged-in user */}
          {isUser && (
            <>
              <p>
                You can <Link href={myTopicsRoute}>create and edit your own topics</Link>, track
                detailed statistics, and save your workout history.
              </p>
              <p>
                Need inspiration? Browse{' '}
                <Link href={availableCategoriesRoute}>topic categories</Link> or use the search to
                find materials.
              </p>
            </>
          )}

          {/* Admin */}
          {isAdmin && (
            <p className="border-l-2 border-red-500 pl-3">
              <strong>Admin access:</strong> You can monitor{' '}
              <Link href={myTopicsRoute}>system usage</Link> and manage user accounts.
            </p>
          )}
        </>
      )}

      {/* Features available to all */}
      <div className="space-y-1">
        <p>
          <strong>Everyone can:</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            View and practice with <Link href={availableTopicsRoute}>public topics</Link>
          </li>
          <li>Search and filter topics by category, language, or tags</li>
          <li>Adjust workout settings and preferences</li>
          <li>Track basic session performance</li>
        </ul>
      </div>

      {/* PRO features */}
      <div className="space-y-1">
        <p>
          <strong>PRO users</strong> additionally get: <Link href={pricingAliasRoute}>Upgrade</Link>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>AI-powered question & answer generation</li>
          <li>Unlimited custom topics and questions</li>
          <li>Advanced analytics and progress insights</li>
          <li>Priority support</li>
        </ul>
      </div>
    </div>
  );
}
