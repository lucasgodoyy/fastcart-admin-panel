import { Suspense } from 'react';
import { GtmClient } from '@/components/features/integrations/GtmClient';

export default function GtmPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <GtmClient />
    </Suspense>
  );
}
