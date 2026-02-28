'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function PaymentMethodsClient() {
  return (
    <SettingsPageLayout
      title="Meios de pagamento"
      description="Configure as formas de pagamento aceitas na sua loja."
      helpText="Mais sobre meios de pagamento"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Stripe Connect</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Receba pagamentos com cartão de crédito, débito e outros meios através do Stripe.
            </p>
            <Link href="/admin/settings/integrations">
              <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                Gerenciar integração
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">Mais formas de pagamento serão adicionadas em breve.</p>
      </div>
    </SettingsPageLayout>
  );
}
