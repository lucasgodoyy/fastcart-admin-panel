import { Suspense } from 'react';
import { FreeShippingClient } from '@/components/features/discounts/FreeShippingClient';

export default function FreeShippingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <FreeShippingClient />
    </Suspense>
  );
}
