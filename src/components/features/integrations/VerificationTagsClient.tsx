'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Info, Search } from 'lucide-react';

export function VerificationTagsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [googleTag, setGoogleTag] = useState('');
  const [bingTag, setBingTag] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-verification'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setGoogleTag(store.googleVerificationTag || '');
      setBingTag(store.bingVerificationTag || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        googleVerificationTag: googleTag.trim(),
        bingVerificationTag: bingTag.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-verification'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Tags salvas com sucesso!', 'Tags saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        googleVerificationTag: '',
        bingVerificationTag: '',
      }),
    onSuccess: () => {
      setGoogleTag('');
      setBingTag('');
      queryClient.invalidateQueries({ queryKey: ['my-store-verification'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Tags removidas.', 'Tags removed.'));
    },
  });

  const isConnected = !!store?.googleVerificationTag || !!store?.bingVerificationTag;

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
            <Search className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('Tags de Verificação', 'Verification Tags')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Verifique seu site no Google e Bing para SEO', 'Verify your site on Google and Bing for SEO')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {store?.googleVerificationTag && 'Google '}
            {store?.googleVerificationTag && store?.bingVerificationTag && '+ '}
            {store?.bingVerificationTag && 'Bing '}
            {t('verificado', 'verified')}
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
          <label className="text-sm font-medium" htmlFor="google-tag">Google Search Console</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Copie o conteúdo da meta tag de verificação do Google Search Console',
              'Copy the content of the verification meta tag from Google Search Console'
            )}
          </p>
          <input
            id="google-tag"
            type="text"
            value={googleTag}
            onChange={(e) => setGoogleTag(e.target.value)}
            placeholder="google-site-verification=xxxxxxxxxxxxx"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="bing-tag">Bing Webmaster Tools</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Copie o conteúdo da meta tag de verificação do Bing Webmaster Tools',
              'Copy the content of the verification meta tag from Bing Webmaster Tools'
            )}
          </p>
          <input
            id="bing-tag"
            type="text"
            value={bingTag}
            onChange={(e) => setBingTag(e.target.value)}
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={(!googleTag.trim() && !bingTag.trim()) || saveMutation.isPending}
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
              {t('Remover todas', 'Remove all')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Como verificar', 'How to verify')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('Acesse o painel do mecanismo de busca (Google Search Console ou Bing Webmaster Tools)', 'Go to the search engine panel (Google Search Console or Bing Webmaster Tools)')}</li>
          <li>{t('Escolha o método "HTML tag" (meta tag)', 'Choose the "HTML tag" (meta tag) method')}</li>
          <li>{t('Copie apenas o valor do atributo content e cole aqui', 'Copy only the content attribute value and paste here')}</li>
          <li>{t('Após salvar, volte ao painel e clique em "Verificar"', 'After saving, go back to the panel and click "Verify"')}</li>
        </ul>
      </div>
    </div>
  );
}
