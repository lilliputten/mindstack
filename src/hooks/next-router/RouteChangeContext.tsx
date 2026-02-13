'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

export interface RouteChangeContextType {
  isRouteChanging: boolean;
  push: (href: string) => Promise<void>;
  replace: (href: string) => Promise<void>;
  prefetch: (href: string) => Promise<void>;
}

export const RouteChangeContext = createContext<RouteChangeContextType | undefined>(undefined);

export function RouteChangeProvider({ children }: { children: React.ReactNode }) {
  const router = useNextRouter();
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  const push = useCallback(
    async (href: string) => {
      setIsRouteChanging(true);
      try {
        router.push(href);
        // Add a small delay to account for navigation processing
        await new Promise((resolve) => setTimeout(resolve, 100));
      } finally {
        // Reset after navigation or on error
        setTimeout(() => setIsRouteChanging(false), 300);
      }
    },
    [router],
  );

  const replace = useCallback(
    async (href: string) => {
      setIsRouteChanging(true);
      try {
        router.replace(href);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } finally {
        setTimeout(() => setIsRouteChanging(false), 300);
      }
    },
    [router],
  );

  const prefetch = useCallback(
    async (href: string) => {
      try {
        router.prefetch(href);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Prefetch error:', error);
        debugger; // eslint-disable-line no-debugger
      }
    },
    [router],
  );

  return (
    <RouteChangeContext.Provider value={{ isRouteChanging, push, replace, prefetch }}>
      {children}
    </RouteChangeContext.Provider>
  );
}

export function useRouteChanging() {
  const context = useContext(RouteChangeContext);
  if (!context) {
    throw new Error('useRouteChanging must be used within RouteChangeProvider');
  }
  return context;
}
