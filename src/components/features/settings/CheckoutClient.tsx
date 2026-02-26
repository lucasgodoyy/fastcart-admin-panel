'use client';

import { useState } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function CheckoutClient() {
  const [useLayoutColors, setUseLayoutColors] = useState(false);
  const [askPhone, setAskPhone] = useState(false);
  const [askInvoice, setAskInvoice] = useState(false);
  const [fieldRequired, setFieldRequired] = useState(false);
  const [restrictPurchases, setRestrictPurchases] = useState<'all' | 'authorized'>('all');
  const [customerMessage, setCustomerMessage] = useState('');
  const [clearSaleCode, setClearSaleCode] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');

  return (
    <SettingsPageLayout
      title="Opcoes do checkout"
      description="Configure as opcoes disponiveis para pedir dados adicionais ao seu cliente durante o processo de compra."
      helpText="Mais sobre checkout"
      helpHref="#"
    >
      {/* Layout */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Layout</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useLayoutColors}
            onChange={(e) => setUseLayoutColors(e.target.checked)}
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
                checked={askPhone}
                onChange={(e) => setAskPhone(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Pedir telefone de contato</span>
            </label>
          </div>

          <div>
            <p className="text-sm text-foreground">Emissao de notas fiscais</p>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={askInvoice}
                onChange={(e) => setAskInvoice(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Pedir endereco para emissao de nota fiscal</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mensagem do cliente */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Mensagem do cliente</p>
        <p className="text-xs text-muted-foreground">
          Seu cliente pode usar este campo para deixar observacoes sobre o pedido.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="fieldName" className="text-sm font-medium text-foreground">
            Nome do campo
          </Label>
          <Input
            id="fieldName"
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            placeholder="Instrucoes sobre o pedido"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fieldRequired}
            onChange={(e) => setFieldRequired(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Marcar campo como obrigatorio</span>
        </label>
      </div>

      {/* Mensagem na pagina de seguimento */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Mensagem na pagina de seguimento</p>
        <p className="text-xs text-muted-foreground">
          Esta pagina informara seu cliente sobre o estado do envio.
        </p>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={trackingMessage}
          onChange={(e) => setTrackingMessage(e.target.value)}
          placeholder="Mensagem personalizada"
        />
      </div>

      {/* ClearSale */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">ClearSale</p>
        <p className="text-xs text-muted-foreground">
          A ClearSale ajudara a analisar o risco dos pedidos efetuados em sua loja.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="clearSaleCode" className="text-sm font-medium text-foreground">
            Codigo de integracao
          </Label>
          <Input
            id="clearSaleCode"
            value={clearSaleCode}
            onChange={(e) => setClearSaleCode(e.target.value)}
          />
        </div>
      </div>

      {/* Restringir compras */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Restringir compras</p>
        <p className="text-xs text-muted-foreground">
          Defina quem pode comprar na sua loja.
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restrict"
              checked={restrictPurchases === 'all'}
              onChange={() => setRestrictPurchases('all')}
              className="h-4 w-4"
            />
            <span className="text-sm text-foreground">Todos os clientes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restrict"
              checked={restrictPurchases === 'authorized'}
              onChange={() => setRestrictPurchases('authorized')}
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
          Permita que seus clientes escolham outro meio de pagamento pela pagina de acompanhamento e aumente suas vendas.
        </p>
      </div>

      <div className="flex items-center justify-end">
        <Button>Salvar</Button>
      </div>
    </SettingsPageLayout>
  );
}
