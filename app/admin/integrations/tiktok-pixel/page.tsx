import { Suspense } from 'react';
import { TikTokPixelClient } from '@/components/features/integrations/TikTokPixelClient';

export default function TikTokPixelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <TikTokPixelClient />
    </Suspense>
  );
}
