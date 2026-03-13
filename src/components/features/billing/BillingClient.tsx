'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Star,
  Crown,
  Zap,
  ArrowRight,
  Calendar,
  AlertTriangle,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Package,
  Users,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import billingService from '@/services/billingService';
import { StoreBillingResponse, AvailablePlan, PlanLimits } from '@/types/billing';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(cents / 100);
}

function formatDate(iso: string | null) {
  if (!iso) return 'â€”';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

function trialDaysLeft(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const diff = new Date(trialEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
    trialing: t('Em trial', 'Trial'),
    past_due: t('Pagamento pendente', 'Past Due'),
    canceled: t('Cancelado', 'Canceled'),
    unpaid: t('NÃ£o pago', 'Unpaid'),
  };
  return map[s.toLowerCase()] || s;
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-500/15 text-green-700 dark:text-green-400',
    trialing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    past_due: 'bg-red-500/15 text-red-700 dark:text-red-400',
    canceled: 'bg-gray-500/15 text-gray-700 dark:text-gray-400',
  };
  return map[s.toLowerCase()] ?? 'bg-muted text-muted-foreground';
};

export function BillingClient() {
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data, isLoading } = useQuery<StoreBillingResponse>({
    queryKey: ['store-billing'],
    queryFn: () => billingService.getBilling(),
  });

  const { data: limits } = useQuery<PlanLimits>({
    queryKey: ['store-plan-limits'],
    queryFn: () => billingService.getPlanLimits(),
  });

  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const { url } = await billingService.createPortalSession();
      window.location.href = url;
    } catch {
      toast.error(t('Erro ao abrir o portal de assinatura.', 'Failed to open subscription portal.'));
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sub = data?.currentSubscription;
  const plans = data?.availablePlans || [];
  const daysLeft = trialDaysLeft(sub?.trialEnd ?? null);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Assinatura e Planos', 'Subscription & Plans')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            'Gerencie sua assinatura e acompanhe o uso da sua loja.',
            'Manage your subscription and track your store usage.',
          )}
        </p>
      </div>

      {/* â”€â”€ Banners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 dark:bg-green-900/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            {t(
              'Assinatura realizada com sucesso! Seu plano jÃ¡ estÃ¡ ativo.',
              'Subscription successful! Your plan is now active.',
            )}
          </p>
        </div>
      )}
      {isCanceled && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            {t(
              'Checkout cancelado. VocÃª pode tentar novamente quando quiser.',
              'Checkout canceled. You can try again anytime.',
            )}
          </p>
        </div>
      )}

      {/* â”€â”€ Trial Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {sub?.status?.toLowerCase() === 'trialing' && daysLeft !== null && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-900/10 p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                {daysLeft === 0
                  ? t('Seu trial expira hoje!', 'Your trial expires today!')
                  : t(
                      `Seu trial termina em ${daysLeft} dias.`,
                      `Your trial ends in ${daysLeft} days.`,
                    )}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t(
                  'FaÃ§a upgrade para continuar usando todos os recursos.',
                  'Upgrade to keep all features.',
                )}
              </p>
            </div>
          </div>
          <Button size="sm" className="shrink-0 gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            {t('Fazer upgrade', 'Upgrade now')}
          </Button>
        </div>
      )}

      {/* â”€â”€ Current Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {sub ? (
        <div className="rounded-xl border-2 border-primary/25 bg-card p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{sub.planName}</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(sub.status)}`}
                >
                  {statusLabel(sub.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPrice(sub.planPriceCents, sub.currency)} /{' '}
                {billingPeriodLabel(sub.billingPeriod)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {t('Gerenciar assinatura', 'Manage subscription')}
            </Button>
          </div>

          {/* Usage bars */}
          {limits && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UsageBar
                icon={<Package className="h-4 w-4 text-primary" />}
                label={t('Produtos', 'Products')}
                current={limits.currentProducts}
                max={limits.maxProducts}
              />
              <UsageBar
                icon={<Users className="h-4 w-4 text-primary" />}
                label={t('Membros da equipe', 'Team members')}
                current={limits.currentStaff}
                max={limits.maxStaff >= 999 ? null : limits.maxStaff}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
            <InfoCard
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              label={t('PerÃ­odo atual', 'Current period')}
              value={`${formatDate(sub.currentPeriodStart)} â€” ${formatDate(sub.currentPeriodEnd)}`}
            />
            {sub.trialEnd && (
              <InfoCard
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
                label={t('Fim do trial', 'Trial ends')}
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
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('Recursos incluÃ­dos', 'Included Features')}
              </p>
              <div className="flex flex-wrap gap-2">
                {sub.features.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Sem assinatura ativa', 'No active subscription')}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Escolha um plano abaixo para comeÃ§ar.', 'Choose a plan below to get started.')}
          </p>
        </div>
      )}

      {/* â”€â”€ Available Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {plans.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              {t('Planos disponÃ­veis', 'Available Plans')}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} hasActiveSubscription={!!sub} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({
  icon,
  label,
  current,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number | null;
}) {
  const pct = max == null ? 0 : Math.min(100, Math.round((current / max) * 100));
  const isNearLimit = max != null && pct >= 80;
  const isAtLimit = max != null && pct >= 100;

  return (
    <div className="rounded-lg bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
        <span
          className={`text-xs font-bold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}
        >
          {max == null ? `${current} / âˆž` : `${current} / ${max}`}
        </span>
      </div>
      {max != null && (
        <Progress
          value={pct}
          className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-yellow-500' : '[&>div]:bg-primary'}`}
        />
      )}
      {isAtLimit && (
        <p className="text-[10px] text-red-600 font-medium">
          {t('Limite atingido â€” faÃ§a upgrade para adicionar mais.', 'Limit reached â€” upgrade to add more.')}
        </p>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  hasActiveSubscription,
}: {
  plan: AvailablePlan;
  hasActiveSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async () => {
    try {
      setLoading(true);
      const { url } = await billingService.createCheckout(plan.id);
      window.location.href = url;
    } catch {
      toast.error(
        t(
          'Erro ao iniciar o checkout. Tente novamente.',
          'Failed to start checkout. Please try again.',
        ),
      );
      setLoading(false);
    }
  };

  const isFree = plan.priceCents === 0;

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-md ${
        plan.isCurrent
          ? 'border-primary ring-2 ring-primary/20'
          : plan.isPopular
            ? 'border-primary/50'
            : 'border-border'
      }`}
    >
      {plan.isPopular && !plan.isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            <Star className="h-3 w-3" fill="currentColor" />
            {t('Popular', 'Popular')}
          </span>
        </div>
      )}
      {plan.isCurrent && (
        <Badge variant="outline" className="absolute right-3 top-3 text-[10px]">
          {t('Plano atual', 'Current')}
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
        {plan.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
        )}
      </div>

      <div className="mb-1">
        <span className="text-2xl font-extrabold text-foreground">
          {isFree ? t('GrÃ¡tis', 'Free') : formatPrice(plan.priceCents, plan.currency)}
        </span>
        {!isFree && (
          <span className="text-xs text-muted-foreground">
            /{billingPeriodLabel(plan.billingPeriod)}
          </span>
        )}
      </div>
      {plan.annualPriceCents != null && plan.annualPriceCents > 0 && (
        <p className="text-xs text-green-600 mb-3">
          {t('ou', 'or')} {formatPrice(plan.annualPriceCents, plan.currency)}/
          {t('ano', 'year')}
        </p>
      )}
      {plan.trialPeriodDays > 0 && !plan.isCurrent && (
        <p className="text-xs text-blue-600 mb-3">
          âœ“ {plan.trialPeriodDays} {t('dias de trial grÃ¡tis', 'day free trial')}
        </p>
      )}

      <div className="mb-4 text-[11px] text-muted-foreground space-y-0.5">
        <p>
          {plan.maxProducts == null
            ? t('Produtos ilimitados', 'Unlimited products')
            : `${t('AtÃ©', 'Up to')} ${plan.maxProducts} ${t('produtos', 'products')}`}
        </p>
        <p>
          {plan.maxStaff >= 999
            ? t('Equipe ilimitada', 'Unlimited team')
            : `${t('AtÃ©', 'Up to')} ${plan.maxStaff} ${t('membros', 'members')}`}
        </p>
        <p>
          {plan.maxStores >= 999
            ? t('Lojas ilimitadas', 'Unlimited stores')
            : `${t('AtÃ©', 'Up to')} ${plan.maxStores} ${t('lojas', 'stores')}`}
        </p>
      </div>

      {plan.features.length > 0 && (
        <ul className="mb-5 space-y-1.5 flex-1">
          {plan.features.slice(0, 7).map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
              {f}
            </li>
          ))}
          {plan.features.length > 7 && (
            <li className="text-[10px] text-muted-foreground pl-5">
              +{plan.features.length - 7} {t('mais recursos', 'more')}
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto">
        {plan.isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            {t('Plano atual', 'Current Plan')}
          </Button>
        ) : isFree ? (
          <Button variant="outline" className="w-full" disabled>
            {t('Plano gratuito', 'Free plan')}
          </Button>
        ) : hasActiveSubscription ? (
          <Button
            variant="outline"
            className="w-full gap-1.5 text-xs"
            onClick={handleSelectPlan}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t('Fazer upgrade', 'Upgrade')}
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        ) : (
          <Button className="w-full gap-1.5" onClick={handleSelectPlan} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {plan.trialPeriodDays > 0
                  ? t('Iniciar trial grÃ¡tis', 'Start free trial')
                  : t('Assinar agora', 'Subscribe now')}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
