'use client';

import { usePathname } from 'next/navigation';

import { AddCategoryModal } from '@/components/pages/ManageCategoriesPage/AddCategoryModal';
import { manageCategoriesRoute } from '@/config';

export default function AddCategoryModalDefault() {
  const pathname = usePathname();

  // Only render the modal if we're on the `/add` route
  const checkAdd = '/add';
  const isAddRoute = pathname?.endsWith(checkAdd);

  if (isAddRoute) {
    // A path without final '/add'
    const prevChunk = pathname.substring(0, pathname.length - checkAdd.length);
    // Check if the previous path ends with `manageCategoriesRoute` ('/categories/manage')
    if (prevChunk.endsWith(manageCategoriesRoute)) {
      return <AddCategoryModal />;
    }
  }

  return null;
}
