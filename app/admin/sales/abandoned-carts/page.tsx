import { Suspense } from 'react';
import { AbandonedCartsClient } from '@/components/features/sales/AbandonedCartsClient';

export default function AbandonedCartsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <AbandonedCartsClient />
    </Suspense>
  );
}
