import { Suspense } from 'react';
import { IntegrationsClient } from '@/components/features/settings/IntegrationsClient';

export default function ShippingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando integrações...</div>}>
      <IntegrationsClient mode="shipping" />
    </Suspense>
  );
}
