'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { DeleteCategoryModal } from '@/features/categories/components';

export default function DeleteCategoriesModalDefault() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkDelete = '/delete';
  const isDeleteRoute = pathname?.endsWith(checkDelete);
  const categoryId = searchParams.get('categoryId');

  if (isDeleteRoute && categoryId) {
    // A path without final '/delete'
    const prevChunk = pathname.substring(0, pathname.length - checkDelete.length);
    // Check if the previous path ends with '/categories/manage'
    if (prevChunk.endsWith('/categories/manage')) {
      const from = searchParams.get('from') || undefined;
      return <DeleteCategoryModal categoryId={categoryId} from={from} />;
    }
  }

  return null;
}
