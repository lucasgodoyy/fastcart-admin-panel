import { Suspense } from 'react';
import { ProductStatsClient } from '@/components/features/statistics/ProductStatsClient';

export default function StatisticsProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando estatísticas de produtos...</div>}>
      <ProductStatsClient />
    </Suspense>
  );
}
