import { Suspense } from 'react';
import { FacebookPixelClient } from '@/components/features/integrations/FacebookPixelClient';

export default function FacebookPixelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <FacebookPixelClient />
    </Suspense>
  );
}
