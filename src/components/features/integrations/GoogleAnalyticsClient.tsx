'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, BarChart3, ExternalLink, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function GoogleAnalyticsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [measurementId, setMeasurementId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-ga'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setMeasurementId(store.googleAnalyticsId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (gaId: string) =>
      storeService.updateMyStore({ googleAnalyticsId: gaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-ga'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Google Analytics salvo com sucesso!', 'Google Analytics saved successfully!'));
    },
    onError: () => {
      toast.error(t('Erro ao salvar. Tente novamente.', 'Error saving. Try again.'));
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ googleAnalyticsId: '' }),
    onSuccess: () => {
      setMeasurementId('');
      queryClient.invalidateQueries({ queryKey: ['my-store-ga'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Google Analytics desconectado.', 'Google Analytics disconnected.'));
    },
  });

  const isValid = /^G-[A-Z0-9]{4,}$/i.test(measurementId.trim());
  const isConnected = !!store?.googleAnalyticsId;

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
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-2.5">
            <BarChart3 className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Google Analytics 4</h1>
            <p className="text-sm text-muted-foreground">
              {t('Rastreamento de visitantes e conversões', 'Visitor and conversion tracking')}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: {store?.googleAnalyticsId}
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
          <label className="text-sm font-medium" htmlFor="ga-id">
            Measurement ID (GA4)
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em Google Analytics → Admin → Data Streams → Measurement ID',
              'Find it in Google Analytics → Admin → Data Streams → Measurement ID'
            )}
          </p>
          <input
            id="ga-id"
            type="text"
            value={measurementId}
            onChange={(e) => setMeasurementId(e.target.value.toUpperCase())}
            placeholder="G-XXXXXXXXXX"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={20}
          />
          {measurementId && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('Formato inválido. Use G-XXXXXXXXXX', 'Invalid format. Use G-XXXXXXXXXX')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(measurementId.trim())}
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

      {/* Info box */}
      <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {t('Como funciona', 'How it works')}
          </h3>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
          <li>
            {t(
              'O Google Analytics 4 rastreia visitantes, pageviews e conversões automaticamente em sua loja.',
              'Google Analytics 4 tracks visitors, pageviews, and conversions automatically in your store.'
            )}
          </li>
          <li>
            {t(
              'O rastreamento é por domínio — cada loja com subdomínio próprio tem dados separados.',
              'Tracking is per domain — each store with its own subdomain has separate data.'
            )}
          </li>
          <li>
            {t(
              'Após salvar, o script gtag.js será injetado automaticamente em todas as páginas da sua loja.',
              'After saving, the gtag.js script will be automatically injected into all pages of your store.'
            )}
          </li>
          <li>
            {t(
              'Os dados aparecem no seu painel do Google Analytics em até 24h.',
              'Data appears in your Google Analytics dashboard within 24h.'
            )}
          </li>
        </ul>

        <div className="pt-2">
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {t('Abrir Google Analytics', 'Open Google Analytics')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Step by step */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">
          {t('Passo a passo', 'Step by step')}
        </h3>
        <ol className="text-xs text-muted-foreground space-y-3 list-decimal ml-5">
          <li>
            {t(
              'Acesse analytics.google.com e crie uma conta (ou use uma existente).',
              'Go to analytics.google.com and create an account (or use an existing one).'
            )}
          </li>
          <li>
            {t(
              'Crie uma propriedade GA4 para o domínio da sua loja (ex: minhaloja.rapidocart.com.br).',
              'Create a GA4 property for your store domain (e.g., mystore.rapidocart.com.br).'
            )}
          </li>
          <li>
            {t(
              'Em Admin → Data Streams, crie um Web stream e copie o Measurement ID (G-XXXXXXXX).',
              'In Admin → Data Streams, create a Web stream and copy the Measurement ID (G-XXXXXXXX).'
            )}
          </li>
          <li>
            {t(
              'Cole o Measurement ID no campo acima e clique em Salvar.',
              'Paste the Measurement ID in the field above and click Save.'
            )}
          </li>
          <li>
            {t(
              'Pronto! O rastreamento começará automaticamente na próxima visita à sua loja.',
              'Done! Tracking will start automatically on the next visit to your store.'
            )}
          </li>
        </ol>
      </div>
    </div>
  );
}
