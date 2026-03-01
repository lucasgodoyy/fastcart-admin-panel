import { Suspense } from 'react';
import { FinanceClient } from '@/components/features/finance/FinanceClient';

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando financeiro...</div>}>
      <FinanceClient />
    </Suspense>
  );
}
