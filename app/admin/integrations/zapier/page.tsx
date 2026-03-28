import { Suspense } from 'react';
import { ZapierClient } from '@/components/features/integrations/ZapierClient';

export const metadata = { title: 'Zapier — Integrações' };

export default function ZapierPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <ZapierClient />
    </Suspense>
  );
}
