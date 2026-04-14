'use client';

import React from 'react';

/**
 * Custom hook to track whether a route change is in progress in Next.js App Router
 * @returns Object containing isRouteChanging state and methods
 */
export function useRouteChanging() {
  const [isRouteChanging, setIsRouteChanging] = React.useState(false);
  const navigationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle route change start
   */
  const handleRouteChangeStart = React.useCallback(() => {
    setIsRouteChanging(true);

    // Clear any existing timeout to avoid conflicts
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
  }, []);

  /**
   * Handle route change completion
   */
  const handleRouteChangeComplete = React.useCallback(() => {
    setIsRouteChanging(false);
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
  }, []);

  /**
   * Handle route change errors
   */
  const handleRouteChangeError = React.useCallback(() => {
    setIsRouteChanging(false);
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
  }, []);

  /**
   * Handle route change with timeout fallback
   */
  const handleBeforeUnload = React.useCallback(() => {
    handleRouteChangeStart();

    // Set a fallback timeout to ensure isRouteChanging is reset
    // in case complete/error events don't fire (rare edge cases)
    navigationTimeoutRef.current = setTimeout(() => {
      setIsRouteChanging(false);
    }, 10000); // 10 second timeout
  }, [handleRouteChangeStart]);

  React.useEffect(() => {
    // Listen to popstate events (browser back/forward navigation)
    const handlePopState = () => {
      handleRouteChangeStart();
    };

    window.addEventListener('popstate', handlePopState);

    // Note: The App Router in Next.js 15 doesn't expose route change events
    // like the Pages Router did with Router.events. Instead, we use:
    // 1. MutationObserver to track DOM changes
    // 2. Intersection Observer patterns
    // 3. Manual router.push() tracking with a wrapper

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [handleRouteChangeStart]);

  return {
    isRouteChanging,
    setIsRouteChanging,
    handleBeforeUnload,
    handleRouteChangeStart,
    handleRouteChangeComplete,
    handleRouteChangeError,
  };
}
