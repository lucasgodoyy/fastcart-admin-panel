'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, Facebook, ExternalLink, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function FacebookPixelClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pixelId, setPixelId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-fbpixel'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setPixelId(store.facebookPixelId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (id: string) =>
      storeService.updateMyStore({ facebookPixelId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-fbpixel'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Facebook Pixel salvo com sucesso!', 'Facebook Pixel saved successfully!'));
    },
    onError: () => {
      toast.error(t('Erro ao salvar. Tente novamente.', 'Error saving. Try again.'));
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ facebookPixelId: '' }),
    onSuccess: () => {
      setPixelId('');
      queryClient.invalidateQueries({ queryKey: ['my-store-fbpixel'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Facebook Pixel desconectado.', 'Facebook Pixel disconnected.'));
    },
  });

  const isValid = /^\d{10,20}$/.test(pixelId.trim());
  const isConnected = !!store?.facebookPixelId;

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
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2.5">
            <Facebook className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Facebook Pixel (Meta)</h1>
            <p className="text-sm text-muted-foreground">
              {t('Rastreamento de conversões e remarketing', 'Conversion tracking and remarketing')}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: {store?.facebookPixelId}
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
      <div className="rounded-lg border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium" htmlFor="pixel-id">
            Pixel ID
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em Meta Events Manager → Data Sources → Pixel ID',
              'Find it in Meta Events Manager → Data Sources → Pixel ID'
            )}
          </p>
          <input
            id="pixel-id"
            type="text"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value.replace(/\D/g, ''))}
            placeholder="1234567890123456"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={20}
          />
          {pixelId && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('O Pixel ID deve ter entre 10 e 20 dígitos.', 'Pixel ID must be 10–20 digits.')}
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

      {/* Info box */}
      <div className="rounded-lg border bg-muted/30 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {t('Como funciona', 'How it works')}
          </h3>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
          <li>
            {t(
              'O Facebook Pixel rastreia visitantes e conversões para otimizar seus anúncios no Facebook e Instagram.',
              'The Facebook Pixel tracks visitors and conversions to optimize your Facebook and Instagram ads.'
            )}
          </li>
          <li>
            {t(
              'Eventos PageView são enviados automaticamente em cada página da loja.',
              'PageView events are sent automatically on every store page.'
            )}
          </li>
          <li>
            {t(
              'Use o pixel para criar públicos de remarketing e medir o ROI das suas campanhas.',
              'Use the pixel to create remarketing audiences and measure your campaign ROI.'
            )}
          </li>
          <li>
            {t(
              'Os dados aparecem no Meta Events Manager em até 20 minutos.',
              'Data appears in Meta Events Manager within 20 minutes.'
            )}
          </li>
        </ul>

        <div className="pt-2">
          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {t('Abrir Meta Events Manager', 'Open Meta Events Manager')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Step by step */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">
          {t('Passo a passo', 'Step by step')}
        </h3>
        <ol className="text-xs text-muted-foreground space-y-3 list-decimal ml-5">
          <li>
            {t(
              'Acesse business.facebook.com e crie ou selecione seu Business Manager.',
              'Go to business.facebook.com and create or select your Business Manager.'
            )}
          </li>
          <li>
            {t(
              'No Events Manager, crie um Pixel ou selecione um existente.',
              'In Events Manager, create a Pixel or select an existing one.'
            )}
          </li>
          <li>
            {t(
              'Copie o Pixel ID (número de 15–16 dígitos).',
              'Copy the Pixel ID (15–16 digit number).'
            )}
          </li>
          <li>
            {t(
              'Cole o Pixel ID no campo acima e clique em Salvar.',
              'Paste the Pixel ID in the field above and click Save.'
            )}
          </li>
          <li>
            {t(
              'Use a extensão "Meta Pixel Helper" do Chrome para verificar se está funcionando.',
              'Use the "Meta Pixel Helper" Chrome extension to verify it\'s working.'
            )}
          </li>
        </ol>
      </div>
    </div>
  );
}
