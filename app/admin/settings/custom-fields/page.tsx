import { Suspense } from 'react';
import { CustomFieldsClient } from '@/components/features/settings/CustomFieldsClient';

export default function CustomFieldsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <CustomFieldsClient />
    </Suspense>
  );
}
