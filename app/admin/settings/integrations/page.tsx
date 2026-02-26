import { Suspense } from 'react';
import { IntegrationsSettingsClient } from '@/components/features/settings/IntegrationsSettingsClient';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <IntegrationsSettingsClient />
    </Suspense>
  );
}
