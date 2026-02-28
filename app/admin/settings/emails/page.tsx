import { Suspense } from 'react';
import { EmailsClient } from '@/components/features/settings/EmailsClient';

export default function EmailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <EmailsClient />
    </Suspense>
  );
}
