import { Suspense } from 'react';
import { ProductOrganizeClient } from '@/components/features/products/ProductOrganizeClient';

export default function ProductOrganizePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <ProductOrganizeClient />
    </Suspense>
  );
}
