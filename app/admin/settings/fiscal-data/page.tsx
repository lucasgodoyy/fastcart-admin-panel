import { Suspense } from 'react';
import { FiscalDataClient } from '@/components/features/settings/FiscalDataClient';

export default function FiscalDataPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <FiscalDataClient />
    </Suspense>
  );
}
