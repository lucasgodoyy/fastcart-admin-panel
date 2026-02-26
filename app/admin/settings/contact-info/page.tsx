import { Suspense } from 'react';
import { ContactInfoClient } from '@/components/features/settings/ContactInfoClient';

export default function ContactInfoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <ContactInfoClient />
    </Suspense>
  );
}
