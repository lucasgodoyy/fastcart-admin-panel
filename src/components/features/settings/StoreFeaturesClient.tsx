'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageCircle, CreditCard, ShoppingBag, DollarSign, Package, Eye, Lock, Video, BarChart3, Code } from 'lucide-react';
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
    lowStockThreshold: '5',
    hotjarId: '',
    googleAdsId: '',
    externalChatScript: '',
    storePasswordEnabled: false,
    storePassword: '',
    floatingVideoEnabled: false,
    floatingVideoUrl: '',
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
        lowStockThreshold: store.lowStockThreshold != null ? String(store.lowStockThreshold) : '5',
        hotjarId: store.hotjarId ?? '',
        googleAdsId: store.googleAdsId ?? '',
        externalChatScript: store.externalChatScript ?? '',
        storePasswordEnabled: store.storePasswordEnabled ?? false,
        storePassword: store.storePassword ?? '',
        floatingVideoEnabled: store.floatingVideoEnabled ?? false,
        floatingVideoUrl: store.floatingVideoUrl ?? '',
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
        lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : 5,
        hotjarId: form.hotjarId || undefined,
        googleAdsId: form.googleAdsId || undefined,
        externalChatScript: form.externalChatScript || undefined,
        storePasswordEnabled: form.storePasswordEnabled,
        storePassword: form.storePassword || undefined,
        floatingVideoEnabled: form.floatingVideoEnabled,
        floatingVideoUrl: form.floatingVideoUrl || undefined,
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

      {/* Low Stock Threshold */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Alerta de estoque baixo</p>
            <p className="text-xs text-muted-foreground">
              Receba uma notificação quando produtos atingirem esta quantidade. 0 = desativado.
            </p>
          </div>
        </div>
        <div className="max-w-xs">
          <Input
            type="number"
            placeholder="5"
            min="0"
            step="1"
            value={form.lowStockThreshold}
            onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
          />
        </div>
      </div>

      <Separator />

      {/* Hotjar */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium">Hotjar</p>
            <p className="text-xs text-muted-foreground">Mapas de calor e gravação de sessões.</p>
          </div>
        </div>
        <div className="pl-8 space-y-1.5">
          <Label className="text-xs">Site ID</Label>
          <Input
            placeholder="1234567"
            value={form.hotjarId}
            onChange={(e) => setForm((f) => ({ ...f, hotjarId: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Encontre em Hotjar → Settings → Sites & Organizations.</p>
        </div>
      </div>

      {/* Google Ads */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium">Google Ads</p>
            <p className="text-xs text-muted-foreground">Rastreamento de conversões do Google Ads.</p>
          </div>
        </div>
        <div className="pl-8 space-y-1.5">
          <Label className="text-xs">Conversion ID</Label>
          <Input
            placeholder="AW-1234567890"
            value={form.googleAdsId}
            onChange={(e) => setForm((f) => ({ ...f, googleAdsId: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Formato: AW-XXXXXXXXXX. Encontre em Google Ads → Ferramentas → Conversões.</p>
        </div>
      </div>

      <Separator />

      {/* External Chat Widget */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Widget de Chat Externo</p>
            <p className="text-xs text-muted-foreground">Tawk.to, Jivochat, Crisp ou qualquer chat. Cole o script aqui.</p>
          </div>
        </div>
        <div className="pl-8 space-y-1.5">
          <Label className="text-xs">Script do chat</Label>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            rows={4}
            placeholder={'<script src="https://embed.tawk.to/..."></script>'}
            value={form.externalChatScript}
            onChange={(e) => setForm((f) => ({ ...f, externalChatScript: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">O script será injetado automaticamente na sua loja.</p>
        </div>
      </div>

      <Separator />

      {/* Store Password Protection */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Proteger loja com senha</p>
            <p className="text-xs text-muted-foreground">Visitantes precisam digitar uma senha para acessar. Ideal para pré-lançamento.</p>
          </div>
          <Switch
            checked={form.storePasswordEnabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, storePasswordEnabled: v }))}
          />
        </div>
        {form.storePasswordEnabled && (
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label className="text-xs">Senha de acesso</Label>
              <Input
                placeholder="senha123"
                value={form.storePassword}
                onChange={(e) => setForm((f) => ({ ...f, storePassword: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Video */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Vídeo flutuante</p>
            <p className="text-xs text-muted-foreground">Exibe um vídeo em miniatura flutuante na loja. YouTube ou MP4.</p>
          </div>
          <Switch
            checked={form.floatingVideoEnabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, floatingVideoEnabled: v }))}
          />
        </div>
        {form.floatingVideoEnabled && (
          <div className="space-y-3 pl-8">
            <div className="space-y-1.5">
              <Label className="text-xs">URL do vídeo</Label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.floatingVideoUrl}
                onChange={(e) => setForm((f) => ({ ...f, floatingVideoUrl: e.target.value }))}
              />
            </div>
          </div>
        )}
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
