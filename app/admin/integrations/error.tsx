'use client';

import { AdminSectionError } from '@/components/shared/AdminSectionError';

export default function IntegrationsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AdminSectionError error={error} reset={reset} section="Integrações" />;
}
