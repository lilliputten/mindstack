'use server';

import { TReactNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getT } from '@/i18n';
import { PageError } from '@/components/shared/PageError';
import { isDev } from '@/constants';

// TODO: Force 404 status code for the response

interface TServerNotFoundScreenProps {
  title?: TReactNode;
  className?: string;
  iconId?: string;
}

export async function ServerNotFoundScreen(props: TServerNotFoundScreenProps) {
  const { title, className, iconId } = props;
  const t = await getT();
  return (
    <PageError
      className={cn(
        isDev && '__ServerNotFoundScreen', // DEBUG
        className,
      )}
      icon={iconId}
      title={title || t('PageNotFound')}
    />
  );
}
