import { Suspense } from 'react';
import { BillingClient } from '@/components/features/billing/BillingClient';

export default function BillingPage() {
  return (
    <Suspense>
      <BillingClient />
    </Suspense>
  );
}
