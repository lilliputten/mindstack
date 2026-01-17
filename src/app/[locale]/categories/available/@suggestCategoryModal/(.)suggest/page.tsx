'use client';

import { availableCategoriesRoute } from '@/config';
import { AddCategoryModal } from '@/features/categories';

export default function SuggestCategoryModalPage() {
  return <AddCategoryModal suggestionMode routePath={availableCategoriesRoute} />;
}
