'use client';

import { useParams, usePathname } from 'next/navigation';

import { EditCategoryModal } from '@/components/pages/ManageCategoriesPage/EditCategoryModal';

export default function EditCategoryModalDefault() {
  const pathname = usePathname();
  const params = useParams();

  // Only render the modal if we're on the /edit route
  const checkEdit = '/edit';
  const isEditRoute = pathname?.endsWith(checkEdit);
  const categoryId = params?.id;

  if (isEditRoute && categoryId) {
    // A path without final '/edit'
    const prevChunk = pathname.substring(0, pathname.length - checkEdit.length);
    // Check if the previous path ends with the category ID
    if (prevChunk.endsWith(`/${categoryId}`)) {
      return <EditCategoryModal categoryId={categoryId} onClose={() => window.history.back()} />;
    }
  }

  return null;
}
