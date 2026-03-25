import { Suspense } from 'react';
import { SecuritySettingsClient } from '@/components/features/settings/SecuritySettingsClient';

export default function SecurityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <SecuritySettingsClient />
    </Suspense>
  );
}
