import { Suspense } from 'react';
import { MarketingClient } from '@/components/features/marketing/MarketingClient';

export default function MarketingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <MarketingClient />
    </Suspense>
  );
}
