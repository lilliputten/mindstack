import { defaultDropAnimationSideEffects, DragOverlay } from '@dnd-kit/core';
import type { DropAnimation } from '@dnd-kit/core';

const dropAnimationConfig: DropAnimation = {
  // duration: 1000,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.1',
      },
    },
  }),
};

export function SortableOverlay({ children }: React.PropsWithChildren) {
  return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>;
}
