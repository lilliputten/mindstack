import { TPropsWithChildrenAndClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { isDev } from '@/constants';

interface TProps extends TPropsWithChildrenAndClassName {
  inSkeleton?: boolean;
  inError?: boolean;
}

export function SettingsPageWrapper(props: TProps) {
  const {
    className,
    children,
    // inSkeleton,
    // inError,
  } = props;
  return (
    <PageWrapper
      id="SettingsPageWrapper"
      className={cn(
        isDev && '__SettingsPageWrapper', // DEBUG
        className,
      )}
      innerClassName={cn(
        isDev && '__SettingsPageWrapper_Inner', // DEBUG
        'w-full rounded-lg gap-4 py-6',
        // !inError && 'border border-solid border-gray-500/30',
      )}
      // scrollable={!inSkeleton}
      limitWidth
      // xPadded
      // vPadded
    >
      {children}
    </PageWrapper>
  );
}
