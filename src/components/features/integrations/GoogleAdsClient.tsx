'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, TrendingUp } from 'lucide-react';

export function GoogleAdsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adsId, setAdsId] = useState('');
  const [convCheckout, setConvCheckout] = useState('');
  const [convConfirmation, setConvConfirmation] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-google-ads'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setAdsId(store.googleAdsId || '');
      setConvCheckout(store.conversionCodeCheckout || '');
      setConvConfirmation(store.conversionCodeConfirmation || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        googleAdsId: adsId.trim(),
        conversionCodeCheckout: convCheckout.trim(),
        conversionCodeConfirmation: convConfirmation.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-google-ads'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Google Ads salvo com sucesso!', 'Google Ads saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        googleAdsId: '',
        conversionCodeCheckout: '',
        conversionCodeConfirmation: '',
      }),
    onSuccess: () => {
      setAdsId('');
      setConvCheckout('');
      setConvConfirmation('');
      queryClient.invalidateQueries({ queryKey: ['my-store-google-ads'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Google Ads desconectado.', 'Google Ads disconnected.'));
    },
  });

  const isValid = /^AW-[A-Z0-9]{5,15}$/i.test(adsId.trim()) || adsId.trim() === '';
  const isConnected = !!store?.googleAdsId;

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
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/integrations')} className="rounded-lg p-2 hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Google Ads</h1>
            <p className="text-sm text-muted-foreground">
              {t('Rastreamento de conversões e remarketing', 'Conversion tracking and remarketing')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: {store?.googleAdsId}
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

      <div className="rounded-lg border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium" htmlFor="ads-id">Conversion ID</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('Encontre em ads.google.com → Ferramentas → Conversões → Tag settings', 'Find at ads.google.com → Tools → Conversions → Tag settings')}
          </p>
          <input
            id="ads-id"
            type="text"
            value={adsId}
            onChange={(e) => setAdsId(e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase())}
            placeholder="AW-XXXXXXXXX"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={20}
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="conv-checkout">
            {t('Script de Conversão — Checkout', 'Conversion Script — Checkout')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('Script injetado na página de checkout (opcional)', 'Script injected on the checkout page (optional)')}
          </p>
          <textarea
            id="conv-checkout"
            value={convCheckout}
            onChange={(e) => setConvCheckout(e.target.value)}
            placeholder="<!-- Google Ads conversion script -->"
            rows={3}
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="conv-confirmation">
            {t('Script de Conversão — Confirmação', 'Conversion Script — Confirmation')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('Script injetado na página de confirmação do pedido (opcional)', 'Script injected on the order confirmation page (optional)')}
          </p>
          <textarea
            id="conv-confirmation"
            value={convConfirmation}
            onChange={(e) => setConvConfirmation(e.target.value)}
            placeholder="<!-- Google Ads conversion script -->"
            rows={3}
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={(!adsId.trim() && !convCheckout.trim() && !convConfirmation.trim()) || saveMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveMutation.isPending ? t('Salvando...', 'Saving...') : t('Salvar', 'Save')}
          </button>
          {isConnected && (
            <button
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              {t('Desconectar tudo', 'Disconnect all')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Eventos rastreados', 'Tracked events')}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { event: 'page_view', desc: t('Todas as páginas', 'All pages') },
            { event: 'purchase', desc: t('Compra finalizada', 'Purchase completed') },
            { event: 'begin_checkout', desc: t('Início do checkout', 'Checkout started') },
            { event: 'add_to_cart', desc: t('Adição ao carrinho', 'Add to cart') },
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

      <a href="https://ads.google.com/" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Acessar Google Ads', 'Go to Google Ads')}
      </a>
    </div>
  );
}
