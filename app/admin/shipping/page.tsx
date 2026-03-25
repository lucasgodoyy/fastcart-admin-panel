import { Truck } from 'lucide-react';
import { ShippingHubClient } from '@/components/features/shipping/ShippingHubClient';

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Logística</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure provedores de frete, métodos personalizados e gerencie etiquetas.
        </p>
      </div>

      <ShippingHubClient />
    </div>
  );
}

