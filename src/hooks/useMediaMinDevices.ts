import { useEffect, useState } from 'react';

import { TMediaWidth } from '@/lib/types/ui/TMediaWidth';

export function useMediaMinDevices() {
  const [mediaWidths, setMediaWidths] = useState<TMediaWidth[]>([]);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      const mediaWidths: TMediaWidth[] = ['xs'];
      /* // TODO: Use predefined width variables, see tailwind variables:
       * - tailwind.config.ts
       * - src/lib/types/ui/TMediaWidth.ts
       */
      if (window.matchMedia('(width > 640px)').matches) {
        mediaWidths.push('sm');
      }
      if (window.matchMedia('(width > 768px)').matches) {
        mediaWidths.push('md');
      }
      if (window.matchMedia('(width > 1024px)').matches) {
        mediaWidths.push('lg');
      }
      if (window.matchMedia('(width > 1280px)').matches) {
        mediaWidths.push('xl');
      }
      if (window.matchMedia('(width > 1546px)').matches) {
        mediaWidths.push('2xl');
      }
      setMediaWidths(mediaWidths);
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    // Initial detection
    checkDevice();

    // Listener for windows resize (TODO: add rotate listener?)
    window.addEventListener('resize', checkDevice);

    // Cleanup listener
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return {
    mediaWidths,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}
