import { notFound } from 'next/navigation';
import { CategoryFormClient } from '@/components/features/categories/CategoryFormClient';

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  return <CategoryFormClient categoryId={categoryId} />;
}
