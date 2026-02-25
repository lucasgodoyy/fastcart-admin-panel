import { notFound } from 'next/navigation';
import { EditProductClient } from '@/components/features/products/EditProductClient';

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  return <EditProductClient productId={productId} />;
}
