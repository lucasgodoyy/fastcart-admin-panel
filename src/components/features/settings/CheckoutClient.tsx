'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, User, MessageSquare, ShieldCheck, Palette, Info } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';

type CheckoutSettings = {
  useLayoutColors: boolean;
  askPhone: boolean;
  requirePhone: boolean;
  askInvoice: boolean;
  customerNoteEnabled: boolean;
  customerNoteLabel: string;
  customerNoteRequired: boolean;
  allowChangePaymentMethod: boolean;
  restrictPurchases: 'ALL' | 'REGISTERED_ONLY';
};

const DEFAULTS: CheckoutSettings = {
  useLayoutColors: false,
  askPhone: false,
  requirePhone: false,
  askInvoice: false,
  customerNoteEnabled: false,
  customerNoteLabel: '',
  customerNoteRequired: false,
  allowChangePaymentMethod: false,
  restrictPurchases: 'ALL',
};

function parseSettings(json: string | null | undefined): CheckoutSettings {
  if (!json) return { ...DEFAULTS };
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    return {
      ...DEFAULTS,
      ...raw,
      // Migrate old field names
      customerNoteLabel:
        typeof raw.customerNoteLabel === 'string'
          ? raw.customerNoteLabel
          : typeof raw.customerMessageFieldName === 'string'
          ? raw.customerMessageFieldName
          : '',
      customerNoteRequired:
        typeof raw.customerNoteRequired === 'boolean'
          ? raw.customerNoteRequired
          : typeof raw.fieldRequired === 'boolean'
          ? raw.fieldRequired
          : false,
      customerNoteEnabled:
        typeof raw.customerNoteEnabled === 'boolean'
          ? raw.customerNoteEnabled
          : !!(raw.customerMessageFieldName),
      restrictPurchases:
        raw.restrictPurchases === 'REGISTERED_ONLY' ? 'REGISTERED_ONLY' : 'ALL',
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function CheckoutClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState<CheckoutSettings>({ ...DEFAULTS });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (store) {
      setForm(parseSettings(store.checkoutSettingsJson));
      setDirty(false);
    }
  }, [store]);

  const mutation = useMutation({
    mutationFn: () => {
      // Preserve customFields and other keys already stored (e.g., by CustomFieldsClient)
      let existing: Record<string, unknown> = {};
      try { existing = JSON.parse(store?.checkoutSettingsJson || '{}'); } catch { /* */ }
      const merged = { ...existing, ...form };
      return storeSettingsService.updateMyStore({ checkoutSettingsJson: JSON.stringify(merged) });
    },
    onSuccess: () => {
      toast.success('Configurações do checkout salvas!');
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error('Erro ao salvar configurações.'),
  });

  const set = <K extends keyof CheckoutSettings>(key: K, val: CheckoutSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  if (isLoading) {
    return (
      <SettingsPageLayout title="Checkout" description="Carregando...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Checkout"
      description="Configure a experiência de compra dos seus clientes."
    >
      {/* ── 1. Customer data ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Dados do cliente</p>
        </div>
        <div className="p-5 divide-y divide-border">
          {/* Phone */}
          <div className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Solicitar telefone</p>
              <p className="text-xs text-muted-foreground mt-0.5">Adiciona um campo de telefone no cadastro do checkout.</p>
            </div>
            <Switch checked={form.askPhone} onCheckedChange={(v) => set('askPhone', v)} />
          </div>
          {form.askPhone && (
            <div className="py-3 flex items-start justify-between gap-4 pl-4">
              <div>
                <p className="text-sm text-foreground">Telefone obrigatório</p>
                <p className="text-xs text-muted-foreground mt-0.5">O cliente não consegue finalizar sem informar.</p>
              </div>
              <Switch checked={form.requirePhone} onCheckedChange={(v) => set('requirePhone', v)} />
            </div>
          )}
          {/* CPF/Invoice */}
          <div className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Solicitar CPF/CNPJ para nota fiscal</p>
              <p className="text-xs text-muted-foreground mt-0.5">Exibe campo CPF ou CNPJ na etapa de endereço.</p>
            </div>
            <Switch checked={form.askInvoice} onCheckedChange={(v) => set('askInvoice', v)} />
          </div>
        </div>
      </div>

      {/* ── 2. Customer note (order note) ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Nota do cliente</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Habilitar campo de observação</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
                Permite que o cliente deixe uma observação ao finalizar o pedido. Exemplos: &quot;embrulho pra presente&quot;, &quot;retirar na portão&quot;, &quot;sem cobrar taxa de entrega antecipada&quot;.
              </p>
            </div>
            <Switch checked={form.customerNoteEnabled} onCheckedChange={(v) => set('customerNoteEnabled', v)} />
          </div>
          {form.customerNoteEnabled && (
            <div className="space-y-3 pl-4 border-l-2 border-border">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Label do campo</Label>
                <Input
                  value={form.customerNoteLabel}
                  onChange={(e) => set('customerNoteLabel', e.target.value)}
                  placeholder="Ex: Instruções de entrega / Observação do pedido"
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground">Campo obrigatório</p>
                  <p className="text-xs text-muted-foreground mt-0.5">O cliente é obrigado a preencher antes de finalizar.</p>
                </div>
                <Switch checked={form.customerNoteRequired} onCheckedChange={(v) => set('customerNoteRequired', v)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Change payment method ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Alterar meio de pagamento</p>
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground">Permitir troca na página de acompanhamento</p>
              <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">Beta</Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Quando ativo, o cliente pode selecionar outro meio de pagamento diretamente na página de rastreio do pedido
              — útil quando o boleto vence ou o cartão foi recusado. Aumenta a conversão de pedidos pendentes.
            </p>
          </div>
          <Switch
            checked={form.allowChangePaymentMethod}
            onCheckedChange={(v) => set('allowChangePaymentMethod', v)}
          />
        </div>
      </div>

      {/* ── 4. Access control ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Controle de acesso</p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">Define quem pode concluir compras na sua loja.</p>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="restrict"
                checked={form.restrictPurchases === 'ALL'}
                onChange={() => set('restrictPurchases', 'ALL')}
                className="mt-0.5 h-4 w-4 accent-foreground"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Todos os clientes</p>
                <p className="text-xs text-muted-foreground">Qualquer pessoa pode comprar, com ou sem cadastro prevé (guest checkout).</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="restrict"
                checked={form.restrictPurchases === 'REGISTERED_ONLY'}
                onChange={() => set('restrictPurchases', 'REGISTERED_ONLY')}
                className="mt-0.5 h-4 w-4 accent-foreground"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Somente clientes cadastrados</p>
                <p className="text-xs text-muted-foreground">O cliente precisa ter uma conta ativa para finalizar a compra.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── 5. Appearance ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Aparência</p>
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Usar as cores do layout no checkout</p>
            <p className="text-xs text-muted-foreground mt-0.5">Aplica a paleta de cores primárias da sua loja nas páginas de checkout.</p>
          </div>
          <Switch checked={form.useLayoutColors} onCheckedChange={(v) => set('useLayoutColors', v)} />
        </div>
      </div>

      {/* ── Antifraude info ── */}
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Antifraude</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            A proteção antifraude é gerenciada pelo gateway de pagamento (Stripe), que analisa automaticamente cada transação com machine learning. Para análise avançada com ferramentas como ClearSale ou Konduto, entre em contato com o suporte.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => store && setForm(parseSettings(store.checkoutSettingsJson))}
          disabled={!dirty}
        >
          Cancelar
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !dirty}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
