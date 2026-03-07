import { UniqueIdentifier } from '@dnd-kit/core';

export type TCmpItemId = UniqueIdentifier; // string | number
export interface TCmpItemBase {
  id: TCmpItemId;
  isNew?: boolean;
  order?: number;
}

export interface TCmpItemProps<T> {
  className?: string;
  item: T;
  updateItem?: (it: T) => void;
}
