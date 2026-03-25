import { notFound } from 'next/navigation';
import { ProductFormClient } from '@/components/features/products/ProductFormClient';

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  return <ProductFormClient mode="edit" productId={productId} />;
}
