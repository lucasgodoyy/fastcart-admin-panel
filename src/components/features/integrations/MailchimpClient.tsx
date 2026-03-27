'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, Mail } from 'lucide-react';

export function MailchimpClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState('');
  const [listId, setListId] = useState('');
  const [server, setServer] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-mailchimp'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setApiKey(store.mailchimpApiKey || '');
      setListId(store.mailchimpListId || '');
      setServer(store.mailchimpServer || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  // Auto-extract server prefix from API key (format: xxx-us21)
  useEffect(() => {
    const match = apiKey.match(/-([a-z]+\d+)$/);
    if (match) setServer(match[1]);
  }, [apiKey]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        mailchimpApiKey: apiKey.trim(),
        mailchimpListId: listId.trim(),
        mailchimpServer: server.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-mailchimp'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Mailchimp salvo com sucesso!', 'Mailchimp saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        mailchimpApiKey: '',
        mailchimpListId: '',
        mailchimpServer: '',
      }),
    onSuccess: () => {
      setApiKey('');
      setListId('');
      setServer('');
      queryClient.invalidateQueries({ queryKey: ['my-store-mailchimp'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Mailchimp desconectado.', 'Mailchimp disconnected.'));
    },
  });

  const isValid = apiKey.trim().length > 10 && listId.trim().length > 0 && server.trim().length > 0;
  const isConnected = !!store?.mailchimpApiKey;

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
          <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-2.5">
            <Mail className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Mailchimp</h1>
            <p className="text-sm text-muted-foreground">
              {t('Email marketing e automação', 'Email marketing and automation')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Conectado', 'Connected')} — Server: {store?.mailchimpServer}
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
          <label className="text-sm font-medium" htmlFor="mc-api-key">API Key</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em mailchimp.com → Account → Extras → API keys',
              'Find at mailchimp.com → Account → Extras → API keys'
            )}
          </p>
          <input
            id="mc-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="xxxxxxxxxx-us21"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="mc-list-id">Audience / List ID</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Encontre em Audience → Settings → Audience name and defaults → Audience ID',
              'Find at Audience → Settings → Audience name and defaults → Audience ID'
            )}
          </p>
          <input
            id="mc-list-id"
            type="text"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            placeholder="abc1234def"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="mc-server">
            {t('Server Prefix', 'Server Prefix')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('Extraído automaticamente da API Key (ex: us21)', 'Auto-extracted from API Key (e.g. us21)')}
          </p>
          <input
            id="mc-server"
            type="text"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="us21"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={10}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate()}
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
          <h3 className="text-sm font-medium">{t('O que será sincronizado', 'What will be synced')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('Novos clientes adicionados à lista escolhida', 'New customers added to the chosen list')}</li>
          <li>{t('Email, nome e dados básicos sincronizados', 'Email, name, and basic data synced')}</li>
          <li>{t('Use automações no Mailchimp para enviar campanhas', 'Use Mailchimp automations to send campaigns')}</li>
        </ul>
      </div>

      <a href="https://mailchimp.com/" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ExternalLink className="h-3.5 w-3.5" />
        {t('Acessar Mailchimp', 'Go to Mailchimp')}
      </a>
    </div>
  );
}
