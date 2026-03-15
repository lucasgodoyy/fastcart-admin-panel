"use client";

import Link from "next/link";
import { useState } from "react";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Crown,
  Gem,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  Check,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Power,
  RefreshCw,
  Ban,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { SubscriptionPlan, StoreSubscription } from "@/types/super-admin";

const planIcons: Record<string, React.ElementType> = {
  gratuito: Sparkles,
  starter: Rocket,
  plus: Crown,
  pro: Gem,
};
const planColors: Record<string, string> = {
  gratuito: "sa-text-secondary",
  starter: "sa-info",
  plus: "sa-accent",
  pro: "sa-success",
};
const planGradients: Record<string, string> = {
  gratuito: "from-[hsl(var(--sa-surface))] to-[hsl(var(--sa-surface-hover))]",
  starter: "from-[hsl(var(--sa-info-subtle))] to-[hsl(var(--sa-surface))]",
  plus: "from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-surface))]",
  pro: "from-[hsl(var(--sa-success-subtle))] to-[hsl(var(--sa-surface))]",
};

export function SaSubscriptionsPage() {
  const [tab, setTab] = useTabFromPath(
    "/super-admin/subscriptions",
    { plans: "", subscribers: "subscribers", billing: "billing" },
    "plans",
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [changePlanSub, setChangePlanSub] = useState<StoreSubscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ["sa-plans"],
    queryFn: () => superAdminService.listPlans({ size: 50 }),
  });
  const { data: subsData } = useQuery({
    queryKey: ["sa-subscriptions"],
    queryFn: () => superAdminService.listSubscriptions({ size: 100 }),
    enabled: tab === "subscribers" || tab === "billing",
  });
  const { data: stats } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => superAdminService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-plans"] });
      setDeleteConfirmId(null);
    },
  });
  const toggleMutation = useMutation({
    mutationFn: (id: number) => superAdminService.togglePlanActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sa-plans"] }),
  });
  const changePlanMutation = useMutation({
    mutationFn: ({ storeId, planId }: { storeId: number; planId: number }) =>
      superAdminService.changePlan(storeId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-subscriptions"] });
      setChangePlanSub(null);
      setSelectedPlanId("");
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (storeId: number) => superAdminService.cancelSubscription(storeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sa-subscriptions"] }),
  });

  const plans = plansData?.content ?? [];
  const subs = subsData?.content ?? [];

  const fmtCents = (cents?: number | null) =>
    `R$ ${((cents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmt = (n?: number) => (n ?? 0).toLocaleString("pt-BR");

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Assinaturas & Planos"
        description="Gerencie planos de assinatura e faturamento da plataforma"
        actions={
          <div className="flex gap-2">
            <Button
              asChild
              className="bg-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/90 text-white rounded-xl gap-2"
            >
              <Link href="/super-admin/subscriptions/plans/new">
              <Plus className="h-4 w-4" /> Novo Plano
              </Link>
            </Button>
          </div>
        }
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SaStatCard
          title="MRR"
          value={fmtCents(stats?.mrrCents)}
          icon={DollarSign}
          color="success"
          trend={{ value: 18, label: "" }}
        />
        <SaStatCard
          title="Assinantes Ativos"
          value={fmt(stats?.activeSubscriptions)}
          icon={Users}
          color="accent"
          trend={{ value: 12, label: "" }}
        />
        <SaStatCard
          title="Em Trial"
          value={fmt(stats?.trialSubscriptions)}
          icon={Sparkles}
          color="info"
        />
        <SaStatCard
          title="Churn Rate"
          value={`${(stats?.churnRate ?? 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="warning"
        />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger
            value="plans"
            className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]"
          >
            Planos
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]"
          >
            Assinantes
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]"
          >
            Faturamento
          </TabsTrigger>
        </TabsList>

        {/* ── Plans Tab ─────────────────────────────────────────────── */}
        <TabsContent value="plans" className="mt-6">
          {plans.length === 0 ? (
            <SaEmptyState
              icon={Sparkles}
              title="Nenhum plano cadastrado"
              description="Crie o primeiro plano de assinatura para começar a configurar o catálogo SaaS da plataforma."
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
              {plans.map((plan) => {
                const slug = plan.slug?.toLowerCase() ?? plan.name.toLowerCase();
                const Icon = planIcons[slug] ?? Sparkles;
                const color = planColors[slug] ?? "sa-text-secondary";
                const gradient = planGradients[slug] ?? planGradients.gratuito;
                return (
                  <motion.div
                    key={plan.id}
                    variants={fadeInUp}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className={`relative rounded-3xl border ${
                      plan.isPopular
                        ? "border-[hsl(var(--sa-accent))] shadow-[0_24px_60px_-32px_hsl(var(--sa-accent)/0.55)]"
                        : "border-[hsl(var(--sa-border-subtle))]"
                    } bg-linear-to-b ${gradient} p-6 transition-all`}
                  >
                    <div className="absolute inset-x-0 top-0 h-24 rounded-t-3xl bg-linear-to-r from-white/8 via-white/2 to-transparent pointer-events-none" />
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-6 rounded-full bg-[hsl(var(--sa-accent))] px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white">
                        MAIS POPULAR
                      </div>
                    )}
                    <div className="relative mb-5">
                      <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--sa-surface))]/80 backdrop-blur-sm">
                        <Icon className={`h-5 w-5 text-[hsl(var(--${color}))]`} />
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[18px] font-bold text-[hsl(var(--sa-text))]">{plan.name}</h3>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">
                            slug {plan.slug}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${plan.isActive ? "bg-emerald-500/12 text-emerald-300" : "bg-white/8 text-[hsl(var(--sa-text-muted))]"}`}
                        >
                          {plan.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="mt-4 flex items-end gap-2">
                        <span className="text-[28px] font-bold text-[hsl(var(--sa-text))]">
                          {fmtCents(plan.priceCents)}
                        </span>
                        <span className="pb-1 text-[11px] text-[hsl(var(--sa-text-muted))]">/mês</span>
                      </div>
                      {plan.annualPriceCents != null && (
                        <p className="mt-1 text-[11px] text-[hsl(var(--sa-success))]">
                          anual {fmtCents(plan.annualPriceCents)}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/8 bg-black/10 p-3 text-center backdrop-blur-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--sa-text-muted))]">Produtos</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--sa-text))]">
                          {plan.maxProducts == null ? "Ilimitado" : fmt(plan.maxProducts)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--sa-text-muted))]">Membros</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--sa-text))]">
                          {plan.maxStaff >= 999 ? "Ilimitado" : fmt(plan.maxStaff)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--sa-text-muted))]">Assinantes</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--sa-text))]">{fmt(plan.subscriberCount)}</p>
                      </div>
                    </div>

                    <ul className="mt-5 space-y-2">
                      {(plan.features ?? []).slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-[11px] text-[hsl(var(--sa-text-secondary))]"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--sa-success))]" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {(plan.features ?? []).length > 4 && (
                        <li className="pl-5 text-[10px] text-[hsl(var(--sa-text-muted))]">
                          +{plan.features.length - 4} benefícios adicionais
                        </li>
                      )}
                    </ul>

                    <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/8 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-warning))]"
                        title={plan.isActive ? "Desativar" : "Ativar"}
                        onClick={() => toggleMutation.mutate(plan.id)}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setDeleteConfirmId(plan.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-[hsl(var(--sa-accent))] px-3 text-white hover:bg-[hsl(var(--sa-accent-hover))]"
                        >
                          <Link href={`/super-admin/subscriptions/plans/${plan.id}`}>
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </TabsContent>

        {/* ── Subscribers Tab ────────────────────────────────────────── */}
        <TabsContent value="subscribers" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Assinantes" subtitle={`${subsData?.totalElements ?? 0} assinante(s)`}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">
                      Loja
                    </TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">
                      Plano
                    </TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">
                      MRR
                    </TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">
                      Vencimento
                    </TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">
                            {sub.storeName}
                          </p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                            {sub.storeSlug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[12px] font-semibold text-[hsl(var(--sa-accent))]">
                          {sub.planName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SaStatusBadge status={sub.status} />
                        {sub.blockedAt && (
                          <p className="text-[10px] text-red-500 mt-0.5">{sub.blockReason}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                        {fmtCents(sub.planPriceCents)}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {sub.currentPeriodEnd
                          ? new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")
                          : sub.trialEnd
                            ? `Trial até ${new Date(sub.trialEnd).toLocaleDateString("pt-BR")}`
                            : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-subtle))]"
                            title="Trocar plano"
                            onClick={() => {
                              setChangePlanSub(sub);
                              setSelectedPlanId(String(sub.planId));
                            }}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-red-500 hover:bg-red-500/10"
                            title="Cancelar assinatura"
                            onClick={() => cancelMutation.mutate(sub.storeId)}
                            disabled={cancelMutation.isPending}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* ── Billing Tab ────────────────────────────────────────────── */}
        <TabsContent value="billing" className="mt-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-6 lg:grid-cols-2"
          >
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">
                Integração Stripe
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Status da Conexão
                  </span>
                  <span className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--sa-warning))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--sa-warning))]" /> Não
                    configurado
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
                <Button disabled className="mt-2 w-full rounded-xl bg-[hsl(var(--sa-accent))] text-white opacity-60">
                  Stripe em breve
                </Button>
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">
                Resumo de Faturamento
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">MRR Atual</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-success))]">
                    {fmtCents(stats?.mrrCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    ARR Projetado
                  </span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">
                    {fmtCents((stats?.mrrCents ?? 0) * 12)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Assinantes Ativos
                  </span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">
                    {fmt(stats?.activeSubscriptions)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Em Trial</span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-info))]">
                    {fmt(stats?.trialSubscriptions)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Cancelamentos
                  </span>
                  <span className="text-[14px] font-bold text-[hsl(var(--sa-danger))]">
                    {fmt(stats?.canceledSubscriptions)}
                  </span>
                </div>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Change Plan Dialog ─────────────────────────────────────── */}
      <Dialog
        open={changePlanSub !== null}
        onOpenChange={(open) => {
          if (!open) {
            setChangePlanSub(null);
            setSelectedPlanId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Trocar Plano — {changePlanSub?.storeName}</DialogTitle>
            <DialogDescription>Selecione o novo plano para esta loja.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} — {fmtCents(p.priceCents)}/mês
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangePlanSub(null);
                setSelectedPlanId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedPlanId || changePlanMutation.isPending}
              onClick={() => {
                if (changePlanSub && selectedPlanId) {
                  changePlanMutation.mutate({
                    storeId: changePlanSub.storeId,
                    planId: parseInt(selectedPlanId),
                  });
                }
              }}
            >
              {changePlanMutation.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────── */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Plano</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
