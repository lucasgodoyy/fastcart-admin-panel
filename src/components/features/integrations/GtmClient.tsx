'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, Tag } from 'lucide-react';

export function GtmClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gtmId, setGtmId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-gtm'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setGtmId(store.gtmId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (id: string) => storeService.updateMyStore({ gtmId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-gtm'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('GTM salvo com sucesso!', 'GTM saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ gtmId: '' }),
    onSuccess: () => {
      setGtmId('');
      queryClient.invalidateQueries({ queryKey: ['my-store-gtm'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('GTM desconectado.', 'GTM disconnected.'));
    },
  });

  const isValid = /^GTM-[A-Z0-9]{4,10}$/i.test(gtmId.trim());
  const isConnected = !!store?.gtmId;

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
            <Tag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Google Tag Manager</h1>
            <p className="text-sm text-muted-foreground">
              {t('Gerencie todas as tags da sua loja em um único lugar', 'Manage all your store tags in one place')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: {store?.gtmId}
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
          <label className="text-sm font-medium" htmlFor="gtm-id">Container ID</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em tagmanager.google.com → Workspace → Container ID (GTM-XXXXXXX)',
              'Find at tagmanager.google.com → Workspace → Container ID (GTM-XXXXXXX)'
            )}
          </p>
          <input
            id="gtm-id"
            type="text"
            value={gtmId}
            onChange={(e) => setGtmId(e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase())}
            placeholder="GTM-XXXXXXX"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={15}
          />
          {gtmId && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('Formato: GTM-XXXXXXX', 'Format: GTM-XXXXXXX')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(gtmId.trim())}
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

      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Como funciona', 'How it works')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('O script do GTM será adicionado automaticamente ao &lt;head&gt; da sua loja', 'The GTM script will be automatically added to your store &lt;head&gt;')}</li>
          <li>{t('Use o GTM para gerenciar GA4, Pixel do Facebook, Google Ads, etc.', 'Use GTM to manage GA4, Facebook Pixel, Google Ads, etc.')}</li>
          <li>{t('Recomendado se você usa muitas tags de marketing diferentes', 'Recommended if you use many different marketing tags')}</li>
        </ul>
      </div>

      <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Acessar Google Tag Manager', 'Go to Google Tag Manager')}
      </a>
    </div>
  );
}
