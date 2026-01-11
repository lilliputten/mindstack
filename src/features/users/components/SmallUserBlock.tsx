import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Icons from '@/components/shared/Icons';
import { isDev } from '@/config';

import { TUser } from '../types';

interface TSmallUserBlockProps {
  className?: string;
  isLoading?: boolean;
  user?: TUser;
}

export function SmallUserBlock(props: TSmallUserBlockProps) {
  const { className, isLoading, user } = props;
  const t = useT();
  return (
    <div
      className={cn(
        isDev && '__SmallUserBlock', // DEBUG
        'flex items-center gap-2',
        className,
      )}
    >
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : !user ? (
        <div className="opacity-30">—</div>
      ) : (
        <>
          <Avatar
            data-testid="__SmallUserBlock_Avatar"
            className={cn(
              isDev && '__SmallUserBlock_Avatar', // DEBUG
              'relative size-6 rounded-full bg-theme-700/25',
              // isAdmin && 'border-2 border-solid border-red-400', // Indicate admin role with a border
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
                <Icons.User className="size-4" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="truncate">{user.name}</div>
        </>
      )}
    </div>
  );
}
