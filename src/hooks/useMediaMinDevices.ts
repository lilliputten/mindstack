'use client';

import { useEffect, useState } from 'react';

import { TMediaWidth } from '@/lib/types/ui/TMediaWidth';

function getMediaWidths(width: number): TMediaWidth[] {
  const mediaWidths: TMediaWidth[] = ['xs'];
  /* // TODO: Use predefined width variables, see tailwind variables:
   * - tailwind.config.ts
   * - src/lib/types/ui/TMediaWidth.ts
   */
  if (width > 640) {
    mediaWidths.push('sm');
  }
  if (width > 768) {
    mediaWidths.push('md');
  }
  if (width > 1024) {
    mediaWidths.push('lg');
  }
  if (width > 1280) {
    mediaWidths.push('xl');
  }
  if (width > 1546) {
    mediaWidths.push('2xl');
  }
  return mediaWidths;
}

export function useMediaMinDevices() {
  const isWindow = typeof window !== 'undefined';
  const width = (isWindow && window?.innerWidth) || 0;
  const height = (isWindow && window?.innerHeight) || 0;
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width,
    height,
  });

  const [inited, setInited] = useState(false);
  const [mediaWidths, setMediaWidths] = useState<TMediaWidth[]>(getMediaWidths(width));

  useEffect(() => {
    const checkDevice = () => {
      const width = window?.innerWidth || 0;
      const height = window?.innerHeight || 0;
      setDimensions({ width, height });
      const mediaWidths: TMediaWidth[] = getMediaWidths(width);
      setMediaWidths(mediaWidths);
      setInited(true);
    };
    checkDevice();
    // Listener for windows resize (TODO: add rotate listener?)
    window.addEventListener('resize', checkDevice);
    // Cleanup listener
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return {
    inited,
    mediaWidths,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}
