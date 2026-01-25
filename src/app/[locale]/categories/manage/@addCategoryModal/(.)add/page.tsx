'use client';

import { manageCategoriesRoute } from '@/config';
import { AddCategoryModal } from '@/features/categories/components';

export default function AddCategoryModalPage() {
  return <AddCategoryModal routePath={manageCategoriesRoute} />;
}
