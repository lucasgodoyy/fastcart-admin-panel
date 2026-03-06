import { Suspense } from 'react';
import { IntegrationsClient } from '@/components/features/marketing/IntegrationsClient';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <IntegrationsClient />
    </Suspense>
  );
}
