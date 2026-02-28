'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import storeService, {
  type CheckoutSettings,
  DEFAULT_CHECKOUT_SETTINGS,
} from '@/services/storeService';

export function CheckoutClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CheckoutSettings>({ ...DEFAULT_CHECKOUT_SETTINGS });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const store = await storeService.getMyStore();
      setSettings(storeService.parseCheckoutSettings(store.checkoutSettingsJson));
    } catch {
      toast.error('Erro ao carregar configurações de checkout.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await storeService.updateMyStore({
        checkoutSettingsJson: JSON.stringify(settings),
      });
      toast.success('Configurações do checkout salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar configurações do checkout.');
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof CheckoutSettings>(key: K, value: CheckoutSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SettingsPageLayout
      title="Opções do checkout"
      description="Configure as opções disponíveis para pedir dados adicionais ao seu cliente durante o processo de compra."
      helpText="Mais sobre checkout"
      helpHref="#"
    >
      {/* Layout */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Layout</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.useLayoutColors}
            onChange={(e) => update('useLayoutColors', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Usar as cores do seu layout no checkout</span>
        </label>
      </div>

      {/* Dados do cliente */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Dados do cliente</p>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-foreground">Telefone</p>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={settings.askPhone}
                onChange={(e) => update('askPhone', e.target.checked)}
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
                checked={settings.askInvoice}
                onChange={(e) => update('askInvoice', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Pedir endereço para emissão de nota fiscal</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mensagem do cliente */}
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
            value={settings.customerMessageFieldName}
            onChange={(e) => update('customerMessageFieldName', e.target.value)}
            placeholder="Instruções sobre o pedido"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.fieldRequired}
            onChange={(e) => update('fieldRequired', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Marcar campo como obrigatório</span>
        </label>
      </div>

      {/* Mensagem na página de seguimento */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Mensagem na página de seguimento</p>
        <p className="text-xs text-muted-foreground">Esta página informará seu cliente sobre o estado do envio.</p>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={settings.trackingMessage}
          onChange={(e) => update('trackingMessage', e.target.value)}
          placeholder="Mensagem personalizada"
        />
      </div>

      {/* ClearSale */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">ClearSale</p>
        <p className="text-xs text-muted-foreground">A ClearSale ajudará a analisar o risco dos pedidos efetuados em sua loja.</p>

        <div className="space-y-1.5">
          <Label htmlFor="clearSaleCode" className="text-sm font-medium text-foreground">
            Código de integração
          </Label>
          <Input
            id="clearSaleCode"
            value={settings.clearSaleCode}
            onChange={(e) => update('clearSaleCode', e.target.value)}
          />
        </div>
      </div>

      {/* Restringir compras */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Restringir compras</p>
        <p className="text-xs text-muted-foreground">Defina quem pode comprar na sua loja.</p>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restrict"
              checked={settings.restrictPurchases === 'all'}
              onChange={() => update('restrictPurchases', 'all')}
              className="h-4 w-4"
            />
            <span className="text-sm text-foreground">Todos os clientes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restrict"
              checked={settings.restrictPurchases === 'authorized'}
              onChange={() => update('restrictPurchases', 'authorized')}
              className="h-4 w-4"
            />
            <span className="text-sm text-foreground">Somente clientes autorizados</span>
          </label>
        </div>
      </div>

      {/* Alterar meio de pagamento */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Alterar meio de pagamento</p>
        <p className="text-xs text-muted-foreground">
          Permita que seus clientes escolham outro meio de pagamento pela página de acompanhamento e aumente suas vendas.
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowPaymentMethodChange}
            onChange={(e) => update('allowPaymentMethodChange', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Permitir troca de meio de pagamento</span>
        </label>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
