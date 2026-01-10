'use client';

import { EditCategoryModal } from '@/features/categories';

export default function EditCategoryModalPage({ params }: { params: { categoryId: string } }) {
  return <EditCategoryModal categoryId={params.categoryId} />;
}
