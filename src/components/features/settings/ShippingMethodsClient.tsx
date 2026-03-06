'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Truck, Package, Plus, Info, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShippingTab = 'national' | 'international' | 'pickup';

export function ShippingMethodsClient() {
  const [activeTab, setActiveTab] = useState<ShippingTab>('national');

  const tabs: { value: ShippingTab; label: string }[] = [
    { value: 'national', label: 'Nacionais' },
    { value: 'international', label: 'Internacionais' },
    { value: 'pickup', label: 'Retiradas' },
  ];

  return (
    <SettingsPageLayout title="Meios de envio" helpText="Mais sobre meios de envio">
      <div className="flex gap-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'pb-2 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'national' && (
        <>
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
                <Link href="/admin/shipping">
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
              <Link href="/admin/shipping" className="font-medium underline">Logística</Link>
              {' '}para ativar cotação de frete automática e emissão de etiquetas.
            </p>
          </div>
        </>
      )}

      {activeTab === 'international' && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Envios internacionais</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Em breve você poderá configurar transportadoras internacionais para enviar seus produtos para outros países.
          </p>
        </div>
      )}

      {activeTab === 'pickup' && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Pontos de retirada</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Em breve você poderá cadastrar endereços de retirada para que seus clientes busquem os pedidos presencialmente.
          </p>
        </div>
      )}
    </SettingsPageLayout>
  );
}
