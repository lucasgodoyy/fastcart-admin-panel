import { Suspense } from 'react';
import { SettingsClient } from '@/components/features/settings/SettingsClient';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando configurações...</div>}>
      <SettingsClient />
    </Suspense>
  );
}
