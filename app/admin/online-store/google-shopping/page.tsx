import { Suspense } from 'react';
import { GoogleShoppingClient } from '@/components/features/google-shopping/GoogleShoppingClient';

export default function GoogleShoppingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando Google Shopping...</div>}>
      <GoogleShoppingClient />
    </Suspense>
  );
}
