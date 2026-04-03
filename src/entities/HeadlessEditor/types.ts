import { UniqueIdentifier } from '@dnd-kit/core';

export type TCmpItemId = UniqueIdentifier; // string | number
export interface TCmpItemBase {
  id: TCmpItemId;
  isNew?: boolean;
  order?: number | null; // According to Prisma optinal type
  _count?: unknown;
}

export interface TCmpItemProps<T> {
  className?: string;
  item: T;
  updateItem?: (it: T) => void;
  /** Does the owner editor component have unsaved data? */
  hasChanges?: boolean;
  compact?: boolean;
}
