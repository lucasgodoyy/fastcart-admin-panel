import { Suspense } from 'react';
import { DistributionCentersClient } from '@/components/features/settings/DistributionCentersClient';

export default function DistributionCentersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <DistributionCentersClient />
    </Suspense>
  );
}
