import { ExtendedUser } from '@/@types/next-auth';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage, AvatarProps } from '@/components/ui/Avatar';
import { User as UserIcon } from '@/components/shared/Icons';
import { isDev } from '@/config';

interface UserAvatarProps extends AvatarProps {
  user?: Pick<ExtendedUser, 'image' | 'name' | 'role'>;
}

export function UserAvatar({ user, className, ...props }: UserAvatarProps) {
  if (!user) {
    return null;
  }
  const isAdmin = user.role === 'ADMIN';
  return (
    <div
      className={cn(
        isDev && '__UserAvatar', // DEBUG
        'relative',
        className,
      )}
    >
      <Avatar
        data-testid="__UserAvatar_Core"
        className={cn(
          isDev && '__UserAvatar_Core', // DEBUG
          'relative size-10 rounded-full bg-theme-700/25',
          // isAdmin && 'border-2 border-solid border-red-400', // Indicate admin role with a border
        )}
        {...props}
      >
        {user.image ? (
          <AvatarImage alt="User avatar image" src={user.image} referrerPolicy="no-referrer" />
        ) : (
          <AvatarFallback>
            <span className="sr-only">{user.name}</span>
            <UserIcon className="size-4" />
          </AvatarFallback>
        )}
      </Avatar>
      {/* Indicate admin with a marker */}
      {isAdmin && (
        <>
          <span
            className={cn(
              isDev && '__UserAvatar_AdminIcon', // DEBUG
              'absolute size-2 rounded-full bg-red-500',
              'border-1 border-theme-500/80',
              'right-0 top-0',
            )}
          />
        </>
      )}
    </div>
  );
}
