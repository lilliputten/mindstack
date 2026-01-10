'use client';

import { useParams, usePathname } from 'next/navigation';

import { EditCategoryModal } from '@/features/categories';

export default function EditCategoryModalDefault() {
  const pathname = usePathname();
  const params = useParams();

  // Only render the modal if we're on the /edit route
  const checkEdit = '/edit';
  if (pathname?.endsWith(checkEdit) && params?.id) {
    const categoryId = String(params.id);
    // A path without final '/edit'
    const prevChunk = pathname.substring(0, pathname.length - checkEdit.length);
    // Check if the previous path ends with the category ID
    if (prevChunk.endsWith(`/${categoryId}`)) {
      return <EditCategoryModal categoryId={categoryId} />;
    }
  }
}
