'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Star } from 'lucide-react';

export function GoogleReviewsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-google-reviews'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setEnabled(store.googleCustomerReviewsEnabled === true);
      setMerchantId(store.googleMerchantId || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: (val: boolean) =>
      storeService.updateMyStore({ googleCustomerReviewsEnabled: val }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-google-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Salvo com sucesso!', 'Saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

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
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5">
            <Star className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('Google Avaliações de Clientes', 'Google Customer Reviews')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Colete avaliações pós-compra via Google', 'Collect post-purchase reviews via Google')}
            </p>
          </div>
        </div>
      </div>

      {enabled ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Ativo', 'Active')}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {t('Desativado', 'Disabled')}
          </span>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-5">
        {!merchantId && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="text-sm text-amber-700 dark:text-amber-400">
              {t(
                'Configure o Google Merchant Center primeiro para usar esta funcionalidade.',
                'Set up Google Merchant Center first to use this feature.'
              )}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('Ativar Google Customer Reviews', 'Enable Google Customer Reviews')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                'Exibe o opt-in de avaliação na página de confirmação do pedido',
                'Shows the review opt-in on the order confirmation page'
              )}
            </p>
          </div>
          <button
            onClick={() => {
              const newVal = !enabled;
              setEnabled(newVal);
              saveMutation.mutate(newVal);
            }}
            disabled={saveMutation.isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Como funciona', 'How it works')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('Após a compra, o cliente vê um opt-in para avaliar a experiência', 'After the purchase, the customer sees an opt-in to review the experience')}</li>
          <li>{t('O Google envia um email de pesquisa após a entrega', 'Google sends a survey email after delivery')}</li>
          <li>{t('As avaliações aparecem nos resultados de busca do Google', 'Reviews appear in Google search results')}</li>
          <li>{t('Requer Google Merchant Center configurado', 'Requires Google Merchant Center set up')}</li>
        </ul>
      </div>
    </div>
  );
}
