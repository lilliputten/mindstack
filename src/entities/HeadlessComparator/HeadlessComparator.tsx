import { cn } from '@/lib/utils';
import { isDev } from '@/config';

interface TProps<T> {
  className?: string;
  items: T[];
  RenderItem: (props: { item: T; idx?: number }) => JSX.Element | null;
}

export function HeadlessComparator<T>(props: TProps<T>) {
  const { className, items, RenderItem } = props;
  const renderedItems = items.map((item, idx) => (
    <RenderItem key={String(idx)} item={item} idx={idx} />
  ));
  return (
    <div
      className={cn(
        isDev && '__HeadlessComparator', // DEBUG
        className,
      )}
    >
      {renderedItems}
    </div>
  );
}
