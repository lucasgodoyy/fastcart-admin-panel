'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, MessageSquare } from 'lucide-react';

export function ChatWidgetClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [script, setScript] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-chat'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setScript(store.externalChatScript || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (val: string) => storeService.updateMyStore({ externalChatScript: val }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-chat'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Widget salvo com sucesso!', 'Widget saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ externalChatScript: '' }),
    onSuccess: () => {
      setScript('');
      queryClient.invalidateQueries({ queryKey: ['my-store-chat'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Widget removido.', 'Widget removed.'));
    },
  });

  const isConnected = !!store?.externalChatScript;

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
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2.5">
            <MessageSquare className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t('Chat / Widget Externo', 'External Chat / Widget')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Tawk.to, Crisp, JivoChat, Tidio e outros', 'Tawk.to, Crisp, JivoChat, Tidio and others')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Widget ativo', 'Widget active')}
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
          <label className="text-sm font-medium" htmlFor="chat-script">
            {t('Script do widget', 'Widget script')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Cole aqui o código JavaScript fornecido pelo serviço de chat. Ele será adicionado ao rodapé da loja.',
              'Paste the JavaScript code provided by the chat service. It will be added to your store footer.'
            )}
          </p>
          <textarea
            id="chat-script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder={'<!-- Tawk.to / Crisp / JivoChat script -->\n<script>...</script>'}
            rows={8}
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(script.trim())}
            disabled={!script.trim() || saveMutation.isPending}
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
              {t('Remover', 'Remove')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Serviços compatíveis', 'Compatible services')}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {['Tawk.to', 'Crisp', 'JivoChat', 'Tidio', 'Zendesk Chat', 'Intercom'].map((name) => (
            <div key={name} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <p className="text-xs font-medium">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
