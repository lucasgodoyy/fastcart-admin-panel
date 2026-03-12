'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles, Store } from 'lucide-react';
import billingService from '@/services/billingService';
import { StoreBillingResponse } from '@/types/billing';
import { isEnglish, t } from '@/lib/admin-language';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat(isEnglish ? 'en-US' : 'pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PricingPage() {
  const { data, isLoading } = useQuery<StoreBillingResponse>({
    queryKey: ['public-billing'],
    queryFn: billingService.getBilling,
    retry: false,
  });

  const plans = data?.availablePlans ?? [];

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Lojaki</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('Entrar', 'Sign in')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t('Plataforma SaaS de e-commerce', 'SaaS e-commerce platform')}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
          {t('Crie sua loja virtual em minutos', 'Launch your online store in minutes')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {t(
            'Escolha o plano ideal e comece a vender. Sem taxa de setup, cancele quando quiser.',
            'Pick the right plan and start selling. No setup fee, cancel anytime.',
          )}
        </p>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : plans.length === 0 ? (
          /* Fallback static plans when API not authenticated */
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Free',
                price: 'R$ 0',
                period: t('/mês', '/mo'),
                popular: false,
                features: [
                  t('1 loja', '1 store'),
                  t('Até 10 produtos', 'Up to 10 products'),
                  t('Checkout integrado', 'Integrated checkout'),
                  t('Suporte por email', 'Email support'),
                ],
              },
              {
                name: 'Pro',
                price: 'R$ 79',
                period: t('/mês', '/mo'),
                popular: true,
                features: [
                  t('Até 3 lojas', 'Up to 3 stores'),
                  t('Produtos ilimitados', 'Unlimited products'),
                  t('Domínio personalizado', 'Custom domain'),
                  t('Relatórios avançados', 'Advanced reports'),
                  t('Suporte prioritário', 'Priority support'),
                ],
              },
              {
                name: 'Enterprise',
                price: 'R$ 199',
                period: t('/mês', '/mo'),
                popular: false,
                features: [
                  t('Lojas ilimitadas', 'Unlimited stores'),
                  t('Produtos ilimitados', 'Unlimited products'),
                  t('API dedicada', 'Dedicated API'),
                  t('Gerente de conta', 'Account manager'),
                  t('SLA garantido', 'Guaranteed SLA'),
                ],
              },
            ].map((plan) => (
              <PlanCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                popular={plan.popular}
                ctaHref="/login"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                price={formatPrice(plan.priceCents, plan.currency)}
                period={plan.billingPeriod === 'MONTHLY' ? t('/mês', '/mo') : t('/ano', '/yr')}
                features={plan.features}
                popular={plan.isPopular}
                ctaHref="/login"
                limits={[
                  plan.maxStores > 0 ? `${plan.maxStores} ${t('loja(s)', 'store(s)')}` : t('Lojas ilimitadas', 'Unlimited stores'),
                  plan.maxProducts ? `${t('Até', 'Up to')} ${plan.maxProducts} ${t('produtos', 'products')}` : t('Produtos ilimitados', 'Unlimited products'),
                ]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lojaki — {t('Todos os direitos reservados.', 'All rights reserved.')}
      </footer>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  popular,
  ctaHref,
  limits,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  ctaHref: string;
  limits?: string[];
}) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition-shadow hover:shadow-lg ${
        popular
          ? 'border-primary bg-card shadow-md ring-1 ring-primary/20'
          : 'border-border bg-card'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground">
          {t('Mais popular', 'Most popular')}
        </span>
      )}

      <h3 className="text-lg font-bold text-foreground">{name}</h3>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>

      {limits && limits.length > 0 && (
        <div className="mt-3 space-y-1">
          {limits.map((l, i) => (
            <p key={i} className="text-xs font-medium text-muted-foreground">
              {l}
            </p>
          ))}
        </div>
      )}

      <ul className="mt-5 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-6 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          popular
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
      >
        {t('Começar agora', 'Get started')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
