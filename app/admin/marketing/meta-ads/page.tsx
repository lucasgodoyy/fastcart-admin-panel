import { Suspense } from 'react';
import { MetaAdsClient } from '@/components/features/meta-ads/MetaAdsClient';

export default function MetaAdsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando Meta Ads...</div>}>
      <MetaAdsClient />
    </Suspense>
  );
}
