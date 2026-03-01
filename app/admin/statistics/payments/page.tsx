import { Suspense } from 'react';
import { StatisticsPaymentsClient } from '@/components/features/statistics/StatisticsPaymentsClient';

export default function StatisticsPaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <StatisticsPaymentsClient />
    </Suspense>
  );
}
