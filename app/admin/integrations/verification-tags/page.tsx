import { Suspense } from 'react';
import { VerificationTagsClient } from '@/components/features/integrations/VerificationTagsClient';

export default function VerificationTagsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <VerificationTagsClient />
    </Suspense>
  );
}
