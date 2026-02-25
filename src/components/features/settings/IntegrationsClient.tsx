'use client';

import { SettingsClient } from '@/components/features/settings/SettingsClient';

type IntegrationsClientProps = {
  mode?: 'settings' | 'payments' | 'shipping';
};

export function IntegrationsClient(_: IntegrationsClientProps) {
  return <SettingsClient />;
}
