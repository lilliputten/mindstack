import Image from 'next/image';

import { TPropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { isDev } from '@/constants';

export function InfoVisualBlock(props: TPropsWithClassName) {
  const { className } = props;
  const t = useT();
  return (
    <div
      className={cn(
        isDev && '__InfoVisualBlock', // DEBUG
        className,
        'gap-4',
        'flex flex-col',
        'items-stretch',
        'justify-center',
        'w-full',
        'max-w-xl',
      )}
    >
      <div
        className={cn(
          isDev && '__InfoVisualBlock_ImageContainer', // DEBUG
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
    </div>
  );
}
