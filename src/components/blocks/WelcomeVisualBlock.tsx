import Image from 'next/image';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { SmallWelcomeText } from '@/components/screens/SmallWelcomeText';
// import svgArt from '@/assets/arts/bink-bus-single.svg';
import { isDev } from '@/constants';

export function WelcomeVisualBlock(props: TPropsWithClassName) {
  const { className } = props;
  const t = useT();
  return (
    <div
      className={cn(
        isDev && '__WelcomeVisualBlock', // DEBUG
        'relative w-full p-6',
        'flex flex-1 flex-col items-center justify-center gap-4',
        className,
      )}
    >
      <div
        className={cn(
          isDev && '__WelcomeVisualBlock_ImageContainer', // DEBUG
          'relative w-full overflow-hidden rounded-lg',
          'aspect-video',
        )}
      >
        <Image
          src="/static/landing/features/14.jpg"
          alt={t('Landing.HeroSection.Title')}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* // Show a logo in the top right corner
        <Image
          src={svgArt}
          alt="Intro illustration"
          className={cn(
            isDev && '__WelcomeVisualBlock_Art', // DEBUG
            'mx-auto my-6',
            'w-full sm:max-w-md',
            'select-none',
          )}
        />
        <div
          className={cn(
            isDev && '__WelcomeVisualBlock_Logo', // DEBUG
            'absolute right-4 top-4 p-1',
            'flex flex-1 flex-col items-center justify-center',
            'bg-theme-700/70 dark:bg-transparent',
            'rounded-full',
            'select-none',
          )}
        >
          <Image src={logoSvg} className="h-12 w-auto" alt={siteTitle} priority={false} />
        </div>
        */}
      <SmallWelcomeText className="" />
    </div>
  );
}
