"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
import { superAdminService } from "@/services/super-admin";
import type { SubscriptionPlan, StoreSubscription, SubscriptionStats } from "@/types/super-admin";

const planIcons: Record<string, React.ElementType> = {
  free: Sparkles, basic: Rocket, pro: Crown, business: Gem,
};
const planColors: Record<string, string> = {
  free: "sa-text-secondary", basic: "sa-info", pro: "sa-accent", business: "sa-success",
};
const planGradients: Record<string, string> = {
  free: "from-[hsl(var(--sa-surface))] to-[hsl(var(--sa-surface-hover))]",
  basic: "from-[hsl(var(--sa-info-subtle))] to-[hsl(var(--sa-surface))]",
  pro: "from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-surface))]",
  business: "from-[hsl(var(--sa-success-subtle))] to-[hsl(var(--sa-surface))]",
};

export function SaSubscriptionsPage() {
  const [tab, setTab] = useState("plans");

  const { data: plansData } = useQuery({
    queryKey: ["sa-plans"],
    queryFn: () => superAdminService.listPlans({ size: 50 }),
  });

  const { data: subsData } = useQuery({
    queryKey: ["sa-subscriptions"],
    queryFn: () => superAdminService.listSubscriptions({ size: 50 }),
    enabled: tab === "subscribers" || tab === "billing",
  });

  const { data: stats } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const plans = plansData?.content ?? [];
  const subs = subsData?.content ?? [];
  const fmt = (n?: number) => (n ?? 0).toLocaleString("pt-BR");
  const fmtMoney = (n?: number) => `R$ ${(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

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
        <SaStatCard title="MRR" value={fmtMoney(stats?.mrr)} icon={DollarSign} color="success" trend={{ value: 18, label: "" }} />
        <SaStatCard title="Assinantes Ativos" value={fmt(stats?.activeSubscriptions)} icon={Users} color="accent" trend={{ value: 12, label: "" }} />
        <SaStatCard title="Churn Rate" value={`${(stats?.churnRate ?? 0).toFixed(1)}%`} icon={TrendingUp} color="warning" />
        <SaStatCard title="LTV Médio" value={fmtMoney(stats?.avgLifetimeValue)} icon={CreditCard} color="info" />
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

        <TabsContent value="plans" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const slug = plan.slug?.toLowerCase() ?? plan.name.toLowerCase();
              const Icon = planIcons[slug] ?? Sparkles;
              const color = planColors[slug] ?? "sa-text-secondary";
              const gradient = planGradients[slug] ?? planGradients.free;
              const isPopular = slug === "pro";
              const features: string[] = (() => { try { return JSON.parse(plan.featuresJson || "[]"); } catch { return []; } })();
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`relative rounded-2xl border ${isPopular ? "border-[hsl(var(--sa-accent))] sa-pulse-glow" : "border-[hsl(var(--sa-border-subtle))]"} bg-gradient-to-b ${gradient} p-6 transition-all`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--sa-accent))] px-3 py-1 text-[10px] font-bold text-white">
                      MAIS POPULAR
                    </div>
                  )}
                  <div className="mb-4">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--${color}-subtle))] mb-3`}>
                      <Icon className={`h-5 w-5 text-[hsl(var(--${color}))]`} />
                    </div>
                    <h3 className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[28px] font-bold text-[hsl(var(--sa-text))]">R$ {plan.monthlyPrice.toLocaleString("pt-BR")}</span>
                      <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">/mês</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--sa-success))]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{plan.active ? "Ativo" : "Inativo"}</span>
                    <Button variant="ghost" size="sm" className="text-[11px] text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] gap-1 p-0 h-auto">
                      Editar <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Assinantes" subtitle={`${subsData?.totalElements ?? 0} assinante(s)`}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Plano</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">MRR</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Período Atual</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Cliente desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{sub.storeName}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{sub.storeEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[12px] font-semibold text-[hsl(var(--sa-accent))]">{sub.planName}</span>
                      </TableCell>
                      <TableCell><SaStatusBadge status={sub.status} /></TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">R$ {sub.monthlyPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{new Date(sub.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

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
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-success))]">{fmtMoney(stats?.mrr)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">ARR Projetado</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{fmtMoney((stats?.mrr ?? 0) * 12)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Assinantes Ativos</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{fmt(stats?.activeSubscriptions)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Cancelamentos</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-danger))]">{fmt(stats?.cancelledSubscriptions)}</span>
                </div>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
