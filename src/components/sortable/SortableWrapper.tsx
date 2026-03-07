import React from 'react';
import {
  Active,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

import { SortableOverlay } from './SortableOverlay';
import { TSortableItemBase, TSortableItemProps } from './types';

interface TProps<T extends TSortableItemBase> {
  children?: React.ReactNode;
  isPending?: boolean;
  items: T[];
  changeItemsOrder: (moveId: T['id'], overId: T['id']) => void;
  RenderItem: (props: TSortableItemProps<T>) => JSX.Element | null;
}

export function SortableWrapper<T extends TSortableItemBase>(props: TProps<T>) {
  const {
    children,
    items,
    RenderItem,
    changeItemsOrder,
    // isPending,
  } = props;

  // Dnd-kit
  const [active, setActive] = React.useState<Active | null>(null);
  const activeItem = React.useMemo(
    () => items.find((item) => item && item.id === active?.id),
    [active, items],
  );
  const sensors = useSensors(
    // Sortable sensors list (only for mouse pointer and touch devices so far)
    useSensor(MouseSensor),
    useSensor(TouchSensor),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over: overItem } = event;
    // TODO: Narrow the id type
    const moveId: T['id'] = active.id;
    const overId: T['id'] | undefined = overItem?.id;
    if (moveId && overId && moveId !== overId) {
      changeItemsOrder(moveId, overId);
    }
    setActive(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActive(active)}
      onDragCancel={() => setActive(null)}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items}>
        {/* Items list */}
        {children}
      </SortableContext>
      <SortableOverlay>
        {activeItem && (
          <RenderItem
            // Active item overlay
            item={activeItem}
            isOverlay
          />
        )}
      </SortableOverlay>
    </DndContext>
  );
}
