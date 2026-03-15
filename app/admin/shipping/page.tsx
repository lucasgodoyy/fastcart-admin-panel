import { Suspense } from 'react';
import { Truck } from 'lucide-react';
import { IntegrationsClient } from '@/components/features/settings/IntegrationsClient';
import { ShippingLabelsClient } from '@/components/features/shipping/ShippingLabelsClient';

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Logística</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie integrações de frete e etiquetas de envio.</p>
      </div>

      {/* Connection card (compact) */}
      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg border border-border bg-muted/20" />}>
        <IntegrationsClient mode="shipping" />
      </Suspense>

      {/* Labels management */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg border border-border bg-muted/20" />}>
        <ShippingLabelsClient />
      </Suspense>
    </div>
  );
}
