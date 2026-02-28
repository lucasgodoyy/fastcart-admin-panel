import { Suspense } from 'react';
import { UsersClient } from '@/components/features/settings/UsersClient';

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <UsersClient />
    </Suspense>
  );
}
