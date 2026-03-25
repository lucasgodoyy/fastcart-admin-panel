'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, Star } from 'lucide-react';

export function EbitClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ebitId, setEbitId] = useState('');
  const [ebitUrl, setEbitUrl] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-ebit'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setEbitId(store.ebitId || '');
      setEbitUrl(store.ebitUrl || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        ebitId: ebitId.trim(),
        ebitUrl: ebitUrl.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-ebit'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Ebit salvo com sucesso!', 'Ebit saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({ ebitId: '', ebitUrl: '' }),
    onSuccess: () => {
      setEbitId('');
      setEbitUrl('');
      queryClient.invalidateQueries({ queryKey: ['my-store-ebit'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Ebit desconectado.', 'Ebit disconnected.'));
    },
  });

  const isConnected = !!store?.ebitId;

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
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2.5">
            <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ebit / Reclame Aqui</h1>
            <p className="text-sm text-muted-foreground">
              {t('Selo de reputação e avaliações pós-compra', 'Reputation badge and post-purchase reviews')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: {store?.ebitId}
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
          <label className="text-sm font-medium" htmlFor="ebit-id">Ebit ID</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('Código identificador da sua loja no Ebit', 'Your store identifier code in Ebit')}
          </p>
          <input
            id="ebit-id"
            type="text"
            value={ebitId}
            onChange={(e) => setEbitId(e.target.value)}
            placeholder="12345"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="ebit-url">
            {t('URL do selo Ebit', 'Ebit badge URL')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('URL do selo fornecida pelo Ebit (opcional)', 'Badge URL provided by Ebit (optional)')}
          </p>
          <input
            id="ebit-url"
            type="url"
            value={ebitUrl}
            onChange={(e) => setEbitUrl(e.target.value)}
            placeholder="https://www.ebit.com.br/..."
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!ebitId.trim() || saveMutation.isPending}
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
          <h3 className="text-sm font-medium">{t('O que o Ebit faz', 'What Ebit does')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('Exibe selo de reputação no rodapé da sua loja', 'Displays reputation badge in your store footer')}</li>
          <li>{t('Envia pesquisa de satisfação pós-compra aos clientes', 'Sends post-purchase satisfaction survey to customers')}</li>
          <li>{t('Aumenta a confiança dos visitantes na sua loja', 'Increases visitor trust in your store')}</li>
        </ul>
      </div>

      <a href="https://www.ebit.com.br/" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Acessar Ebit', 'Go to Ebit')}
      </a>
    </div>
  );
}
