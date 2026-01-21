import { DeleteCategoryModal } from '@/features/categories';

interface DeleteCategoriesModalPageProps {
  searchParams: Promise<{ categoryId?: string; from?: string }>;
}

export default async function DeleteCategoriesModalPage({
  searchParams,
}: DeleteCategoriesModalPageProps) {
  const awaitedSearchParams = await searchParams;
  const { categoryId, from } = awaitedSearchParams;

  if (categoryId) {
    return <DeleteCategoryModal categoryId={categoryId} from={from} />;
  }

  return null;
}
