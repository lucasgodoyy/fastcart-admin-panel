'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageCircle, CreditCard, ShoppingBag, DollarSign } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';

export function StoreFeaturesClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState({
    whatsappEnabled: false,
    whatsappNumber: '',
    whatsappMessage: '',
    messengerEnabled: false,
    messengerUrl: '',
    cashOnDeliveryEnabled: false,
    manualPaymentEnabled: false,
    manualPaymentLabel: '',
    manualPaymentInstructions: '',
    minOrderValue: '',
    catalogMode: false,
  });

  useEffect(() => {
    if (store) {
      setForm({
        whatsappEnabled: store.whatsappEnabled ?? false,
        whatsappNumber: store.whatsappNumber ?? '',
        whatsappMessage: store.whatsappMessage ?? '',
        messengerEnabled: store.messengerEnabled ?? false,
        messengerUrl: store.messengerUrl ?? '',
        cashOnDeliveryEnabled: store.cashOnDeliveryEnabled ?? false,
        manualPaymentEnabled: store.manualPaymentEnabled ?? false,
        manualPaymentLabel: store.manualPaymentLabel ?? '',
        manualPaymentInstructions: store.manualPaymentInstructions ?? '',
        minOrderValue: store.minOrderValue != null ? String(store.minOrderValue) : '',
        catalogMode: store.catalogMode ?? false,
      });
    }
  }, [store]);

  const mutation = useMutation({
    mutationFn: () =>
      storeSettingsService.updateMyStore({
        whatsappEnabled: form.whatsappEnabled,
        whatsappNumber: form.whatsappNumber || undefined,
        whatsappMessage: form.whatsappMessage || undefined,
        messengerEnabled: form.messengerEnabled,
        messengerUrl: form.messengerUrl || undefined,
        cashOnDeliveryEnabled: form.cashOnDeliveryEnabled,
        manualPaymentEnabled: form.manualPaymentEnabled,
        manualPaymentLabel: form.manualPaymentLabel || undefined,
        manualPaymentInstructions: form.manualPaymentInstructions || undefined,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
        catalogMode: form.catalogMode,
      }),
    onSuccess: () => {
      toast.success('Funcionalidades salvas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error('Erro ao salvar funcionalidades.'),
  });

  if (isLoading) {
    return (
      <SettingsPageLayout title="Funcionalidades da loja">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Funcionalidades da loja"
      description="Ative e configure funcionalidades extras para sua loja."
    >
      {/* WhatsApp */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          <div className="flex-1">
            <p className="text-sm font-medium">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Botão flutuante de WhatsApp na loja.</p>
          </div>
          <Switch
            checked={form.whatsappEnabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, whatsappEnabled: v }))}
          />
        </div>
        {form.whatsappEnabled && (
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label className="text-xs">Número (com DDD e código do país)</Label>
              <Input
                placeholder="5511999999999"
                value={form.whatsappNumber}
                onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mensagem pré-definida (opcional)</Label>
              <Input
                placeholder="Olá! Gostaria de saber mais sobre..."
                value={form.whatsappMessage}
                onChange={(e) => setForm((f) => ({ ...f, whatsappMessage: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messenger */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-[#0084FF]" />
          <div className="flex-1">
            <p className="text-sm font-medium">Facebook Messenger</p>
            <p className="text-xs text-muted-foreground">Botão flutuante do Messenger na loja.</p>
          </div>
          <Switch
            checked={form.messengerEnabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, messengerEnabled: v }))}
          />
        </div>
        {form.messengerEnabled && (
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label className="text-xs">URL do Messenger</Label>
              <Input
                placeholder="https://m.me/suapagina"
                value={form.messengerUrl}
                onChange={(e) => setForm((f) => ({ ...f, messengerUrl: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Cash on Delivery */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Pagamento na entrega</p>
            <p className="text-xs text-muted-foreground">Permite que clientes paguem na hora da entrega.</p>
          </div>
          <Switch
            checked={form.cashOnDeliveryEnabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, cashOnDeliveryEnabled: v }))}
          />
        </div>
      </div>

      {/* Manual Payment */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Pagamento manual</p>
            <p className="text-xs text-muted-foreground">Depósito, transferência ou outro pagamento offline.</p>
          </div>
          <Switch
            checked={form.manualPaymentEnabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, manualPaymentEnabled: v }))}
          />
        </div>
        {form.manualPaymentEnabled && (
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome do método</Label>
              <Input
                placeholder="Depósito bancário"
                value={form.manualPaymentLabel}
                onChange={(e) => setForm((f) => ({ ...f, manualPaymentLabel: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Instruções para o cliente</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
                placeholder="Faça o depósito na conta..."
                value={form.manualPaymentInstructions}
                onChange={(e) => setForm((f) => ({ ...f, manualPaymentInstructions: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Min Order Value */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Valor mínimo de pedido</p>
            <p className="text-xs text-muted-foreground">Clientes só podem finalizar se atingirem este valor.</p>
          </div>
        </div>
        <div className="pl-8">
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.minOrderValue}
            onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
          />
        </div>
      </div>

      {/* Catalog Mode */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Modo catálogo</p>
            <p className="text-xs text-muted-foreground">
              Esconde o botão "Adicionar ao carrinho". Ideal para exibir produtos sem venda online.
            </p>
          </div>
          <Switch
            checked={form.catalogMode}
            onCheckedChange={(v) => setForm((f) => ({ ...f, catalogMode: v }))}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
