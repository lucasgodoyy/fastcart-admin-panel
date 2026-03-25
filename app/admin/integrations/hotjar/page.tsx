import { Suspense } from 'react';
import { HotjarClient } from '@/components/features/integrations/HotjarClient';

export default function HotjarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <HotjarClient />
    </Suspense>
  );
}
