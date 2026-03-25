import { Suspense } from 'react';
import { TikTokShopClient } from '@/components/features/tiktok-shop/TikTokShopClient';

export default function TikTokShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando TikTok Shop...</div>}>
      <TikTokShopClient />
    </Suspense>
  );
}
