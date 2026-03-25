import { Suspense } from 'react';
import { MailchimpClient } from '@/components/features/integrations/MailchimpClient';

export default function MailchimpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <MailchimpClient />
    </Suspense>
  );
}
