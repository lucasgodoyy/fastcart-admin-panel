import { Suspense } from 'react';
import { BillingClient } from '@/components/features/billing/BillingClient';

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando faturamento...</div>}>
      <BillingClient />
    </Suspense>
  );
}
