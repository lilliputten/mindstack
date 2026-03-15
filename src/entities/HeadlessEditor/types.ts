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
  /** Does the owner editor component have unsaved data? */
  hasChanges?: boolean;
}

export interface THeadlessEditorProps<
  T extends TCmpItemBase,
  LargeTexts extends boolean = boolean,
> {
  className?: string;

  /// Lifecylcle control...
  /** Data ready flag. A skeleton will be disaplayed until it hasn't set. */
  isReady?: boolean;
  /** Does the owner editor component have unsaved data? */
  hasChanges?: boolean;

  /// Options...

  /** Locale for comparator */
  lang: string;
  /** Large texts support: To item textss using ngrams for large texts or with just tokens otherwise */
  largeTexts?: LargeTexts;
  /** Display in a narrow layout */
  forceCompact?: boolean;
  /** Show normalized values */
  showNormalized?: boolean;

  /// Filters...

  filterText?: string;
  filterTextSmart?: boolean;

  /** Filter only compared items */
  filterTargeted?: boolean;
  filterUpdated?: boolean;
  filterAdded?: boolean;
  filterSelected?: boolean;

  // Items interface...

  /** Items list */
  items: T[];
  /** A method to retrieve an items text to compare */
  getItemText: (item: T) => string;
  /** Editor item rendering component */
  RenderItem: (props: TCmpItemProps<T>) => JSX.Element | null;
  /** Update items data */
  updateItems?: (its: T[]) => void;
  /** Update reordered items */
  updateReordered?: (its: T[]) => void;

  /// Tracking indices...

  updatedIds?: Set<TCmpItemId>;
  addedIds?: Set<TCmpItemId>;
  reorderedIds?: Set<TCmpItemId>;
  selectedIds?: Set<TCmpItemId>;
  // deletedIds?: Set<TCmpItemId>; // Is it required here?

  /// Items state...

  toggleSelectedId?: (id: TCmpItemId, selected: boolean) => void;
  compareTargetId?: TCmpItemId;
  setCompareTargetId?: (id?: TCmpItemId) => void;
  changeItemsOrder?: (moveId: TCmpItemId, overId: TCmpItemId) => void;
}
