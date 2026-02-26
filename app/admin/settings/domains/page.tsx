import { Suspense } from 'react';
import { DomainsClient } from '@/components/features/settings/DomainsClient';

export default function DomainsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <DomainsClient />
    </Suspense>
  );
}
