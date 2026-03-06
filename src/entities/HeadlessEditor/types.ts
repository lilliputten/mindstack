export type TCmpItemId = string;
export interface TCmpItemBase {
  id: TCmpItemId;
  isNew?: boolean;
}

export interface TCmpItemProps<T> {
  className?: string;
  item: T;
  updateItem?: (it: T) => void;
}
