import { Suspense } from 'react';
import { EbitClient } from '@/components/features/integrations/EbitClient';

export default function EbitPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <EbitClient />
    </Suspense>
  );
}
