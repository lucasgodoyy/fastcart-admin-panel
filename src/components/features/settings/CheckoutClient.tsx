'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, User, MessageSquare, ShieldCheck, Palette, Info, Heart, Gift, TicketPercent, TimerReset } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import productService from '@/services/catalog/product';
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
  wishlistEnabled: boolean;
  orderBumpEnabled: boolean;
  orderBumpProductId: number | null;
  orderBumpTitle: string;
  orderBumpDescription: string;
  orderBumpCtaLabel: string;
  orderBumpBadge: string;
  giftEnabled: boolean;
  giftThreshold: number;
  giftName: string;
  giftDescription: string;
  couponPopupEnabled: boolean;
  couponPopupTitle: string;
  couponPopupMessage: string;
  couponPopupCode: string;
  couponPopupDelaySeconds: number;
  couponPopupButtonLabel: string;
  countdownEnabled: boolean;
  countdownTitle: string;
  countdownMessage: string;
  countdownEndsAt: string;
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
  wishlistEnabled: true,
  orderBumpEnabled: false,
  orderBumpProductId: null,
  orderBumpTitle: 'Aproveite e leve também',
  orderBumpDescription: '',
  orderBumpCtaLabel: 'Adicionar oferta',
  orderBumpBadge: 'Oferta especial',
  giftEnabled: false,
  giftThreshold: 0,
  giftName: '',
  giftDescription: '',
  couponPopupEnabled: false,
  couponPopupTitle: 'Cupom para sua primeira compra',
  couponPopupMessage: '',
  couponPopupCode: '',
  couponPopupDelaySeconds: 4,
  couponPopupButtonLabel: 'Copiar cupom',
  countdownEnabled: false,
  countdownTitle: 'Oferta termina em',
  countdownMessage: '',
  countdownEndsAt: '',
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = toNumberOrNull(value);
  return parsed ?? fallback;
};

const toString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const toDateTimeLocal = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
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
      wishlistEnabled:
        typeof raw.wishlistEnabled === 'boolean'
          ? raw.wishlistEnabled
          : DEFAULTS.wishlistEnabled,
      orderBumpEnabled:
        typeof raw.orderBumpEnabled === 'boolean'
          ? raw.orderBumpEnabled
          : DEFAULTS.orderBumpEnabled,
      orderBumpProductId: toNumberOrNull(raw.orderBumpProductId),
      orderBumpTitle: toString(raw.orderBumpTitle, DEFAULTS.orderBumpTitle),
      orderBumpDescription: toString(raw.orderBumpDescription),
      orderBumpCtaLabel: toString(raw.orderBumpCtaLabel, DEFAULTS.orderBumpCtaLabel),
      orderBumpBadge: toString(raw.orderBumpBadge, DEFAULTS.orderBumpBadge),
      giftEnabled:
        typeof raw.giftEnabled === 'boolean'
          ? raw.giftEnabled
          : DEFAULTS.giftEnabled,
      giftThreshold: toNumber(raw.giftThreshold, DEFAULTS.giftThreshold),
      giftName: toString(raw.giftName),
      giftDescription: toString(raw.giftDescription),
      couponPopupEnabled:
        typeof raw.couponPopupEnabled === 'boolean'
          ? raw.couponPopupEnabled
          : DEFAULTS.couponPopupEnabled,
      couponPopupTitle: toString(raw.couponPopupTitle, DEFAULTS.couponPopupTitle),
      couponPopupMessage: toString(raw.couponPopupMessage),
      couponPopupCode: toString(raw.couponPopupCode),
      couponPopupDelaySeconds: toNumber(raw.couponPopupDelaySeconds, DEFAULTS.couponPopupDelaySeconds),
      couponPopupButtonLabel: toString(raw.couponPopupButtonLabel, DEFAULTS.couponPopupButtonLabel),
      countdownEnabled:
        typeof raw.countdownEnabled === 'boolean'
          ? raw.countdownEnabled
          : DEFAULTS.countdownEnabled,
      countdownTitle: toString(raw.countdownTitle, DEFAULTS.countdownTitle),
      countdownMessage: toString(raw.countdownMessage),
      countdownEndsAt: toString(raw.countdownEndsAt),
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
  const { data: products = [] } = useQuery({
    queryKey: ['conversion-products'],
    queryFn: () => productService.listAll(),
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

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Ferramentas de conversão</p>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Lista de desejos na loja</p>
              <p className="text-xs text-muted-foreground mt-0.5">Exibe corações, contador no header e a página de wishlist para clientes.</p>
            </div>
            <Switch checked={form.wishlistEnabled} onCheckedChange={(v) => set('wishlistEnabled', v)} />
          </div>

          <div className="rounded-lg border border-border/70 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Order bump no checkout</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sugere um produto extra no resumo do pedido e adiciona direto ao carrinho.</p>
              </div>
              <Switch checked={form.orderBumpEnabled} onCheckedChange={(v) => set('orderBumpEnabled', v)} />
            </div>
            {form.orderBumpEnabled && (
              <div className="grid gap-3 pl-4 border-l-2 border-border">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Produto da oferta</Label>
                  <select
                    value={form.orderBumpProductId ?? ''}
                    onChange={(e) => set('orderBumpProductId', e.target.value ? Number(e.target.value) : null)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        #{product.id} · {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Badge</Label>
                    <Input value={form.orderBumpBadge} onChange={(e) => set('orderBumpBadge', e.target.value)} placeholder="Oferta especial" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">CTA</Label>
                    <Input value={form.orderBumpCtaLabel} onChange={(e) => set('orderBumpCtaLabel', e.target.value)} placeholder="Adicionar oferta" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Título</Label>
                  <Input value={form.orderBumpTitle} onChange={(e) => set('orderBumpTitle', e.target.value)} placeholder="Aproveite e leve também" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Input value={form.orderBumpDescription} onChange={(e) => set('orderBumpDescription', e.target.value)} placeholder="Texto curto da oferta" />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/70 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Brinde automático</p>
                <p className="text-xs text-muted-foreground mt-0.5">Libera um brinde visual no checkout e registra a promoção na observação do pedido.</p>
              </div>
              <Switch checked={form.giftEnabled} onCheckedChange={(v) => set('giftEnabled', v)} />
            </div>
            {form.giftEnabled && (
              <div className="grid gap-3 pl-4 border-l-2 border-border md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nome do brinde</Label>
                  <Input value={form.giftName} onChange={(e) => set('giftName', e.target.value)} placeholder="Ex: Mini nécessaire" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Valor mínimo do pedido</Label>
                  <Input type="number" min="0" step="0.01" value={form.giftThreshold} onChange={(e) => set('giftThreshold', Number(e.target.value || 0))} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Descrição do brinde</Label>
                  <Input value={form.giftDescription} onChange={(e) => set('giftDescription', e.target.value)} placeholder="Ex: Enviado junto ao pedido sem custo extra" />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/70 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Pop-up de cupom</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mostra uma oferta com código copiável e leva o código pronto para o checkout.</p>
              </div>
              <Switch checked={form.couponPopupEnabled} onCheckedChange={(v) => set('couponPopupEnabled', v)} />
            </div>
            {form.couponPopupEnabled && (
              <div className="grid gap-3 pl-4 border-l-2 border-border md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Título do pop-up</Label>
                  <Input value={form.couponPopupTitle} onChange={(e) => set('couponPopupTitle', e.target.value)} placeholder="Cupom para sua primeira compra" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Mensagem</Label>
                  <Input value={form.couponPopupMessage} onChange={(e) => set('couponPopupMessage', e.target.value)} placeholder="Use este cupom e finalize hoje mesmo" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Código do cupom</Label>
                  <Input value={form.couponPopupCode} onChange={(e) => set('couponPopupCode', e.target.value.toUpperCase())} placeholder="BEMVINDO10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Aparecer após (segundos)</Label>
                  <Input type="number" min="0" step="1" value={form.couponPopupDelaySeconds} onChange={(e) => set('couponPopupDelaySeconds', Number(e.target.value || 0))} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Texto do botão</Label>
                  <Input value={form.couponPopupButtonLabel} onChange={(e) => set('couponPopupButtonLabel', e.target.value)} placeholder="Copiar cupom" />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/70 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Contagem regressiva promocional</p>
                <p className="text-xs text-muted-foreground mt-0.5">Exibe uma régua de urgência no topo da loja com prazo configurável.</p>
              </div>
              <Switch checked={form.countdownEnabled} onCheckedChange={(v) => set('countdownEnabled', v)} />
            </div>
            {form.countdownEnabled && (
              <div className="grid gap-3 pl-4 border-l-2 border-border md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Título</Label>
                  <Input value={form.countdownTitle} onChange={(e) => set('countdownTitle', e.target.value)} placeholder="Oferta termina em" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Mensagem complementar</Label>
                  <Input value={form.countdownMessage} onChange={(e) => set('countdownMessage', e.target.value)} placeholder="Últimas horas da campanha" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Data e hora final</Label>
                  <Input type="datetime-local" value={toDateTimeLocal(form.countdownEndsAt)} onChange={(e) => set('countdownEndsAt', fromDateTimeLocal(e.target.value))} />
                </div>
              </div>
            )}
          </div>
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
