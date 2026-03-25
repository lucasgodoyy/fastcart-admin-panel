import { Suspense } from 'react';
import { StatisticsShippingClient } from '@/components/features/statistics/StatisticsShippingClient';

export default function StatisticsShippingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <StatisticsShippingClient />
    </Suspense>
  );
}
