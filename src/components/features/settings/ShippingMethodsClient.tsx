'use client';

import Link from 'next/link';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Truck, Package, Edit, Plus, Info, ArrowRight } from 'lucide-react';

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
            <p className="text-sm font-medium text-foreground">Melhor Envio</p>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
              <li>Transportadoras integradas: Correios, Jadlog, Loggi e mais.</li>
              <li>Cotação automática de frete em tempo real.</li>
              <li>Emissão de etiquetas integrada às suas vendas.</li>
              <li>Rastreamento automático de envios.</li>
            </ul>
            <Link href="/admin/settings/integrations">
              <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                Configurar Melhor Envio
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
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
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" disabled>
              <Plus className="h-3.5 w-3.5" />
              Adicionar (em breve)
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Configure a integração com o Melhor Envio na página de{' '}
          <Link href="/admin/settings/integrations" className="font-medium underline">Integrações</Link>
          {' '}para ativar cotação de frete automática e emissão de etiquetas.
        </p>
      </div>
    </SettingsPageLayout>
  );
}
