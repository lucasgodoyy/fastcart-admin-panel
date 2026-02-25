import { notFound } from 'next/navigation';
import { CustomerDetailClient } from '@/components/features/customers/CustomerDetailClient';

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    notFound();
  }

  return <CustomerDetailClient customerId={customerId} />;
}
