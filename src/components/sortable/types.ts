import { Active } from '@dnd-kit/core';

export type TSortableItemBase = Pick<Active, 'id'>;
export interface TSortableItemProps<T> {
  item: T;
  isOverlay?: boolean;
}

export interface TMovedRecordParams {
  moveItem: TSortableItemBase;
  overItem: TSortableItemBase;
}
