"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Crown,
  Gem,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  Check,
  ArrowUpRight,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ── Plan cards ── */
const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    icon: Sparkles,
    color: "sa-text-secondary",
    features: ["1 loja", "50 produtos", "E-mail suporte", "Domínio compartilhado"],
    subscribers: 45,
    gradient: "from-[hsl(var(--sa-surface))] to-[hsl(var(--sa-surface-hover))]",
  },
  {
    name: "Basic",
    price: "R$ 49",
    period: "/mês",
    icon: Rocket,
    color: "sa-info",
    features: ["1 loja", "500 produtos", "Chat suporte", "Domínio próprio", "SSL grátis"],
    subscribers: 67,
    gradient: "from-[hsl(var(--sa-info-subtle))] to-[hsl(var(--sa-surface))]",
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: "/mês",
    icon: Crown,
    color: "sa-accent",
    popular: true,
    features: ["3 lojas", "Produtos ilimitados", "Suporte prioritário", "Domínios custom", "API access", "Afiliados"],
    subscribers: 134,
    gradient: "from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-surface))]",
  },
  {
    name: "Business",
    price: "R$ 399",
    period: "/mês",
    icon: Gem,
    color: "sa-success",
    features: ["Lojas ilimitadas", "Tudo do Pro", "Account manager", "SLA 99.9%", "White label", "Integrações custom"],
    subscribers: 23,
    gradient: "from-[hsl(var(--sa-success-subtle))] to-[hsl(var(--sa-surface))]",
  },
];

const mockSubscribers = [
  { id: 1, store: "Fashion Store", email: "joao@fashion.com", plan: "Pro", status: "ACTIVE", mrr: "R$ 149", nextBill: "15/03/2026", since: "Jan 2024" },
  { id: 2, store: "TechGadgets", email: "tech@gadgets.com", plan: "Pro", status: "ACTIVE", mrr: "R$ 149", nextBill: "20/03/2026", since: "Mar 2024" },
  { id: 3, store: "Casa Decor", email: "casa@decor.com", plan: "Business", status: "ACTIVE", mrr: "R$ 399", nextBill: "01/03/2026", since: "Mai 2024" },
  { id: 4, store: "SportLife", email: "sport@life.com", plan: "Trial", status: "TRIAL", mrr: "R$ 0", nextBill: "—", since: "Fev 2026" },
  { id: 5, store: "Beleza Natural", email: "beleza@natural.com", plan: "Basic", status: "ACTIVE", mrr: "R$ 49", nextBill: "10/03/2026", since: "Ago 2024" },
];

export function SaSubscriptionsPage() {
  const [tab, setTab] = useState("plans");

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Assinaturas & Planos"
        description="Gerencie planos de assinatura e faturamento da plataforma"
        actions={
          <Button className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2">
            <CreditCard className="h-4 w-4" /> Configurar Stripe
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="MRR" value="R$ 42.8K" icon={DollarSign} color="success" trend={{ value: 18, label: "" }} />
        <SaStatCard title="Assinantes Ativos" value="269" icon={Users} color="accent" trend={{ value: 12, label: "" }} />
        <SaStatCard title="Churn Rate" value="2.3%" icon={TrendingUp} color="warning" />
        <SaStatCard title="LTV Médio" value="R$ 1.847" icon={CreditCard} color="info" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Planos
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Assinantes
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Faturamento
          </TabsTrigger>
        </TabsList>

        {/* Plans tab */}
        <TabsContent value="plans" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  variants={fadeInUp}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`relative rounded-2xl border ${plan.popular ? "border-[hsl(var(--sa-accent))] sa-pulse-glow" : "border-[hsl(var(--sa-border-subtle))]"} bg-gradient-to-b ${plan.gradient} p-6 transition-all`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--sa-accent))] px-3 py-1 text-[10px] font-bold text-white">
                      MAIS POPULAR
                    </div>
                  )}

                  <div className="mb-4">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--${plan.color}-subtle))] mb-3`}>
                      <Icon className={`h-5 w-5 text-[hsl(var(--${plan.color}))]`} />
                    </div>
                    <h3 className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[28px] font-bold text-[hsl(var(--sa-text))]">{plan.price}</span>
                      <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--sa-success))]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{plan.subscribers} assinantes</span>
                    <Button variant="ghost" size="sm" className="text-[11px] text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] gap-1 p-0 h-auto">
                      Editar <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* Subscribers tab */}
        <TabsContent value="subscribers" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Assinantes" subtitle={`${mockSubscribers.length} assinante(s)`}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Plano</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">MRR</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Próxima Cobrança</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Cliente desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubscribers.map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{sub.store}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{sub.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[12px] font-semibold text-[hsl(var(--sa-accent))]">{sub.plan}</span>
                      </TableCell>
                      <TableCell><SaStatusBadge status={sub.status} /></TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{sub.mrr}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{sub.nextBill}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{sub.since}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* Billing tab */}
        <TabsContent value="billing" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Integração Stripe</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Status da Conexão</span>
                  <span className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--sa-warning))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--sa-warning))]" /> Não configurado
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Webhooks</span>
                  <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">Pendente</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Modo</span>
                  <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">Test</span>
                </div>
                <Button className="w-full bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl mt-2">
                  Conectar Stripe
                </Button>
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Resumo de Faturamento</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">MRR Atual</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-success))]">R$ 42.847</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">ARR Projetado</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">R$ 514.164</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Cobranças este mês</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">269</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Falhas de cobrança</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-danger))]">3</span>
                </div>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
