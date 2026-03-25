import { Suspense } from 'react';
import { ConversionCodesClient } from '@/components/features/integrations/ConversionCodesClient';

export default function ConversionCodesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <ConversionCodesClient />
    </Suspense>
  );
}
