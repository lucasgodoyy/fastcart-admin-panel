import { Suspense } from 'react';
import { GoogleMerchantClient } from '@/components/features/integrations/GoogleMerchantClient';

export default function GoogleMerchantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <GoogleMerchantClient />
    </Suspense>
  );
}
