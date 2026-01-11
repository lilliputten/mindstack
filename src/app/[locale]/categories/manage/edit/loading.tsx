import { cn } from '@/lib/utils';
import { GenericSkeleton } from '@/components/shared';
import { isDev } from '@/config';

export default function ManageCategoriesListSkeleton() {
  return (
    <GenericSkeleton
      className={cn(
        isDev && '__ManageCategoriesListSkeleton_edit', // DEBUG
      )}
    />
  );
}
