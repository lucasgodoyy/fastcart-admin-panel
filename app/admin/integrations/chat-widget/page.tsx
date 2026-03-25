import { Suspense } from 'react';
import { ChatWidgetClient } from '@/components/features/integrations/ChatWidgetClient';

export default function ChatWidgetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <ChatWidgetClient />
    </Suspense>
  );
}
