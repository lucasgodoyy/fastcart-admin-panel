'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Code } from 'lucide-react';

export function ConversionCodesClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [checkout, setCheckout] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-conversion-codes'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setCheckout(store.conversionCodeCheckout || '');
      setConfirmation(store.conversionCodeConfirmation || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        conversionCodeCheckout: checkout.trim(),
        conversionCodeConfirmation: confirmation.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-conversion-codes'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Códigos salvos com sucesso!', 'Codes saved successfully!'));
    },
    onError: () => toast.error(t('Erro ao salvar.', 'Error saving.')),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      storeService.updateMyStore({
        conversionCodeCheckout: '',
        conversionCodeConfirmation: '',
      }),
    onSuccess: () => {
      setCheckout('');
      setConfirmation('');
      queryClient.invalidateQueries({ queryKey: ['my-store-conversion-codes'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Códigos removidos.', 'Codes removed.'));
    },
  });

  const isConnected = !!store?.conversionCodeCheckout || !!store?.conversionCodeConfirmation;

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
          <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2.5">
            <Code className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t('Códigos de Conversão', 'Conversion Codes')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Scripts customizados no checkout e confirmação', 'Custom scripts on checkout and confirmation')}
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {t('Configurado', 'Configured')}
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
          <label className="text-sm font-medium" htmlFor="conv-checkout">
            {t('Script — Página de Checkout', 'Script — Checkout Page')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Este código será injetado na página de checkout (início do pagamento).',
              'This code will be injected on the checkout page (payment start).'
            )}
          </p>
          <textarea
            id="conv-checkout"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            placeholder={'<!-- Conversion script for checkout page -->\n<script>...</script>'}
            rows={5}
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="conv-confirmation">
            {t('Script — Página de Confirmação', 'Script — Confirmation Page')}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              'Este código será injetado na página de confirmação do pedido (pós-compra).',
              'This code will be injected on the order confirmation page (post-purchase).'
            )}
          </p>
          <textarea
            id="conv-confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={'<!-- Conversion script for thank-you page -->\n<script>...</script>'}
            rows={5}
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={(!checkout.trim() && !confirmation.trim()) || saveMutation.isPending}
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
              {t('Remover tudo', 'Remove all')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">{t('Quando usar', 'When to use')}</h3>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
          <li>{t('Google Ads: tag de conversão para rastrear compras', 'Google Ads: conversion tag to track purchases')}</li>
          <li>{t('Facebook CAPI: eventos server-side de compra', 'Facebook CAPI: server-side purchase events')}</li>
          <li>{t('Qualquer serviço que exija um script na página de checkout ou confirmação', 'Any service requiring a script on checkout or confirmation page')}</li>
        </ul>
      </div>
    </div>
  );
}
