'use client';

import { EditCategoryModal } from '@/components/pages/ManageCategoriesPage/EditCategoryModal';

export default function EditCategoryModalPage({ params }: { params: { id: string } }) {
  return <EditCategoryModal categoryId={params.id} onClose={() => window.history.back()} />;
}
