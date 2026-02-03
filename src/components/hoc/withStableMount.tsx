'use client';

import React from 'react';

interface TWithStableMountProps {
  render: (params: { isMounted: boolean; hasStabilized: boolean }) => React.ReactNode;
  stabilizationDelay?: number;
  componentName?: string;
}

/** A Higher-Order Component that wraps a component to detect when it has
 *  stabilized after rapid mount/unmount cycles, particularly useful for
 *  components in Next.js parallel routes that may experience multiple
 *  mount/unmount cycles during navigation.
 */
export function StableMountWrapper({
  render,
  stabilizationDelay = 100,
  componentName = 'Component',
}: TWithStableMountProps) {
  const mountCountRef = React.useRef(0);
  const [hasStabilized, setHasStabilized] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    mountCountRef.current += 1;
    /* // NOTE: Debug only (see console outputs below)
     * const currentMountCount = mountCountRef.current;
     */

    // console.log(`[withStableMount:${componentName}] mount #${currentMountCount}`);
    setIsMounted(true);

    // If this is the first mount or we haven't stabilized yet,
    // set a timeout to mark as stabilized after a brief period
    if (!hasStabilized) {
      const stabilizationTimer = setTimeout(() => {
        setHasStabilized(true);
        // console.log(`[withStableMount:${componentName}] has stabilized after rapid mounts`);
      }, stabilizationDelay);

      return () => {
        clearTimeout(stabilizationTimer);

        /* // DEBUG: Only log unmount if we haven't stabilized yet (intermediate unmount)
         * if (!hasStabilized) {
         *   console.log( `[withStableMount:${componentName}] unmount (intermediate) #${currentMountCount}`;
         * } else {
         *   console.log(`[withStableMount:${componentName}] unmount (final) #${currentMountCount}`);
         * }
         */
        setIsMounted(false);
      };
    } else {
      // Component has stabilized, this is a "real" mount
      return () => {
        // console.log(`[withStableMount:${componentName}] unmount (final) #${currentMountCount}`);
        setIsMounted(false);
      };
    }
  }, [componentName, stabilizationDelay, hasStabilized]);

  return render({ isMounted, hasStabilized });
}

/** A Higher-Order Component factory that wraps a component with the StableMountWrapper */
export function withStableMount<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  componentName?: string,
  stabilizationDelay?: number,
) {
  const displayName = componentName || Component.displayName || Component.name || 'Component';

  const ComponentWithStableMount = (props: T) => {
    return (
      <StableMountWrapper
        componentName={displayName}
        stabilizationDelay={stabilizationDelay}
        render={(hasStabilized) => <Component {...props} hasStabilized={hasStabilized} />}
      />
    );
  };

  ComponentWithStableMount.displayName = `withStableMount(${displayName})`;

  return ComponentWithStableMount;
}
