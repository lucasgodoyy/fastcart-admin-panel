import { Suspense } from 'react';
import { IntegrationsClient } from '@/components/features/settings/IntegrationsClient';
import { ShippingLabelsClient } from '@/components/features/shipping/ShippingLabelsClient';

export default function ShippingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando integrações...</div>}>
      <div className="space-y-6">
        <IntegrationsClient mode="shipping" />
        <ShippingLabelsClient />
      </div>
    </Suspense>
  );
}
