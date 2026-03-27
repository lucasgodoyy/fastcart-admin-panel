import { Suspense } from 'react';
import { TutorialsClient } from '@/components/features/tutorials/TutorialsClient';

export default function TutorialsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando tutoriais...</div>}>
      <TutorialsClient />
    </Suspense>
  );
}
