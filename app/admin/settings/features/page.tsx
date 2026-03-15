import { Suspense } from 'react';
import { StoreFeaturesClient } from '@/components/features/settings/StoreFeaturesClient';

export default function StoreFeaturesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <StoreFeaturesClient />
    </Suspense>
  );
}
