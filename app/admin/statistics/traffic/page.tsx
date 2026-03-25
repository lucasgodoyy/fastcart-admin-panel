import { Suspense } from 'react';
import { StatisticsTrafficClient } from '@/components/features/statistics/StatisticsTrafficClient';

export default function StatisticsTrafficPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <StatisticsTrafficClient />
    </Suspense>
  );
}
