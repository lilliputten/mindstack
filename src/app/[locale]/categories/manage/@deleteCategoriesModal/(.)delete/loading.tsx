import { cn } from '@/lib/utils';
import { SkeletonPopup } from '@/components/ui/SkeletonPopup';
import { isDev } from '@/config';

export default function ModalLoading() {
  return (
    <SkeletonPopup
      className={cn(
        isDev && '__ManageCategoriesListSkeleton_deleteCategoriesModal', // DEBUG
      )}
    />
  );
}
