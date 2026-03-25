'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, TrendingUp } from 'lucide-react';

export function GoogleMerchantClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [merchantId, setMerchantId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-merchant'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setMerchantId(store.googleMerchantId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (id: string) => storeService.updateMyStore({ googleMerchantId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-merchant'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Google Merchant Center salvo!', 'Google Merchant Center saved!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ googleMerchantId: '' }),
    onSuccess: () => {
      setMerchantId('');
      queryClient.invalidateQueries({ queryKey: ['my-store-merchant'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Google Merchant Center desconectado.', 'Google Merchant Center disconnected.'));
    },
  });

  const isValid = /^\d{5,15}$/.test(merchantId.trim());
  const isConnected = !!store?.googleMerchantId;

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
          <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2.5">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Google Merchant Center</h1>
            <p className="text-sm text-muted-foreground">
              {t('Exiba seus produtos no Google Shopping', 'Display your products on Google Shopping')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: Merchant ID {store?.googleMerchantId}
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

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium" htmlFor="merchant-id">Merchant Center ID</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em merchants.google.com → canto superior direito → ID da conta',
              'Find at merchants.google.com → top right corner → Account ID'
            )}
          </p>
          <input
            id="merchant-id"
            type="text"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value.replace(/\D/g, ''))}
            placeholder="123456789"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={15}
          />
          {merchantId && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('O Merchant ID deve ter entre 5 e 15 dígitos.', 'Merchant ID must be 5–15 digits.')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(merchantId.trim())}
            disabled={!isValid || saveMutation.isPending}
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
              {t('Desconectar', 'Disconnect')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Como funciona', 'How it works')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('O feed de produtos XML será gerado automaticamente em /api/v1/public/stores/{slug}/feed/google', 'Product XML feed will be auto-generated at /api/v1/public/stores/{slug}/feed/google')}</li>
          <li>{t('Configure a URL do feed no Merchant Center', 'Set the feed URL in Merchant Center')}</li>
          <li>{t('Vincule ao Google Ads para exibir nos resultados de compras', 'Link to Google Ads to show in shopping results')}</li>
        </ul>
      </div>

      <a href="https://merchants.google.com/" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Acessar Google Merchant Center', 'Go to Google Merchant Center')}
      </a>
    </div>
  );
}
