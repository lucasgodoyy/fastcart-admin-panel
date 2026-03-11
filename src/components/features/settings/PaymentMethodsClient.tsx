'use client';

import { useQuery } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Landmark,
} from 'lucide-react';
import Link from 'next/link';
import storeSettingsService from '@/services/storeSettingsService';

export function PaymentMethodsClient() {
  const { data: store, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const stripeConnected = store?.stripeConnected ?? false;

  return (
    <SettingsPageLayout
      title="Meios de pagamento"
      description="Configure os gateways de pagamento aceitos na sua loja."
      helpText="Mais sobre meios de pagamento"
    >
      {/* Stripe Connect */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm font-medium text-foreground">Stripe Connect</p>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : stripeConnected ? (
                <Badge className="gap-1 text-xs bg-green-600 hover:bg-green-600 text-white">
                  <CheckCircle2 className="h-3 w-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                  <XCircle className="h-3 w-3" />
                  Nao configurado
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Receba pagamentos com cartao de credito, debito e outros meios atraves do Stripe.
              Suporte a parcelamento, checkout seguro e repasse automatico.
            </p>
            {store?.stripeAccountId && (
              <p className="mt-1 text-[11px] text-muted-foreground font-mono">
                ID: {store.stripeAccountId}
              </p>
            )}
            <Link href="/admin/settings/integrations">
              <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                {stripeConnected ? 'Gerenciar Stripe' : 'Conectar Stripe'}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Separator />

      {/* Mercado Pago — coming soon */}
      <div className="rounded-lg border border-border bg-card p-5 opacity-60 pointer-events-none">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#009EE3]/10">
            <Landmark className="h-5 w-5 text-[#009EE3]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Mercado Pago</p>
              <Badge variant="outline" className="text-xs text-muted-foreground">Em breve</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Aceite pagamentos via PIX, boleto, cartao e parcelamento com o Mercado Pago.
            </p>
          </div>
        </div>
      </div>

      {/* PIX — coming soon */}
      <div className="rounded-lg border border-border bg-card p-5 opacity-60 pointer-events-none">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <span className="text-xs font-black text-muted-foreground">PIX</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">PIX nativo</p>
              <Badge variant="outline" className="text-xs text-muted-foreground">Em breve</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Receba via PIX diretamente na sua chave, sem intermediarios ou taxas adicionais.
            </p>
          </div>
        </div>
      </div>

      {/* Separator info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Configuracoes de frete e logistica (Melhor Envio, etiquetas, rastreamento) ficam em{' '}
          <Link href="/admin/settings/shipping-methods" className="font-medium underline">
            Meios de envio
          </Link>
          {' '}e{' '}
          <Link href="/admin/shipping" className="font-medium underline">
            Logistica
          </Link>
          . Esta pagina e exclusiva para gateways de pagamento.
        </p>
      </div>
    </SettingsPageLayout>
  );
}
