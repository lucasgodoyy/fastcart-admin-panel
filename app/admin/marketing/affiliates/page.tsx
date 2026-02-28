import { Suspense } from 'react';
import { AffiliatesClient } from '@/components/features/marketing/AffiliatesClient';

export default function AffiliatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <AffiliatesClient />
    </Suspense>
  );
}
