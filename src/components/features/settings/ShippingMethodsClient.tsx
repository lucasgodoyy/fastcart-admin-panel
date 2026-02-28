'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Truck, Package, Edit, Plus, Info } from 'lucide-react';

export function ShippingMethodsClient() {
  return (
    <SettingsPageLayout title="Meios de envio" helpText="Mais sobre meios de envio" helpHref="#">
      <div className="flex gap-4 border-b border-border">
        <button className="pb-2 text-sm font-medium text-primary border-b-2 border-primary">Nacionais</button>
        <button className="pb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Internacionais</button>
        <button className="pb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Retiradas</button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Truck className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Nuvem Envio</p>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
              <li>Transportadoras integradas: Correios, Jadlog e Loggi.</li>
              <li>Fretes até 30% mais baratos.</li>
              <li>Emissão de etiquetas integrada às suas vendas.</li>
              <li>Envio automático de códigos de rastreio.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Entrega personalizada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crie o meio de envio que desejar para realizar as entregas dos seus produtos.
            </p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar entrega personalizada
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Custo e prazo de entrega padrão</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Defina um custo e prazo de entrega fixos para quando os meios de envio estiverem fora de serviço.
            </p>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Custo: R$ 20</span>
              <span>Prazo: 10 dias úteis</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Você sabia que também pode enviar seus pedidos personalizados por Nuvem Envio e centralizar tudo em um só lugar?{' '}
          <a href="#" className="font-medium underline">Saiba mais</a>
        </p>
      </div>
    </SettingsPageLayout>
  );
}
