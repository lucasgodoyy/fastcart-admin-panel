import { Suspense } from 'react';
import { TutorialsCategoryClient } from '@/components/features/tutorials/TutorialsCategoryClient';

export default function TutorialsOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <TutorialsCategoryClient category="orders" />
    </Suspense>
  );
}
