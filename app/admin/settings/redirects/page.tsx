import { Suspense } from 'react';
import { RedirectsClient } from '@/components/features/settings/RedirectsClient';

export default function RedirectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <RedirectsClient />
    </Suspense>
  );
}
