import { Suspense } from 'react';
import { GoogleAnalyticsClient } from '@/components/features/integrations/GoogleAnalyticsClient';

export default function GoogleAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <GoogleAnalyticsClient />
    </Suspense>
  );
}
