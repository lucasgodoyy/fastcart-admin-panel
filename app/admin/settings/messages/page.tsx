import { Suspense } from 'react';
import { MessagesClient } from '@/components/features/settings/MessagesClient';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <MessagesClient />
    </Suspense>
  );
}
