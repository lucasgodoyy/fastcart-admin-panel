import { Suspense } from 'react';
import { AccountSettingsClient } from '@/components/features/settings/AccountSettingsClient';

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <AccountSettingsClient />
    </Suspense>
  );
}
