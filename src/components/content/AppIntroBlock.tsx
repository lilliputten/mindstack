'use client';

import { aboutRoute, myTopicsRoute, welcomeRoute } from '@/config/routesConfig';
import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isDev } from '@/constants';
import { getUserStatusText } from '@/features/users/helpers/getUserStatusText';
import { useSessionUser } from '@/hooks';
import { useT } from '@/i18n';
import { Link } from '@/i18n/routing';

export function AppIntroBlock(props: TPropsWithClassName) {
  const t = useT();
  const { className } = props;
  const user = useSessionUser();
  const isAdmin = user?.role === 'ADMIN';
  return (
    <div
      className={cn(
        isDev && '__IntroText', // DEBUG
        'flex flex-col gap-2',
        'text-content',
        className,
      )}
    >
      {t.rich('AppIntroBlockContent', {
        p: (chunks) => <p>{chunks}</p>,
        AboutLink: (chunks) => <Link href={aboutRoute}>{chunks}</Link>,
      })}
      <p>You're currently {getUserStatusText(user)}.</p>
      <p>
        As a logged in user, you can{' '}
        <Link href={myTopicsRoute}>create and edit your own trainings</Link>, view detailed
        statistics and track your historical progress.
      </p>
      <p>As a regular user, you can view and work with public trainings created by other people.</p>
      <p>
        If you have a <Link href={welcomeRoute}>PRO subscription plan</Link>, then you can use AI
        genration of topics' questions and answers.
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
