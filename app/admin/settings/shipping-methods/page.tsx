import { Suspense } from 'react';
import { ShippingMethodsClient } from '@/components/features/settings/ShippingMethodsClient';

export default function ShippingMethodsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <ShippingMethodsClient />
    </Suspense>
  );
}
