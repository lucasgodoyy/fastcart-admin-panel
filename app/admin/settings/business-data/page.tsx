import { Suspense } from 'react';
import { BusinessDataClient } from '@/components/features/settings/BusinessDataClient';

export default function BusinessDataPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <BusinessDataClient />
    </Suspense>
  );
}
