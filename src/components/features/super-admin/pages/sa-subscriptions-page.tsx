"use client";

import { useState } from "react";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { SubscriptionPlan, StoreSubscription, SubscriptionStats, CreateOrUpdatePlanRequest } from "@/types/super-admin";

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

const emptyPlanForm: CreateOrUpdatePlanRequest = {
  name: "", slug: "", monthlyPrice: 0, annualPrice: null,
  maxProducts: 100, maxStores: 1, maxStaff: 2, featuresJson: "[]",
  stripePriceIdMonthly: null, stripePriceIdAnnual: null, active: true,
};

export function SaSubscriptionsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/subscriptions", { plans: "", subscribers: "subscribers", billing: "billing" }, "plans");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreateOrUpdatePlanRequest>(emptyPlanForm);
  const [featuresText, setFeaturesText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: (body: CreateOrUpdatePlanRequest) => superAdminService.createPlan(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-plans"] }); closeDialog(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: CreateOrUpdatePlanRequest }) => superAdminService.updatePlan(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-plans"] }); closeDialog(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => superAdminService.deletePlan(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-plans"] }); setDeleteConfirmId(null); },
  });
  const toggleMutation = useMutation({
    mutationFn: (id: number) => superAdminService.togglePlanActive(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-plans"] }); },
  });

  const plans = plansData?.content ?? [];
  const subs = subsData?.content ?? [];
  const fmt = (n?: number) => (n ?? 0).toLocaleString("pt-BR");
  const fmtMoney = (n?: number) => `R$ ${(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  function openCreate() {
    setEditingPlan(null);
    setFormData({ ...emptyPlanForm });
    setFeaturesText("");
    setDialogOpen(true);
  }
  function openEdit(plan: SubscriptionPlan) {
    setEditingPlan(plan);
    let features: string[] = [];
    try { features = JSON.parse(plan.featuresJson || "[]"); } catch { features = []; }
    setFormData({
      name: plan.name, slug: plan.slug, monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice, maxProducts: plan.maxProducts,
      maxStores: plan.maxStores, maxStaff: plan.maxStaff, featuresJson: plan.featuresJson,
      stripePriceIdMonthly: plan.stripePriceIdMonthly, stripePriceIdAnnual: plan.stripePriceIdAnnual,
      active: plan.active,
    });
    setFeaturesText(features.join("\n"));
    setDialogOpen(true);
  }
  function closeDialog() { setDialogOpen(false); setEditingPlan(null); setFormData({ ...emptyPlanForm }); setFeaturesText(""); }
  function handleSave() {
    const features = featuresText.split("\n").map(f => f.trim()).filter(Boolean);
    const body: CreateOrUpdatePlanRequest = { ...formData, featuresJson: JSON.stringify(features) };
    if (editingPlan) updateMutation.mutate({ id: editingPlan.id, body }); else createMutation.mutate(body);
  }
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Assinaturas & Planos"
        description="Gerencie planos de assinatura e faturamento da plataforma"
        actions={
          <div className="flex gap-2">
            <Button onClick={openCreate} className="bg-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/90 text-white rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Novo Plano
            </Button>
            <Button className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2">
              <CreditCard className="h-4 w-4" /> Configurar Stripe
            </Button>
          </div>
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
                  className={`relative rounded-2xl border ${isPopular ? "border-[hsl(var(--sa-accent))] sa-pulse-glow" : "border-[hsl(var(--sa-border-subtle))]"} bg-linear-to-b ${gradient} p-6 transition-all`}
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
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="text-[11px] text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-warning))] p-1 h-auto" title={plan.active ? "Desativar" : "Ativar"} onClick={() => toggleMutation.mutate(plan.id)}>
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[11px] text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] p-1 h-auto" onClick={() => openEdit(plan)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[11px] text-red-500 hover:text-red-400 p-1 h-auto" onClick={() => setDeleteConfirmId(plan.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* ── Create / Edit Plan Dialog ──────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plano" : "Criar Novo Plano"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Atualize as informações do plano de assinatura." : "Preencha os dados para criar um novo plano de assinatura."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Nome</Label>
                <Input id="plan-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Pro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-slug">Slug</Label>
                <Input id="plan-slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="Ex: pro" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-monthly">Preço Mensal (R$)</Label>
                <Input id="plan-monthly" type="number" step="0.01" value={formData.monthlyPrice} onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-annual">Preço Anual (R$)</Label>
                <Input id="plan-annual" type="number" step="0.01" value={formData.annualPrice ?? ""} onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value ? parseFloat(e.target.value) : null })} placeholder="Opcional" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-products">Máx. Produtos</Label>
                <Input id="plan-products" type="number" value={formData.maxProducts} onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-stores">Máx. Lojas</Label>
                <Input id="plan-stores" type="number" value={formData.maxStores} onChange={(e) => setFormData({ ...formData, maxStores: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-staff">Máx. Staff</Label>
                <Input id="plan-staff" type="number" value={formData.maxStaff} onChange={(e) => setFormData({ ...formData, maxStaff: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-stripe-monthly">Stripe Price ID (Mensal)</Label>
                <Input id="plan-stripe-monthly" value={formData.stripePriceIdMonthly ?? ""} onChange={(e) => setFormData({ ...formData, stripePriceIdMonthly: e.target.value || null })} placeholder="price_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-stripe-annual">Stripe Price ID (Anual)</Label>
                <Input id="plan-stripe-annual" value={formData.stripePriceIdAnnual ?? ""} onChange={(e) => setFormData({ ...formData, stripePriceIdAnnual: e.target.value || null })} placeholder="price_..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-features">Features (uma por linha)</Label>
              <textarea id="plan-features" className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Até 100 produtos\nSuporte por email\nDomínio customizado"} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="plan-active" checked={formData.active ?? true} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
              <Label htmlFor="plan-active">Plano ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.slug}>
              {isSaving ? "Salvando..." : editingPlan ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────── */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Plano</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
