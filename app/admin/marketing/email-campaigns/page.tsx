import { Suspense } from 'react';
import { EmailCampaignsClient } from '@/components/features/email-campaigns/EmailCampaignsClient';

export default function EmailCampaignsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <EmailCampaignsClient />
    </Suspense>
  );
}
