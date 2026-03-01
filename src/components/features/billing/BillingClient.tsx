'use client';

import { useQuery } from '@tanstack/react-query';
import {

  Check,
  Star,
  Crown,
  Zap,
  ArrowRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import billingService from '@/services/billingService';
import { StoreBillingResponse, AvailablePlan } from '@/types/billing';
import { t } from '@/lib/admin-language';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(cents / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

const billingPeriodLabel = (p: string) => {
  const map: Record<string, string> = {
    monthly: t('Mensal', 'Monthly'),
    yearly: t('Anual', 'Yearly'),
    quarterly: t('Trimestral', 'Quarterly'),
  };
  return map[p.toLowerCase()] || p;
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    active: t('Ativo', 'Active'),
    trialing: t('Período de testes', 'Trial'),
    past_due: t('Pagamento pendente', 'Past Due'),
    canceled: t('Cancelado', 'Canceled'),
    unpaid: t('Não pago', 'Unpaid'),
  };
  return map[s.toLowerCase()] || s;
};

export function BillingClient() {
  const { data, isLoading } = useQuery<StoreBillingResponse>({
    queryKey: ['store-billing'],
    queryFn: () => billingService.getBilling(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-muted-foreground">{t('Carregando faturamento...', 'Loading billing...')}</p>
      </div>
    );
  }

  const sub = data?.currentSubscription;
  const plans = data?.availablePlans || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Assinatura e Planos', 'Subscription & Plans')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Gerencie sua assinatura e veja os planos disponíveis.', 'Manage your subscription and view available plans.')}
        </p>
      </div>

      {/* Current Subscription */}
      {sub ? (
        <div className="mb-8 rounded-xl border-2 border-primary/20 bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{sub.planName}</h2>
                <Badge variant="default" className="text-xs">{statusLabel(sub.status)}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPrice(sub.planPriceCents, sub.currency)} / {billingPeriodLabel(sub.billingPeriod)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              label={t('Período atual', 'Current period')}
              value={`${formatDate(sub.currentPeriodStart)} — ${formatDate(sub.currentPeriodEnd)}`}
            />
            {sub.trialEnd && (
              <InfoCard
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
                label={t('Fim do teste', 'Trial ends')}
                value={formatDate(sub.trialEnd)}
              />
            )}
            {sub.canceledAt && (
              <InfoCard
                icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                label={t('Cancelado em', 'Canceled at')}
                value={formatDate(sub.canceledAt)}
              />
            )}
          </div>

          {sub.features.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('Recursos incluídos', 'Included Features')}
              </p>
              <div className="flex flex-wrap gap-2">
                {sub.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                    <Check className="h-3 w-3 text-green-600" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Sem assinatura ativa', 'No active subscription')}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Escolha um plano abaixo para começar.', 'Choose a plan below to get started.')}
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">
          {t('Planos disponíveis', 'Available Plans')}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
          {plans.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              {t('Nenhum plano disponível no momento.', 'No plans available at this time.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: AvailablePlan }) {
  return (
    <div className={`relative rounded-xl border bg-card p-6 transition-shadow hover:shadow-md ${
      plan.isCurrent ? 'border-primary ring-2 ring-primary/20' : 'border-border'
    }`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            <Star className="h-3 w-3" fill="currentColor" />
            {t('Popular', 'Popular')}
          </span>
        </div>
      )}
      {plan.isCurrent && (
        <Badge variant="outline" className="absolute right-4 top-4 text-xs">
          {t('Plano atual', 'Current plan')}
        </Badge>
      )}

      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
      {plan.description && (
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      )}

      <div className="mt-4">
        <span className="text-3xl font-extrabold text-foreground">
          {formatPrice(plan.priceCents, plan.currency)}
        </span>
        <span className="text-sm text-muted-foreground">/{billingPeriodLabel(plan.billingPeriod)}</span>
      </div>

      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
        <p>{t('Até', 'Up to')} {plan.maxStores} {t('lojas', 'stores')}</p>
        {plan.maxProducts !== null ? (
          <p>{t('Até', 'Up to')} {plan.maxProducts} {t('produtos', 'products')}</p>
        ) : (
          <p>{t('Produtos ilimitados', 'Unlimited products')}</p>
        )}
      </div>

      {plan.features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {plan.isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            {t('Plano atual', 'Current Plan')}
          </Button>
        ) : (
          <Button className="w-full gap-2">
            {t('Selecionar plano', 'Select Plan')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
