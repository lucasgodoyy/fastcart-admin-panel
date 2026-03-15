import { Suspense } from 'react';
import { IntegrationsListClient } from '@/components/features/integrations/IntegrationsListClient';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando integrações...</div>}>
      <IntegrationsListClient />
    </Suspense>
  );
}
