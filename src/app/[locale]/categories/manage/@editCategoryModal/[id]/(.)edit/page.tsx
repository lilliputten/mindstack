'use client';

import { EditCategoryModal } from '@/features/categories';

export default function EditCategoryModalPage({ params }: { params: { id: string } }) {
  return <EditCategoryModal categoryId={params.id} />;
}
