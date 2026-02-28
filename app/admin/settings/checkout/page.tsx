import { Suspense } from 'react';
import { CheckoutClient } from '@/components/features/settings/CheckoutClient';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
