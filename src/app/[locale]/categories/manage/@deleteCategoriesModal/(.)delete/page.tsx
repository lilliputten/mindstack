import { DeleteCategoriesModal } from '@/components/pages/ManageCategoriesPage/DeleteCategoriesModal';

interface DeleteCategoriesModalPageProps {
  searchParams: Promise<{ categoryId?: string; from?: string }>;
}

export default async function DeleteCategoriesModalPage({
  searchParams,
}: DeleteCategoriesModalPageProps) {
  const awaitedSearchParams = await searchParams;
  const { categoryId, from } = awaitedSearchParams;

  if (categoryId) {
    return (
      <DeleteCategoriesModal
        categoryId={categoryId}
        from={from}
        // onClose={() => window.history.back()}
      />
    );
  }

  return null;
}
