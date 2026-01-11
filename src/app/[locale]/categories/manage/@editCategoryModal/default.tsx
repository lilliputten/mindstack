'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { EditCategoryModal } from '@/features/categories';

export default function EditCategoriesModalDefault() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkEdit = '/edit';
  const isEditRoute = pathname?.endsWith(checkEdit);
  const categoryId = searchParams.get('categoryId');

  if (isEditRoute && categoryId) {
    // A path without final '/edit'
    const prevChunk = pathname.substring(0, pathname.length - checkEdit.length);
    // Check if the previous path ends with '/categories/manage'
    if (prevChunk.endsWith('/categories/manage')) {
      const from = searchParams.get('from') || undefined;
      return <EditCategoryModal categoryId={categoryId} from={from} />;
    }
  }

  return null;
}
