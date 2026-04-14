'use client';

import { useContext } from 'react';

import { RouteChangeContext, RouteChangeContextType } from './RouteChangeContext';

/**
 * Custom hook to get the isRouteChanging state
 * @returns boolean indicating if a route change is in progress
 */
export function useRouteChanging(): RouteChangeContextType {
  const context = useContext(RouteChangeContext);
  if (!context) {
    throw new Error('useRouteChanging must be used within RouteChangeProvider');
  }
  return context;
}
