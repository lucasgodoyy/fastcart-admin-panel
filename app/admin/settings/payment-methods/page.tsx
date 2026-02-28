import { Suspense } from 'react';
import { PaymentMethodsClient } from '@/components/features/settings/PaymentMethodsClient';

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <PaymentMethodsClient />
    </Suspense>
  );
}
