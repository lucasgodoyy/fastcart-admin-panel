import { Suspense } from 'react';
import { NotificationsSettingsClient } from '@/components/features/settings/NotificationsSettingsClient';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <NotificationsSettingsClient />
    </Suspense>
  );
}
