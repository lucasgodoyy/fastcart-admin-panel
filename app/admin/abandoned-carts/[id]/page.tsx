import { Suspense } from 'react';
import { AbandonedCartDetailClient } from '@/components/features/orders/AbandonedCartDetailClient';

interface Props {
  params: { id: string };
}

export default function AbandonedCartDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <AbandonedCartDetailClient cartId={Number(params.id)} />
    </Suspense>
  );
}
