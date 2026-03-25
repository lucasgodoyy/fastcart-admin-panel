'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, Flame } from 'lucide-react';

export function HotjarClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hotjarId, setHotjarId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-hotjar'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setHotjarId(store.hotjarId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (id: string) => storeService.updateMyStore({ hotjarId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-hotjar'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Hotjar salvo com sucesso!', 'Hotjar saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ hotjarId: '' }),
    onSuccess: () => {
      setHotjarId('');
      queryClient.invalidateQueries({ queryKey: ['my-store-hotjar'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Hotjar desconectado.', 'Hotjar disconnected.'));
    },
  });

  const isValid = /^\d{5,10}$/.test(hotjarId.trim());
  const isConnected = !!store?.hotjarId;

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
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2.5">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Hotjar</h1>
            <p className="text-sm text-muted-foreground">
              {t('Mapas de calor e gravações de sessão', 'Heatmaps and session recordings')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')}: Site ID {store?.hotjarId}
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
          <label className="text-sm font-medium" htmlFor="hotjar-id">Site ID</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em insights.hotjar.com → Settings → Sites & Organizations → Site ID',
              'Find at insights.hotjar.com → Settings → Sites & Organizations → Site ID'
            )}
          </p>
          <input
            id="hotjar-id"
            type="text"
            value={hotjarId}
            onChange={(e) => setHotjarId(e.target.value.replace(/\D/g, ''))}
            placeholder="1234567"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={10}
          />
          {hotjarId && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('O Site ID deve conter apenas números (5-10 dígitos).', 'Site ID must contain only numbers (5-10 digits).')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(hotjarId.trim())}
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
          <h3 className="text-sm font-medium">{t('Funcionalidades', 'Features')}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { name: t('Mapas de Calor', 'Heatmaps'), desc: t('Veja onde os usuários clicam', 'See where users click') },
            { name: t('Gravações', 'Recordings'), desc: t('Assista sessões reais', 'Watch real sessions') },
            { name: t('Funis', 'Funnels'), desc: t('Identifique onde perdem interesse', 'Identify drop-off points') },
            { name: t('Feedback', 'Feedback'), desc: t('Colete opiniões dos clientes', 'Collect customer opinions') },
          ].map(({ name, desc }) => (
            <div key={name} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <a href="https://www.hotjar.com/" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Acessar Hotjar', 'Go to Hotjar')}
      </a>
    </div>
  );
}
