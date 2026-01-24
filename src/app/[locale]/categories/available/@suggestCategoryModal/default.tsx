'use client';

import { usePathname } from 'next/navigation';

import { AddCategoryModal } from '@/features/categories/components';

export default function SuggestCategoryModalDefault() {
  const pathname = usePathname();

  // Only render the modal if we're on the `/suggest` route
  const checkSuggest = '/suggest';
  const isSuggestRoute = pathname?.endsWith(checkSuggest);

  if (isSuggestRoute) {
    /* // There are a few possible routes avaialable: `rootCategoriesRoute`, `availableCategoriesRoute`, don't check it now.
     * const prevChunk = pathname.substring(0, pathname.length - checkSuggest.length);
     * if (prevChunk.endsWith(manageCategoriesRoute)) {}
     */
    return <AddCategoryModal suggestionMode />;
  }

  return null;
}
