'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Rocket,
  Crown,
  Gem,
  Store,
  Zap,
} from 'lucide-react';

// --- Static plan data (matches V64 DB seeds) ---------------------------------
const PLANS = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    description: 'Ideal para testar a plataforma.',
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    maxProducts: 50,
    maxStaff: 1,
    maxStores: 1,
    trialDays: 0,
    isPopular: false,
    ctaLabel: 'ComeÃ§ar grÃ¡tis',
    features: [
      '1 loja',
      'AtÃ© 50 produtos',
      'Certificado SSL',
      'SubdomÃ­nio Lojaki',
      'Suporte por e-mail',
      'CatÃ¡logo online',
      'Checkout bÃ¡sico',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para quem estÃ¡ comeÃ§ando e quer vender mais.',
    icon: Rocket,
    monthlyPrice: 49,
    annualPrice: 470,
    maxProducts: 500,
    maxStaff: 2,
    maxStores: 1,
    trialDays: 14,
    isPopular: false,
    ctaLabel: 'Iniciar 14 dias grÃ¡tis',
    features: [
      '1 loja',
      'AtÃ© 500 produtos',
      'DomÃ­nio prÃ³prio',
      'SSL grÃ¡tis',
      'Boleto BancÃ¡rio',
      'Mercado Pago',
      'Carrinho abandonado',
      'WhatsApp integrado',
      'RelatÃ³rios bÃ¡sicos',
      'PersonalizaÃ§Ã£o visual',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Para lojas em crescimento com recursos avanÃ§ados.',
    icon: Crown,
    monthlyPrice: 99,
    annualPrice: 950,
    maxProducts: 5000,
    maxStaff: 5,
    maxStores: 2,
    trialDays: 14,
    isPopular: true,
    ctaLabel: 'Iniciar 14 dias grÃ¡tis',
    features: [
      '2 lojas',
      'AtÃ© 5.000 produtos',
      'Tudo do Starter',
      'Stripe Connect',
      'PIX automÃ¡tico',
      'Google Shopping',
      'Facebook Pixel',
      'Afiliados',
      'Blog integrado',
      'Cupons & promoÃ§Ãµes',
      'DomÃ­nios customizados',
      'API Access',
      'Suporte prioritÃ¡rio',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para operaÃ§Ãµes de alto volume com suporte dedicado.',
    icon: Gem,
    monthlyPrice: 149,
    annualPrice: 1430,
    maxProducts: null,
    maxStaff: null,
    maxStores: null,
    trialDays: 30,
    isPopular: false,
    ctaLabel: 'Iniciar 30 dias grÃ¡tis',
    features: [
      'Lojas ilimitadas',
      'Produtos ilimitados',
      'Tudo do Plus',
      'Equipe ilimitada',
      'Account Manager',
      'SLA 99,9%',
      'White label',
      'IntegraÃ§Ãµes customizadas',
      'Multi-moeda',
      'RelatÃ³rios avanÃ§ados',
      'Google Tag Manager',
      'Suporte 24/7',
    ],
  },
] as const;

// --- Feature comparison rows --------------------------------------------------
const COMPARISON = [
  {
    category: 'Loja',
    rows: [
      { label: 'NÃºmero de lojas', values: ['1', '1', '2', 'Ilimitado'] },
      { label: 'Produtos', values: ['50', '500', '5.000', 'Ilimitado'] },
      { label: 'Membros da equipe', values: ['1', '2', '5', 'Ilimitado'] },
      { label: 'DomÃ­nio prÃ³prio', values: [false, true, true, true] },
      { label: 'Certificado SSL', values: [true, true, true, true] },
    ],
  },
  {
    category: 'Pagamentos',
    rows: [
      { label: 'Checkout bÃ¡sico', values: [true, true, true, true] },
      { label: 'Boleto BancÃ¡rio', values: [false, true, true, true] },
      { label: 'Mercado Pago', values: [false, true, true, true] },
      { label: 'PIX automÃ¡tico', values: [false, false, true, true] },
      { label: 'Stripe Connect', values: [false, false, true, true] },
      { label: 'Multi-moeda', values: [false, false, false, true] },
    ],
  },
  {
    category: 'Marketing',
    rows: [
      { label: 'Carrinho abandonado', values: [false, true, true, true] },
      { label: 'WhatsApp integrado', values: [false, true, true, true] },
      { label: 'Cupons & promoÃ§Ãµes', values: [false, false, true, true] },
      { label: 'Google Shopping', values: [false, false, true, true] },
      { label: 'Facebook Pixel', values: [false, false, true, true] },
      { label: 'Blog integrado', values: [false, false, true, true] },
      { label: 'Programa de afiliados', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Suporte',
    rows: [
      { label: 'Suporte por e-mail', values: [true, true, true, true] },
      { label: 'Chat de suporte', values: [false, true, true, true] },
      { label: 'Suporte prioritÃ¡rio', values: [false, false, true, true] },
      { label: 'Account Manager', values: [false, false, false, true] },
      { label: 'Suporte 24/7', values: [false, false, false, true] },
      { label: 'SLA 99,9%', values: [false, false, false, true] },
    ],
  },
];

const planColors: Record<string, string> = {
  gratuito: 'text-slate-600',
  starter: 'text-blue-600',
  plus: 'text-emerald-600',
  pro: 'text-teal-700',
};

const planBg: Record<string, string> = {
  gratuito: 'bg-slate-50 dark:bg-slate-900/40',
  starter: 'bg-blue-50 dark:bg-blue-900/20',
  plus: 'bg-emerald-50 dark:bg-emerald-900/20',
  pro: 'bg-teal-50 dark:bg-teal-900/20',
};

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const fmtPrice = (monthly: number, yearly: number) => {
    const price = annual ? Math.round(yearly / 12) : monthly;
    if (price === 0) return 'R$0';
    return `R$${price}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* -- Nav --------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Lojaki</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/login?register=true"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Criar conta grÃ¡tis
            </Link>
          </div>
        </div>
      </header>

      {/* -- Hero --------------------------------------------------- */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Planos simples, sem surpresas
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Escolha o plano ideal
          <br />
          <span className="text-primary">para sua loja</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Comece grÃ¡tis, faÃ§a upgrade quando precisar. Sem taxa de setup, cancele quando quiser.
        </p>

        {/* -- Monthly / Annual toggle ------------------------------- */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !annual
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              annual
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400">
              -20%
            </span>
          </button>
        </div>
      </section>

      {/* -- Plan Cards --------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const color = planColors[plan.id];
            const bg = planBg[plan.id];

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-lg border p-6 transition-shadow hover:shadow-lg ${
                  plan.isPopular
                    ? 'border-primary ring-2 ring-primary/25 bg-card shadow-md'
                    : 'border-border bg-card'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                      ? Mais popular
                    </span>
                  </div>
                )}

                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>

                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{plan.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">
                    {plan.monthlyPrice === 0
                      ? 'GrÃ¡tis'
                      : fmtPrice(plan.monthlyPrice, plan.annualPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-sm text-muted-foreground">/mÃªs</span>
                  )}
                </div>
                {annual && plan.annualPrice > 0 && (
                  <p className="mt-0.5 text-xs text-green-600">
                    R${plan.annualPrice}/ano Â economia de R${(plan.monthlyPrice * 12 - plan.annualPrice)}
                  </p>
                )}
                {plan.trialDays > 0 && (
                  <p className="mt-1 text-xs text-blue-600">? {plan.trialDays} dias grÃ¡tis</p>
                )}

                <div className="my-4 border-t border-border" />

                <div className="mb-4 space-y-0.5 text-[11px] text-muted-foreground">
                  <p>
                    {plan.maxProducts == null
                      ? '8 produtos'
                      : `AtÃ© ${plan.maxProducts} produtos`}
                  </p>
                  <p>
                    {plan.maxStaff == null ? '8 membros' : `AtÃ© ${plan.maxStaff} membros`}
                  </p>
                  <p>
                    {plan.maxStores == null ? '8 lojas' : `AtÃ© ${plan.maxStores} loja${plan.maxStores > 1 ? 's' : ''}`}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-1.5">
                  {plan.features.slice(0, 8).map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-xs text-foreground"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 8 && (
                    <li className="pl-5 text-[10px] text-muted-foreground">
                      +{plan.features.length - 8} mais recursos
                    </li>
                  )}
                </ul>

                <Link
                  href="/login?register=true"
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    plan.isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : plan.monthlyPrice === 0
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'border border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  {plan.ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* -- Feature Comparison Table -------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          ComparaÃ§Ã£o completa de recursos
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 pl-6 pr-4 text-left text-xs font-semibold uppercase text-muted-foreground w-[35%]">
                  Recurso
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={`py-4 px-4 text-center text-sm font-bold ${planColors[p.id]}`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((section) => (
                <>
                  <tr key={`cat-${section.category}`} className="bg-muted/40">
                    <td
                      colSpan={5}
                      className="py-2 pl-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 pl-6 pr-4 text-sm text-foreground">{row.label}</td>
                      {row.values.map((val, i) => (
                        <td key={i} className="py-3 px-4 text-center">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <Check className="mx-auto h-4 w-4 text-green-600" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                            )
                          ) : (
                            <span className="text-xs font-medium text-foreground">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* -- FAQ / CTA ----------------------------------------------- */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">Pronto para comeÃ§ar?</h2>
          <p className="mt-3 text-muted-foreground">
            Crie sua loja hoje, de graÃ§a. NÃ£o precisamos de cartÃ£o de crÃ©dito.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?register=true"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Criar conta grÃ¡tis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              JÃ¡ tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* -- Footer ------------------------------------------------- */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        Â© {new Date().getFullYear()} Lojaki Â Todos os direitos reservados.
      </footer>
    </div>
  );
}
