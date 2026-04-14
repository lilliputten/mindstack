'use client';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';

// TODO: Force 404 status code for the response

interface TNotFoundScreenProps {
  title?: TReactNode;
  className?: string;
  iconId?: string;
}

export function NotFoundScreen(props: TNotFoundScreenProps) {
  const { title, className, iconId } = props;
  const t = useT();
  return (
    <PageError
      className={cn(
        isDev && '__NotFoundScreen', // DEBUG
        className,
      )}
      icon={iconId}
      title={title || t('PageNotFound')}
    />
  );
}
