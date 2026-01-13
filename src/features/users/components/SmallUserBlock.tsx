import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { TUser } from '../types';

type TUserSubset = Pick<TUser, 'id' | 'name' | 'image'>;

interface TSmallUserBlockProps {
  className?: string;
  isLoading?: boolean;
  user?: TUserSubset;
  tiny?: boolean;
}

export function SmallUserBlock(props: TSmallUserBlockProps) {
  const { className, isLoading, user, tiny } = props;
  const t = useT();
  const sizeClass = tiny ? 'size-4' : 'size-5';
  if (!isLoading && !user) {
    return null;
  }
  return (
    <div
      className={cn(
        isDev && '__SmallUserBlock', // DEBUG
        'flex items-center gap-2',
        className,
      )}
    >
      {isLoading ? (
        <>
          <div className={cn(sizeClass, 'size-5 shrink-0 overflow-hidden rounded-full')}>
            <Skeleton className={cn(sizeClass, 'size-5 rounded-full')} />
          </div>
          <Skeleton className="h-4 w-12" />
        </>
      ) : !user ? (
        <div className="opacity-30">—</div>
      ) : (
        <>
          <Avatar
            data-testid="__SmallUserBlock_Avatar"
            className={cn(
              isDev && '__SmallUserBlock_Avatar', // DEBUG
              sizeClass,
              'relative shrink-0 rounded-full bg-theme-700/25',
            )}
            {...props}
          >
            {true && user.image ? (
              <AvatarImage
                alt={t('UserAvatarImage')}
                src={user.image}
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarFallback>
                <span className="sr-only">{user.name}</span>
                <Icons.User className="size-4 opacity-50" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="truncate">{user.name}</div>
        </>
      )}
    </div>
  );
}
