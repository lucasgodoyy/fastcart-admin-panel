import { Suspense } from 'react';
import { GoogleReviewsClient } from '@/components/features/integrations/GoogleReviewsClient';

export default function GoogleReviewsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <GoogleReviewsClient />
    </Suspense>
  );
}
