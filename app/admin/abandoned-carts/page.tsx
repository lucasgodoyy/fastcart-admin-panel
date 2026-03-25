import { Suspense } from 'react';
import { AbandonedCartListClient } from '@/components/features/orders/AbandonedCartListClient';

export default function AbandonedCartsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <AbandonedCartListClient />
    </Suspense>
  );
}
