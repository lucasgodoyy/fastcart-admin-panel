'use client';

import { IntegrationsSettingsClient } from './IntegrationsSettingsClient';

type IntegrationsClientProps = {
  mode?: 'settings' | 'payments' | 'shipping';
};

export function IntegrationsClient({ mode }: IntegrationsClientProps) {
  return <IntegrationsSettingsClient mode={mode} />;
}
