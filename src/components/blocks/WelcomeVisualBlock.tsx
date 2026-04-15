import Image from 'next/image';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { SmallWelcomeText } from '@/components/screens/SmallWelcomeText';
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
          src="/static/landing/features/abstract/14clean.jpg"
          alt={t('Landing.HeroSection.Title')}
          fill
          className="object-cover"
          priority
        />
      </div>
      <SmallWelcomeText className="" />
    </div>
  );
}
