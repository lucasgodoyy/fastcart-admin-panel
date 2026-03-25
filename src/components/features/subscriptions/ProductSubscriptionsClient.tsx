'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import productSubscriptionService from '@/services/admin/productSubscriptionService';
import { SubscriptionPlan, ProductSubscription, SubscriptionFrequency, SubscriptionStatus } from '@/types/product-subscription';
import { t } from '@/lib/admin-language';

const FREQ_LABELS: Record<SubscriptionFrequency, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMI_ANNUAL: 'Semestral',
  ANNUAL: 'Anual',
};

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Ativa', variant: 'default' },
  PAUSED: { label: 'Pausada', variant: 'secondary' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
};

const defaultPlanForm = {
  name: '',
  frequency: 'MONTHLY' as SubscriptionFrequency,
  discountPercent: 0,
  productId: '',
};

export function ProductSubscriptionsClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('plans');
  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState(defaultPlanForm);

  const { data: plans, isLoading: loadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: productSubscriptionService.listPlans,
  });

  const { data: subscriptionsData, isLoading: loadingSubs } = useQuery<{ content: ProductSubscription[] }>({
    queryKey: ['subscriptions'],
    queryFn: () => productSubscriptionService.listSubscriptions(),
    enabled: activeTab === 'subscriptions',
  });

  const createPlanMutation = useMutation({
    mutationFn: () => productSubscriptionService.createPlan({ ...planForm, productId: planForm.productId ? Number(planForm.productId) : 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscription-plans'] }); closePlanDialog(); toast.success(t('Plano criado!', 'Plan created!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const updatePlanMutation = useMutation({
    mutationFn: () => productSubscriptionService.updatePlan(editingPlan!.id, { ...planForm, productId: planForm.productId ? Number(planForm.productId) : 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscription-plans'] }); closePlanDialog(); toast.success(t('Plano atualizado!', 'Plan updated!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const togglePlanMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => productSubscriptionService.togglePlan(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription-plans'] }),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => productSubscriptionService.deletePlan(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscription-plans'] }); toast.success(t('Plano removido!', 'Plan removed!')); },
  });

  const cancelSubMutation = useMutation({
    mutationFn: (id: number) => productSubscriptionService.cancelSubscription(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subscriptions'] }); toast.success(t('Assinatura cancelada!', 'Subscription cancelled!')); },
  });

  function openPlanDialog(plan?: SubscriptionPlan) {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        frequency: plan.frequency,
        discountPercent: plan.discountPercent ?? 0,
        productId: plan.productId?.toString() || '',
      });
    } else {
      setEditingPlan(null);
      setPlanForm(defaultPlanForm);
    }
    setPlanDialog(true);
  }

  function closePlanDialog() {
    setPlanDialog(false);
    setEditingPlan(null);
  }

  const subscriptions = subscriptionsData?.content ?? [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Assinaturas de Produtos', 'Product Subscriptions')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Gerencie planos de assinatura e assinantes.', 'Manage subscription plans and subscribers.')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans"><RefreshCw className="mr-1.5 h-4 w-4" />{t('Planos', 'Plans')}</TabsTrigger>
          <TabsTrigger value="subscriptions"><Users className="mr-1.5 h-4 w-4" />{t('Assinaturas', 'Subscriptions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button size="sm" onClick={() => openPlanDialog()}>
              <Plus className="mr-1.5 h-4 w-4" />{t('Novo Plano', 'New Plan')}
            </Button>
          </div>

          {loadingPlans && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans?.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">{plan.name}</h3>
                  <button onClick={() => togglePlanMutation.mutate({ id: plan.id, active: !plan.active })}>
                    {plan.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                  </button>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{t('Frequência:', 'Frequency:')} <strong>{FREQ_LABELS[plan.frequency]}</strong></p>
                  {plan.discountPercent > 0 && <p>{t('Desconto:', 'Discount:')} <strong>{plan.discountPercent}%</strong></p>}
                  {plan.productName && <p>{t('Produto:', 'Product:')} {plan.productName}</p>}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <Button size="icon-xs" variant="ghost" onClick={() => openPlanDialog(plan)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(t('Excluir plano?', 'Delete plan?'))) deletePlanMutation.mutate(plan.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>

          {!loadingPlans && (!plans || plans.length === 0) && (
            <div className="flex flex-col items-center py-12"><RefreshCw className="h-10 w-10 text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">{t('Nenhum plano criado.', 'No plans created.')}</p></div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">#</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Plano', 'Plan')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Cliente', 'Customer')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Próximo Pedido', 'Next Order')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {loadingSubs && <tr><td colSpan={6} className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>}
                {subscriptions.map((sub) => {
                  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.ACTIVE;
                  return (
                    <tr key={sub.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono">#{sub.id}</td>
                      <td className="px-4 py-3 text-sm">{sub.planName || `Plan #${sub.planId}`}</td>
                      <td className="px-4 py-3 text-sm">{sub.customerName || `#${sub.customerId}`}</td>
                      <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{sub.nextOrderAt ? new Intl.DateTimeFormat('pt-BR').format(new Date(sub.nextOrderAt)) : '—'}</td>
                      <td className="px-4 py-3">
                        {sub.status === 'ACTIVE' && (
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(t('Cancelar assinatura?', 'Cancel subscription?'))) cancelSubMutation.mutate(sub.id); }}>
                            {t('Cancelar', 'Cancel')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loadingSubs && subscriptions.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('Nenhuma assinatura.', 'No subscriptions.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={planDialog} onOpenChange={(v) => !v && closePlanDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? t('Editar Plano', 'Edit Plan') : t('Novo Plano', 'New Plan')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{t('Nome', 'Name')}</Label><Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} /></div>
            <div>
              <Label>{t('Frequência', 'Frequency')}</Label>
              <select value={planForm.frequency} onChange={(e) => setPlanForm({ ...planForm, frequency: e.target.value as SubscriptionFrequency })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('Desconto %', 'Discount %')}</Label><Input type="number" value={planForm.discountPercent} onChange={(e) => setPlanForm({ ...planForm, discountPercent: Number(e.target.value) })} /></div>
              <div><Label>{t('ID do Produto', 'Product ID')}</Label><Input value={planForm.productId} onChange={(e) => setPlanForm({ ...planForm, productId: e.target.value })} placeholder={t('Opcional', 'Optional')} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closePlanDialog}>{t('Cancelar', 'Cancel')}</Button>
            <Button onClick={() => editingPlan ? updatePlanMutation.mutate() : createPlanMutation.mutate()} disabled={createPlanMutation.isPending || updatePlanMutation.isPending || !planForm.name}>
              {t('Salvar', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
