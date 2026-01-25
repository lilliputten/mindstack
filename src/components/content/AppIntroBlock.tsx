'use client';

import { generateArray } from '@/lib/helpers';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';
import { aboutAliasRoute, availableTopicsRoute, myTopicsRoute, welcomeAliasRoute } from '@/config';
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
      {t.rich('AppIntro.BlockContent', {
        p: (chunks) => <p>{chunks}</p>,
        AboutLink: (chunks) => <Link href={aboutAliasRoute}>{chunks}</Link>,
      })}
      {isUserLoading ? (
        <>
          {generateArray(1).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-lg" />
          ))}
        </>
      ) : (
        <>
          <p>You're currently {getUserStatusText(user)}.</p>
          {isUser && (
            <p>
              As a logged in user, you can{' '}
              <Link href={myTopicsRoute}>create and edit your own trainings</Link>, view detailed
              statistics and track your historical progress.
            </p>
          )}
        </>
      )}
      <p>
        As a regular user, you can view and work with{' '}
        <Link href={availableTopicsRoute}>available trainings</Link> created by other people.
      </p>
      <p>
        If you have a <Link href={welcomeAliasRoute}>PRO subscription plan</Link>, then you can use
        AI genration of topics' questions and answers.
      </p>
      {isAdmin && (
        <p>
          As an admin, you can monitor and control{' '}
          <Link href={myTopicsRoute}>other users data</Link> and the users themselves.
        </p>
      )}
    </div>
  );
}
