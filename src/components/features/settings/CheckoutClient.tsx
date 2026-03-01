'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';

type CheckoutSettings = {
  useLayoutColors: boolean;
  askPhone: boolean;
  askInvoice: boolean;
  fieldRequired: boolean;
  restrictPurchases: 'all' | 'authorized';
  customerMessageFieldName: string;
  clearSaleCode: string;
  trackingMessage: string;
};

const DEFAULTS: CheckoutSettings = {
  useLayoutColors: false,
  askPhone: false,
  askInvoice: false,
  fieldRequired: false,
  restrictPurchases: 'all',
  customerMessageFieldName: '',
  clearSaleCode: '',
  trackingMessage: '',
};

function parseSettings(json: string | null | undefined): CheckoutSettings {
  if (!json) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(json) };
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

  useEffect(() => {
    if (store) setForm(parseSettings(store.checkoutSettingsJson));
  }, [store]);

  const mutation = useMutation({
    mutationFn: () =>
      storeSettingsService.updateMyStore({ checkoutSettingsJson: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success('Configurações do checkout salvas!');
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error('Erro ao salvar configurações.'),
  });

  const set = <K extends keyof CheckoutSettings>(key: K, val: CheckoutSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  if (isLoading) {
    return (
      <SettingsPageLayout title="Opções do checkout" description="Configure as opções disponíveis para pedir dados adicionais ao seu cliente durante o processo de compra." helpText="Mais sobre checkout" helpHref="#">
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Opções do checkout"
      description="Configure as opções disponíveis para pedir dados adicionais ao seu cliente durante o processo de compra."
      helpText="Mais sobre checkout"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Layout</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.useLayoutColors}
            onChange={(e) => set('useLayoutColors', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Usar as cores do seu layout no checkout</span>
        </label>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Dados do cliente</p>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-foreground">Telefone</p>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={form.askPhone}
                onChange={(e) => set('askPhone', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Pedir telefone de contato</span>
            </label>
          </div>

          <div>
            <p className="text-sm text-foreground">Emissão de notas fiscais</p>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={form.askInvoice}
                onChange={(e) => set('askInvoice', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Pedir endereço para emissão de nota fiscal</span>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Mensagem do cliente</p>
        <p className="text-xs text-muted-foreground">
          Seu cliente pode usar este campo para deixar observações sobre o pedido.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="fieldName" className="text-sm font-medium text-foreground">
            Nome do campo
          </Label>
          <Input
            id="fieldName"
            value={form.customerMessageFieldName}
            onChange={(e) => set('customerMessageFieldName', e.target.value)}
            placeholder="Instruções sobre o pedido"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.fieldRequired}
            onChange={(e) => set('fieldRequired', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Marcar campo como obrigatório</span>
        </label>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Mensagem na página de seguimento</p>
        <p className="text-xs text-muted-foreground">Esta página informará seu cliente sobre o estado do envio.</p>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form.trackingMessage}
          onChange={(e) => set('trackingMessage', e.target.value)}
          placeholder="Mensagem personalizada"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">ClearSale</p>
        <p className="text-xs text-muted-foreground">A ClearSale ajudará a analisar o risco dos pedidos efetuados em sua loja.</p>

        <div className="space-y-1.5">
          <Label htmlFor="clearSaleCode" className="text-sm font-medium text-foreground">
            Código de integração
          </Label>
          <Input id="clearSaleCode" value={form.clearSaleCode} onChange={(e) => set('clearSaleCode', e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Restringir compras</p>
        <p className="text-xs text-muted-foreground">Defina quem pode comprar na sua loja.</p>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restrict"
              checked={form.restrictPurchases === 'all'}
              onChange={() => set('restrictPurchases', 'all')}
              className="h-4 w-4"
            />
            <span className="text-sm text-foreground">Todos os clientes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restrict"
              checked={form.restrictPurchases === 'authorized'}
              onChange={() => set('restrictPurchases', 'authorized')}
              className="h-4 w-4"
            />
            <span className="text-sm text-foreground">Somente clientes autorizados</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Alterar meio de pagamento</p>
        <p className="text-xs text-muted-foreground">
          Permita que seus clientes escolham outro meio de pagamento pela página de acompanhamento e aumente suas vendas.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => store && setForm(parseSettings(store.checkoutSettingsJson))}>Cancelar</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
