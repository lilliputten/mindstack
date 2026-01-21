'use client';

import { useEffect, useState } from 'react';

import { TDevice } from '@/lib/types/ui/TDevice';

export function useMediaQuery() {
  const [device, setDevice] = useState<TDevice | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      if (window.matchMedia('(max-width: 640px)').matches) {
        setDevice('mobile');
      } else if (window.matchMedia('(max-width: 768px)').matches) {
        setDevice('sm');
      } else if (window.matchMedia('(min-width: 641px) and (max-width: 1024px)').matches) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
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

  const isMobile = device === 'mobile';
  const isSm = device === 'sm';

  return {
    device,
    width: dimensions?.width,
    height: dimensions?.height,
    isMobile,
    isSm,
    isBelowMd: isMobile || isSm,
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  };
}
