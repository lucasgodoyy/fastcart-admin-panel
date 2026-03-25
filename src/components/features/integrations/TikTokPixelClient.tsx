'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function TikTokPixelClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pixelId, setPixelId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-tiktokpixel'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setPixelId(store.tiktokPixelId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (id: string) =>
      storeService.updateMyStore({ tiktokPixelId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-tiktokpixel'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('TikTok Pixel salvo com sucesso!', 'TikTok Pixel saved successfully!'));
    },
    onError: () => {
      toast.error(t('Erro ao salvar. Tente novamente.', 'Error saving. Try again.'));
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ tiktokPixelId: '' }),
    onSuccess: () => {
      setPixelId('');
      queryClient.invalidateQueries({ queryKey: ['my-store-tiktokpixel'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('TikTok Pixel desconectado.', 'TikTok Pixel disconnected.'));
    },
  });

  const isValid = /^[A-Z0-9]{5,30}$/i.test(pixelId.trim());
  const isConnected = !!store?.tiktokPixelId;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/integrations')}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-zinc-900 dark:bg-zinc-100 p-2.5">
            <svg className="h-6 w-6 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.19a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.62z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">TikTok Pixel</h1>
            <p className="text-sm text-muted-foreground">
              {t('Rastreamento de conversões e público personalizado', 'Conversion tracking and custom audiences')}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: {store?.tiktokPixelId}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {t('Não configurado', 'Not configured')}
          </span>
        </div>
      )}

      {/* Form */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium" htmlFor="tiktok-pixel-id">
            Pixel ID
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em TikTok Ads Manager → Assets → Events → Web Events → Pixel ID',
              'Find it in TikTok Ads Manager → Assets → Events → Web Events → Pixel ID'
            )}
          </p>
          <input
            id="tiktok-pixel-id"
            type="text"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
            placeholder="CXXXXXXXXX"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={30}
          />
          {pixelId && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('O Pixel ID deve ter entre 5 e 30 caracteres alfanuméricos.', 'Pixel ID must be 5–30 alphanumeric characters.')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(pixelId.trim())}
            disabled={!isValid || saveMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveMutation.isPending
              ? t('Salvando...', 'Saving...')
              : t('Salvar', 'Save')}
          </button>
          {isConnected && (
            <button
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              {t('Desconectar', 'Disconnect')}
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Eventos rastreados automaticamente', 'Auto-tracked events')}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { event: 'PageView', desc: t('Visualização de página', 'Page view') },
            { event: 'ViewContent', desc: t('Visualização de produto', 'Product view') },
            { event: 'AddToCart', desc: t('Adição ao carrinho', 'Add to cart') },
            { event: 'InitiateCheckout', desc: t('Início do checkout', 'Checkout initiation') },
            { event: 'CompletePayment', desc: t('Pagamento concluído', 'Payment completed') },
          ].map(({ event, desc }) => (
            <div key={event} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-medium font-mono">{event}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Docs Link */}
      <a
        href="https://ads.tiktok.com/help/article/get-started-pixel"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Documentação TikTok Pixel', 'TikTok Pixel Documentation')}
      </a>
    </div>
  );
}
