import { Suspense } from 'react';
import { StatisticsOverviewClient } from '@/components/features/statistics/StatisticsOverviewClient';

export default function StatisticsOverviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando estatísticas...</div>}>
      <StatisticsOverviewClient />
    </Suspense>
  );
}
