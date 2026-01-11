import { EditCategoryModal } from '@/features/categories';

interface EditCategoriesModalPageProps {
  searchParams: Promise<{ categoryId?: string; from?: string }>;
}

export default async function EditCategoriesModalPage({
  searchParams,
}: EditCategoriesModalPageProps) {
  const awaitedSearchParams = await searchParams;
  const { categoryId, from } = awaitedSearchParams;

  if (categoryId) {
    return <EditCategoryModal categoryId={categoryId} from={from} />;
  }
}
