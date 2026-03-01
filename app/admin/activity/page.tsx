import { Suspense } from 'react';
import { ActivityClient } from '@/components/features/activity/ActivityClient';

export default function AdminActivityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando atividades...</div>}>
      <ActivityClient />
    </Suspense>
  );
}
