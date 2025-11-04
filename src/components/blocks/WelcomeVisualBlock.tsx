import Image from 'next/image';
import { useTheme } from 'next-themes';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { SmallWelcomeText } from '@/components/screens/SmallWelcomeText';
import svgArt from '@/assets/arts/girl-with-a-book.svg';
import logoSvg from '@/assets/logo/logo-on-dark.svg';
import { siteTitle } from '@/config';
import { isDev } from '@/constants';

export function WelcomeVisualBlock(props: TPropsWithClassName) {
  const { className } = props;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <ScrollArea
      className={cn(
        isDev && '__WelcomeVisualBlock_Scroll', // DEBUG
      )}
    >
      <div
        className={cn(
          isDev && '__WelcomeVisualBlock', // DEBUG
          className,
          'm-6 gap-4',
          'flex flex-1 flex-col',
          'items-center justify-center',
          'relative',
        )}
      >
        <Image
          src={svgArt}
          alt="Intro illustration"
          className={cn(
            isDev && '__WelcomeVisualBlock_Art', // DEBUG
            'mx-auto mt-4',
            'w-full sm:max-w-md',
          )}
        />
        <div
          className={cn(
            isDev && '__WelcomeVisualBlock_Logo', // DEBUG
            'absolute right-0 top-0',
            'flex flex-1 flex-col',
            'items-center justify-center',
            !isDark && 'bg-blue-900/80',
            'rounded-full',
            'p-1',
          )}
        >
          <Image src={logoSvg} className="h-12 w-auto" alt={siteTitle} priority={false} />
        </div>
        {/* // XXX: Alternate layout: the art as a background
      <div
        className={cn(
          isDev && '__WelcomeVisualBlock_Art', // DEBUG
          'bg-contain',
          'bg-center',
          'bg-no-repeat',
        )}
        style={{
          // minHeight: '40vw',
          minHeight: '50vh',
          backgroundImage: 'url(/static/arts/login-blue.svg)',
        }}
      />
      */}
        <SmallWelcomeText />
      </div>
    </ScrollArea>
  );
}
