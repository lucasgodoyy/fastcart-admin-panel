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
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
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
import { useTabFromPath } from "../hooks/use-tab-from-path";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminService } from "@/services/super-admin";
import type { SubscriptionPlan, StoreSubscription, SubscriptionStats } from "@/types/super-admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

/* ── helpers ── */
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}
function planIcon(slug: string) {
  switch (slug) {
    case "free": return Sparkles;
    case "basic": return Rocket;
    case "pro": return Crown;
    case "business": return Gem;
    default: return CreditCard;
  }
}
function planColor(slug: string) {
  switch (slug) {
    case "free": return "sa-text-secondary";
    case "basic": return "sa-info";
    case "pro": return "sa-accent";
    case "business": return "sa-success";
    default: return "sa-accent";
  }
}
function planGradient(slug: string) {
  switch (slug) {
    case "free": return "from-[hsl(var(--sa-surface))] to-[hsl(var(--sa-surface-hover))]";
    case "basic": return "from-[hsl(var(--sa-info-subtle))] to-[hsl(var(--sa-surface))]";
    case "pro": return "from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-surface))]";
    case "business": return "from-[hsl(var(--sa-success-subtle))] to-[hsl(var(--sa-surface))]";
    default: return "from-[hsl(var(--sa-surface))] to-[hsl(var(--sa-surface-hover))]";
  }
}

const subscriptionsTabRouteMap = { plans: "", subscribers: "subscribers", billing: "billing" };

/* ── Initial state for the create/edit dialog ── */
const emptyPlanForm = {
  name: "",
  slug: "",
  description: "",
  priceCents: 0,
  billingPeriod: "MONTHLY",
  sortOrder: 0,
  isPopular: false,
  isActive: true,
  maxStores: 1,
  maxProducts: undefined as number | undefined,
  features: [] as string[],
  featuresText: "",
};

export function SaSubscriptionsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/subscriptions", subscriptionsTabRouteMap, "plans");
  const queryClient = useQueryClient();

  /* ── Data fetching ── */
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["sa-subscription-plans"],
    queryFn: () => superAdminService.listPlans({ page: 0, size: 50 }),
  });

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ["sa-subscriptions"],
    queryFn: () => superAdminService.listSubscriptions({ page: 0, size: 50 }),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: () => superAdminService.getSubscriptionStats(),
  });

  const plans: SubscriptionPlan[] = plansData?.content ?? [];
  const subscriptions: StoreSubscription[] = subsData?.content ?? [];

  /* ── Mutations ── */
  const togglePlanMutation = useMutation({
    mutationFn: (planId: number) => superAdminService.togglePlanActive(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-subscription-plans"] });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: Parameters<typeof superAdminService.createPlan>[0]) => superAdminService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-subscription-plans"] });
      setDialogOpen(false);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof superAdminService.updatePlan>[1] }) =>
      superAdminService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-subscription-plans"] });
      setDialogOpen(false);
    },
  });

  const cancelSubMutation = useMutation({
    mutationFn: (storeId: number) => superAdminService.cancelSubscription(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["sa-subscription-stats"] });
    },
  });

  /* ── Dialog state ── */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState(emptyPlanForm);

  function openCreateDialog() {
    setEditingPlan(null);
    setForm(emptyPlanForm);
    setDialogOpen(true);
  }

  function openEditDialog(plan: SubscriptionPlan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      priceCents: plan.priceCents,
      billingPeriod: plan.billingPeriod,
      sortOrder: plan.sortOrder,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      maxStores: plan.maxStores,
      maxProducts: plan.maxProducts ?? undefined,
      features: plan.features,
      featuresText: plan.features.join("\n"),
    });
    setDialogOpen(true);
  }

  function handleSavePlan() {
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      priceCents: form.priceCents,
      billingPeriod: form.billingPeriod,
      sortOrder: form.sortOrder,
      isPopular: form.isPopular,
      isActive: form.isActive,
      maxStores: form.maxStores,
      maxProducts: form.maxProducts ?? undefined,
      features: form.featuresText.split("\n").map(s => s.trim()).filter(Boolean),
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: payload });
    } else {
      createPlanMutation.mutate(payload);
    }
  }

  const isSaving = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Assinaturas & Planos"
        description="Gerencie planos de assinatura e faturamento da plataforma"
        actions={
          <Button
            onClick={openCreateDialog}
            className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Plano
          </Button>
        }
      />

      {/* ── Stats ── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <div className="col-span-4 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--sa-accent))]" />
          </div>
        ) : stats ? (
          <>
            <SaStatCard title="MRR" value={formatCurrency(stats.mrrCents)} icon={DollarSign} color="success" />
            <SaStatCard title="Assinantes Ativos" value={String(stats.activeSubscribers)} icon={Users} color="accent" />
            <SaStatCard title="Churn Rate" value={`${stats.churnRatePercent.toFixed(1)}%`} icon={TrendingUp} color="warning" />
            <SaStatCard title="Total Assinantes" value={String(stats.totalSubscribers)} icon={CreditCard} color="info" />
          </>
        ) : null}
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
          {plansLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sa-accent))]" />
            </div>
          ) : plans.length === 0 ? (
            <SaCard>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-10 w-10 text-[hsl(var(--sa-text-muted))] mb-3" />
                <p className="text-[14px] text-[hsl(var(--sa-text-secondary))]">Nenhum plano cadastrado</p>
                <Button onClick={openCreateDialog} variant="outline" className="mt-4 rounded-xl text-[12px]">
                  <Plus className="h-4 w-4 mr-1" /> Criar primeiro plano
                </Button>
              </div>
            </SaCard>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const Icon = planIcon(plan.slug);
                const color = planColor(plan.slug);
                const gradient = planGradient(plan.slug);
                return (
                  <motion.div
                    key={plan.id}
                    variants={fadeInUp}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`relative rounded-2xl border ${plan.isPopular ? "border-[hsl(var(--sa-accent))] sa-pulse-glow" : "border-[hsl(var(--sa-border-subtle))]"} bg-gradient-to-b ${gradient} p-6 transition-all ${!plan.isActive ? "opacity-60" : ""}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--sa-accent))] px-3 py-1 text-[10px] font-bold text-white">
                        MAIS POPULAR
                      </div>
                    )}

                    {!plan.isActive && (
                      <div className="absolute top-3 right-3 rounded-full bg-[hsl(var(--sa-danger-subtle))] px-2 py-0.5 text-[9px] font-bold text-[hsl(var(--sa-danger))]">
                        INATIVO
                      </div>
                    )}

                    <div className="mb-4">
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--${color}-subtle))] mb-3`}>
                        <Icon className={`h-5 w-5 text-[hsl(var(--${color}))]`} />
                      </div>
                      <h3 className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[28px] font-bold text-[hsl(var(--sa-text))]">{formatCurrency(plan.priceCents)}</span>
                        <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">/{plan.billingPeriod === "MONTHLY" ? "mês" : plan.billingPeriod === "YEARLY" ? "ano" : plan.billingPeriod.toLowerCase()}</span>
                      </div>
                      {plan.description && (
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mt-1 line-clamp-2">{plan.description}</p>
                      )}
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
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{plan.subscriberCount} assinante(s)</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePlanMutation.mutate(plan.id)}
                          className="text-[11px] text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] p-0 h-auto"
                          title={plan.isActive ? "Desativar" : "Ativar"}
                        >
                          {plan.isActive ? <ToggleRight className="h-4 w-4 text-[hsl(var(--sa-success))]" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                          className="text-[11px] text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] gap-1 p-0 h-auto"
                        >
                          Editar <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </TabsContent>

        {/* Subscribers tab */}
        <TabsContent value="subscribers" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            {subsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sa-accent))]" />
              </div>
            ) : (
              <SaTableCard title="Assinantes" subtitle={`${subsData?.totalElements ?? 0} assinante(s)`}>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Plano</TableHead>
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">MRR</TableHead>
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Próximo Período</TableHead>
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Cliente desde</TableHead>
                      <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-[hsl(var(--sa-text-muted))] text-[13px]">
                          Nenhuma assinatura encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((sub, i) => (
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
                              <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{sub.storeSlug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-[12px] font-semibold text-[hsl(var(--sa-accent))]">{sub.planName}</span>
                          </TableCell>
                          <TableCell><SaStatusBadge status={sub.status} /></TableCell>
                          <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                            {formatCurrency(sub.planPriceCents)}
                          </TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                            {formatDate(sub.currentPeriodEnd)}
                          </TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                            {formatDate(sub.createdAt)}
                          </TableCell>
                          <TableCell>
                            {sub.status !== "CANCELED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelSubMutation.mutate(sub.storeId)}
                                disabled={cancelSubMutation.isPending}
                                className="text-[11px] text-[hsl(var(--sa-danger))] hover:text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] h-7 rounded-lg"
                              >
                                Cancelar
                              </Button>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </SaTableCard>
            )}
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
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--sa-accent))]" />
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">MRR Atual</span>
                    <span className="text-[14px] font-bold text-[hsl(var(--sa-success))]">{formatCurrency(stats.mrrCents)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">ARR Projetado</span>
                    <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{formatCurrency(stats.mrrCents * 12)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Assinantes Ativos</span>
                    <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{stats.activeSubscribers}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Em Trial</span>
                    <span className="text-[14px] font-bold text-[hsl(var(--sa-info))]">{stats.trialingSubscribers}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Churn Rate</span>
                    <span className="text-[14px] font-bold text-[hsl(var(--sa-danger))]">{stats.churnRatePercent.toFixed(1)}%</span>
                  </div>
                </div>
              ) : null}
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Plan Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">
              {editingPlan ? `Editar Plano — ${editingPlan.name}` : "Novo Plano"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Pro"
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="pro"
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descrição do plano..."
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px] min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Preço (centavos)</Label>
                <Input
                  type="number"
                  value={form.priceCents}
                  onChange={(e) => setForm(f => ({ ...f, priceCents: parseInt(e.target.value) || 0 }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Max Lojas</Label>
                <Input
                  type="number"
                  value={form.maxStores}
                  onChange={(e) => setForm(f => ({ ...f, maxStores: parseInt(e.target.value) || 1 }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Max Produtos</Label>
                <Input
                  type="number"
                  value={form.maxProducts ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, maxProducts: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="Ilimitado"
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Ordem</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Período</Label>
                <select
                  value={form.billingPeriod}
                  onChange={(e) => setForm(f => ({ ...f, billingPeriod: e.target.value }))}
                  className="w-full h-9 rounded-xl bg-[hsl(var(--sa-bg))] border border-[hsl(var(--sa-border-subtle))] text-[13px] text-[hsl(var(--sa-text))] px-3"
                >
                  <option value="MONTHLY">Mensal</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPopular}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isPopular: v }))}
                />
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Mais Popular</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))}
                />
                <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Ativo</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Features (uma por linha)</Label>
              <Textarea
                value={form.featuresText}
                onChange={(e) => setForm(f => ({ ...f, featuresText: e.target.value }))}
                placeholder={"1 loja\n500 produtos\nSuporte prioritário"}
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] rounded-xl text-[13px] min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl text-[12px]">
              Cancelar
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={isSaving || !form.name || !form.slug}
              className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl text-[12px] gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingPlan ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
