import { Suspense } from 'react';
import { GoogleAdsClient } from '@/components/features/integrations/GoogleAdsClient';

export default function GoogleAdsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <GoogleAdsClient />
    </Suspense>
  );
}
