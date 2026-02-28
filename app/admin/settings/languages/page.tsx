import { Suspense } from 'react';
import { LanguagesClient } from '@/components/features/settings/LanguagesClient';

export default function LanguagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <LanguagesClient />
    </Suspense>
  );
}
