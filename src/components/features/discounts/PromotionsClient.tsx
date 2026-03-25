'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BadgePercent,
  Check,
  ChevronDown,
  Edit2,
  Info,
  Megaphone,
  Plus,
  ShoppingCart,
  Tag,
  Timer,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import promotionService from '@/services/sales/promotionService';
import productService from '@/services/catalog/product';
import categoryService from '@/services/catalog/categoryService';
import {
  DiscountValueType,
  Promotion,
  PromotionApplyScopeType,
  PromotionDiscountType,
  PromotionUpsertRequest,
  ProgressiveTier,
} from '@/types/promotion';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

// ── Constants ─────────────────────────────────────────────────────────────────

const DISCOUNT_TYPE_OPTIONS: { value: PromotionDiscountType; label: string; description: string }[] = [
  { value: 'BUY_X_PAY_Y', label: 'Compre X e pague Y', description: 'Ex: Compre 3 pague 2' },
  { value: 'PRICE_DISCOUNT', label: 'Desconto sobre preços', description: 'Percentual ou valor fixo em produtos/categorias' },
  { value: 'CROSS_SELLING', label: 'Cross selling', description: 'Compre A e ganhe desconto no produto B' },
  { value: 'PROGRESSIVE_DISCOUNT', label: 'Desconto progressivo', description: 'Quanto mais compra, maior o desconto' },
  { value: 'CART_DISCOUNT', label: 'Desconto no carrinho', description: 'Aplicado ao valor total do pedido' },
];

const SCOPE_OPTIONS: { value: PromotionApplyScopeType; label: string }[] = [
  { value: 'ENTIRE_STORE', label: 'Toda a loja' },
  { value: 'CATEGORIES', label: 'Categorias específicas' },
  { value: 'PRODUCTS', label: 'Produtos específicos' },
];

// ── Types ──────────────────────────────────────────────────────────────────────

type FormProgressiveTier = {
  minQty: string;
  discountValue: string;
  discountValueType: DiscountValueType;
};

type PromotionFormState = {
  name: string;
  discountType: PromotionDiscountType;
  // BUY_X_PAY_Y
  buyQuantity: string;
  payQuantity: string;
  // scopes
  buyScopeType: PromotionApplyScopeType;
  buyScopeTargetIds: number[];
  payScopeType: PromotionApplyScopeType;
  payScopeTargetIds: number[];
  // PRICE_DISCOUNT / CROSS_SELLING / CART_DISCOUNT
  discountValue: string;
  discountValueType: DiscountValueType;
  // CART_DISCOUNT
  minCartAmount: string;
  // PROGRESSIVE_DISCOUNT
  progressiveTiers: FormProgressiveTier[];
  // combine
  combineWithPriceDiscounts: boolean;
  combineWithFreeShipping: boolean;
  combineWithCartDiscounts: boolean;
  combineWithAppDiscounts: boolean;
  // limits
  dateType: 'unlimited' | 'period';
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const EMPTY_FORM: PromotionFormState = {
  name: '',
  discountType: 'BUY_X_PAY_Y',
  buyQuantity: '2',
  payQuantity: '1',
  buyScopeType: 'ENTIRE_STORE',
  buyScopeTargetIds: [],
  payScopeType: 'ENTIRE_STORE',
  payScopeTargetIds: [],
  discountValue: '10',
  discountValueType: 'PERCENTAGE',
  minCartAmount: '',
  progressiveTiers: [
    { minQty: '2', discountValue: '10', discountValueType: 'PERCENTAGE' },
    { minQty: '3', discountValue: '20', discountValueType: 'PERCENTAGE' },
  ],
  combineWithPriceDiscounts: false,
  combineWithFreeShipping: false,
  combineWithCartDiscounts: false,
  combineWithAppDiscounts: false,
  dateType: 'unlimited',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  active: true,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const apiError = (error: unknown, fallback: string): string => {
  const e = error as AxiosError<{ message?: string; error?: string }>;
  return e.response?.data?.message || e.response?.data?.error || fallback;
};

function formatRule(p: Promotion): string {
  switch (p.discountType) {
    case 'BUY_X_PAY_Y':
      return `Compre ${p.buyQuantity}, pague ${p.payQuantity}`;
    case 'PRICE_DISCOUNT':
      return p.discountValueType === 'FIXED'
        ? `R$ ${p.discountValue?.toFixed(2)} de desconto`
        : `${p.discountValue}% de desconto`;
    case 'CROSS_SELLING':
      return `Cross-selling ${p.discountValueType === 'FIXED' ? `R$ ${p.discountValue?.toFixed(2)}` : `${p.discountValue}%`} off`;
    case 'PROGRESSIVE_DISCOUNT':
      return 'Desconto progressivo';
    case 'CART_DISCOUNT':
      return p.discountValueType === 'FIXED'
        ? `R$ ${p.discountValue?.toFixed(2)} no carrinho`
        : `${p.discountValue}% no carrinho`;
    default:
      return '-';
  }
}

function discountTypeLabel(type: PromotionDiscountType): string {
  return DISCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function PromotionsClient() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<PromotionFormState>(EMPTY_FORM);
  const [buyPickerOpen, setBuyPickerOpen] = useState(false);
  const [payPickerOpen, setPayPickerOpen] = useState(false);

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: promotionService.listAll,
  });

  const needsProducts = dialogOpen && (form.buyScopeType === 'PRODUCTS' || form.payScopeType === 'PRODUCTS');
  const needsCategories = dialogOpen && (form.buyScopeType === 'CATEGORIES' || form.payScopeType === 'CATEGORIES');

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-for-promo'],
    queryFn: () => productService.listAll(),
    enabled: needsProducts,
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-promo'],
    queryFn: () => categoryService.list(),
    enabled: needsCategories,
  });

  const createMutation = useMutation({
    mutationFn: (req: PromotionUpsertRequest) => promotionService.create(req),
    onSuccess: () => {
      toast.success('Promoção criada com sucesso!');
      qc.invalidateQueries({ queryKey: ['promotions'] });
      closeDialog();
    },
    onError: (e) => toast.error(apiError(e, 'Erro ao criar promoção')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: PromotionUpsertRequest }) => promotionService.update(id, req),
    onSuccess: () => {
      toast.success('Promoção atualizada!');
      qc.invalidateQueries({ queryKey: ['promotions'] });
      closeDialog();
    },
    onError: (e) => toast.error(apiError(e, 'Erro ao atualizar promoção')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => promotionService.toggleActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
    onError: (e) => toast.error(apiError(e, 'Erro ao alterar status')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionService.delete(id),
    onSuccess: () => {
      toast.success('Promoção removida.');
      qc.invalidateQueries({ queryKey: ['promotions'] });
      setDeleteId(null);
    },
    onError: (e) => toast.error(apiError(e, 'Erro ao remover promoção')),
  });

  const stats = useMemo(() => {
    const active = promotions.filter((p) => p.active).length;
    return { total: promotions.length, active, inactive: promotions.length - active };
  }, [promotions]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(p: Promotion) {
    let tiers: FormProgressiveTier[] = EMPTY_FORM.progressiveTiers;
    if (p.progressiveRules) {
      try {
        const parsed: ProgressiveTier[] = JSON.parse(p.progressiveRules);
        tiers = parsed.map((t) => ({
          minQty: String(t.minQty),
          discountValue: String(t.discountValue),
          discountValueType: t.discountValueType,
        }));
      } catch { /* keep default */ }
    }
    setEditingId(p.id);
    setForm({
      name: p.name,
      discountType: p.discountType,
      buyQuantity: String(p.buyQuantity ?? 2),
      payQuantity: String(p.payQuantity ?? 1),
      buyScopeType: p.buyScopeType,
      buyScopeTargetIds: p.buyScopeTargetIds ?? [],
      payScopeType: p.payScopeType,
      payScopeTargetIds: p.payScopeTargetIds ?? [],
      discountValue: String(p.discountValue ?? 10),
      discountValueType: p.discountValueType ?? 'PERCENTAGE',
      minCartAmount: p.minCartAmount != null ? String(p.minCartAmount) : '',
      progressiveTiers: tiers,
      combineWithPriceDiscounts: p.combineWithPriceDiscounts,
      combineWithFreeShipping: p.combineWithFreeShipping,
      combineWithCartDiscounts: p.combineWithCartDiscounts,
      combineWithAppDiscounts: p.combineWithAppDiscounts,
      dateType: p.startsAt || p.expiresAt ? 'period' : 'unlimited',
      usageLimit: p.usageLimit != null ? String(p.usageLimit) : '',
      startsAt: p.startsAt ? p.startsAt.slice(0, 16) : '',
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 16) : '',
      active: p.active,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setBuyPickerOpen(false);
    setPayPickerOpen(false);
  }

  function setF<K extends keyof PromotionFormState>(key: K, value: PromotionFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload(): PromotionUpsertRequest | null {
    if (!form.name.trim()) {
      toast.error('Informe um nome para a promoção');
      return null;
    }
    const base: PromotionUpsertRequest = {
      name: form.name.trim(),
      discountType: form.discountType,
      buyScopeType: form.buyScopeType,
      buyScopeTargetIds: form.buyScopeType !== 'ENTIRE_STORE' ? form.buyScopeTargetIds : null,
      payScopeType: form.payScopeType,
      payScopeTargetIds: form.payScopeType !== 'ENTIRE_STORE' ? form.payScopeTargetIds : null,
      combineWithPriceDiscounts: form.combineWithPriceDiscounts,
      combineWithFreeShipping: form.combineWithFreeShipping,
      combineWithCartDiscounts: form.combineWithCartDiscounts,
      combineWithAppDiscounts: form.combineWithAppDiscounts,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startsAt: form.dateType === 'period' && form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.dateType === 'period' && form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    };
    switch (form.discountType) {
      case 'BUY_X_PAY_Y': {
        const buy = parseInt(form.buyQuantity);
        const pay = parseInt(form.payQuantity);
        if (!buy || !pay || pay > buy) {
          toast.error('Quantidade inválida: "pagar" deve ser menor ou igual a "comprar"');
          return null;
        }
        base.buyQuantity = buy;
        base.payQuantity = pay;
        break;
      }
      case 'PRICE_DISCOUNT':
      case 'CROSS_SELLING': {
        const dv = parseFloat(form.discountValue);
        if (!dv || dv <= 0) { toast.error('Informe um valor de desconto válido'); return null; }
        base.discountValue = dv;
        base.discountValueType = form.discountValueType;
        break;
      }
      case 'CART_DISCOUNT': {
        const dv = parseFloat(form.discountValue);
        if (!dv || dv <= 0) { toast.error('Informe um valor de desconto válido'); return null; }
        base.discountValue = dv;
        base.discountValueType = form.discountValueType;
        base.minCartAmount = form.minCartAmount ? parseFloat(form.minCartAmount) : null;
        break;
      }
      case 'PROGRESSIVE_DISCOUNT': {
        if (form.progressiveTiers.length === 0) {
          toast.error('Adicione ao menos uma faixa de desconto progressivo');
          return null;
        }
        const tiers: ProgressiveTier[] = form.progressiveTiers.map((t, i) => {
          const minQty = parseInt(t.minQty);
          const dv = parseFloat(t.discountValue);
          if (!minQty || minQty < 2 || !dv || dv <= 0) throw new Error(`Faixa ${i + 1} inválida`);
          return { minQty, discountValue: dv, discountValueType: t.discountValueType };
        });
        base.progressiveRules = JSON.stringify(tiers);
        break;
      }
    }
    return base;
  }

  function handleSubmit() {
    let payload: PromotionUpsertRequest | null;
    try { payload = buildPayload(); } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Dados inválidos');
      return;
    }
    if (!payload) return;
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, req: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── scope helpers ── */
  function toggleScopeId(field: 'buyScopeTargetIds' | 'payScopeTargetIds', id: number) {
    setForm((prev) => {
      const s = new Set(prev[field]);
      s.has(id) ? s.delete(id) : s.add(id);
      return { ...prev, [field]: Array.from(s) };
    });
  }

  function removeId(field: 'buyScopeTargetIds' | 'payScopeTargetIds', id: number) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((x) => x !== id) }));
  }

  function scopeLabel(type: PromotionApplyScopeType, id: number) {
    if (type === 'PRODUCTS') return allProducts.find((p) => p.id === id)?.name ?? `Produto #${id}`;
    if (type === 'CATEGORIES') return allCategories.find((c) => c.id === id)?.name ?? `Categoria #${id}`;
    return `#${id}`;
  }

  function pickerItems(type: PromotionApplyScopeType) {
    if (type === 'PRODUCTS') return allProducts.map((p) => ({ id: p.id, label: p.name }));
    if (type === 'CATEGORIES') return allCategories.map((c) => ({ id: c.id, label: c.name }));
    return [];
  }

  function addTier() {
    setForm((prev) => ({
      ...prev,
      progressiveTiers: [...prev.progressiveTiers, { minQty: '', discountValue: '', discountValueType: 'PERCENTAGE' as DiscountValueType }],
    }));
  }

  function removeTier(i: number) {
    setForm((prev) => ({ ...prev, progressiveTiers: prev.progressiveTiers.filter((_, idx) => idx !== i) }));
  }

  function updateTier<K extends keyof FormProgressiveTier>(i: number, key: K, value: FormProgressiveTier[K]) {
    setForm((prev) => {
      const tiers = [...prev.progressiveTiers];
      tiers[i] = { ...tiers[i], [key]: value };
      return { ...prev, progressiveTiers: tiers };
    });
  }

  // ── Landing page ────────────────────────────────────────────────────────────
  if (!isLoading && promotions.length === 0 && !dialogOpen) {
    return (
      <TooltipProvider>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col items-center text-center gap-6 py-12">
              <div className="relative flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
                  <Megaphone className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Zap className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground leading-snug">
                  Impulsione suas vendas com<br />promoções que convertem
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Crie regras automáticas de desconto — sem precisar de cupons.
                </p>
              </div>
              <ul className="text-left w-full max-w-sm space-y-3">
                {[
                  { icon: Tag, text: 'Promoções do tipo "Leve 2, Pague 1" ou "Leve 3, Pague 2"' },
                  { icon: BadgePercent, text: 'Descontos por percentagem em produtos ou categorias' },
                  { icon: Timer, text: 'Ofertas por tempo limitado com data de início e fim' },
                  { icon: TrendingUp, text: 'Desconto progressivo: quanto mais compra, mais economiza' },
                  { icon: ShoppingCart, text: 'Desconto direto no valor total do carrinho' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-2 gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Criar promoção
              </Button>
            </div>
            <Separator />
            <div className="mt-6">
              <p className="text-xs uppercase text-muted-foreground mb-3">Integração com apps</p>
              <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Apps de Marketing</p>
                    <p className="text-xs text-muted-foreground">Promoções avançadas via integrações externas</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">Em breve</Badge>
              </div>
            </div>
          </div>
          <PromotionFormDialog
            open={dialogOpen} editingId={editingId} form={form} setF={setF} isSaving={isSaving}
            buyPickerOpen={buyPickerOpen} setBuyPickerOpen={setBuyPickerOpen}
            payPickerOpen={payPickerOpen} setPayPickerOpen={setPayPickerOpen}
            toggleScopeId={toggleScopeId} removeId={removeId}
            scopeLabel={scopeLabel} pickerItems={pickerItems}
            addTier={addTier} removeTier={removeTier} updateTier={updateTier}
            onClose={closeDialog} onSubmit={handleSubmit}
          />
        </div>
      </TooltipProvider>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Promoções</h1>
            <p className="text-sm text-muted-foreground">Descontos automáticos por regra — sem necessidade de cupons.</p>
          </div>
          <Button className="gap-2 shrink-0" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Criar promoção
          </Button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <KpiCard label="Total" value={stats.total} icon={<Tag className="h-5 w-5 text-primary" />} />
          <KpiCard label="Ativas" value={stats.active} icon={<Zap className="h-5 w-5 text-emerald-500" />} />
          <KpiCard label="Inativas" value={stats.inactive} icon={<Timer className="h-5 w-5 text-muted-foreground" />} />
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                {['Nome', 'Tipo', 'Regra', 'Uso', 'Validade', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Carregando...</td>
                </tr>
              )}
              {!isLoading && promotions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma promoção encontrada.</td>
                </tr>
              )}
              {promotions.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">{discountTypeLabel(p.discountType)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatRule(p)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.usageCount}/{p.usageLimit ?? '∞'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('pt-BR') : 'Ilimitada'}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={p.active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: p.id, active: v })}
                      disabled={toggleMutation.isPending}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PromotionFormDialog
          open={dialogOpen} editingId={editingId} form={form} setF={setF} isSaving={isSaving}
          buyPickerOpen={buyPickerOpen} setBuyPickerOpen={setBuyPickerOpen}
          payPickerOpen={payPickerOpen} setPayPickerOpen={setPayPickerOpen}
          toggleScopeId={toggleScopeId} removeId={removeId}
          scopeLabel={scopeLabel} pickerItems={pickerItems}
          addTier={addTier} removeTier={removeTier} updateTier={updateTier}
          onClose={closeDialog} onSubmit={handleSubmit}
        />

        <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover promoção?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Scope picker ───────────────────────────────────────────────────────────────

function ScopePicker({
  scopeType, selectedIds, pickerOpen, setPickerOpen, pickerItems, scopeLabel, onToggle, onRemove,
}: {
  scopeType: PromotionApplyScopeType;
  selectedIds: number[];
  pickerOpen: boolean;
  setPickerOpen: (v: boolean) => void;
  pickerItems: (type: PromotionApplyScopeType) => { id: number; label: string }[];
  scopeLabel: (type: PromotionApplyScopeType, id: number) => string;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  if (scopeType === 'ENTIRE_STORE') return null;
  const items = pickerItems(scopeType);
  const noun = scopeType === 'CATEGORIES' ? 'categorias' : 'produtos';
  return (
    <div className="space-y-2 pl-1">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedIds.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1 text-xs">
              {scopeLabel(scopeType, id)}
              <button type="button" onClick={() => onRemove(id)} className="ml-0.5"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Button type="button" variant="outline" size="sm" className="gap-1.5 text-sm" onClick={() => setPickerOpen(!pickerOpen)}>
          <Plus className="h-3.5 w-3.5" />Selecionar {noun}<ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
        {pickerOpen && (
          <div className="absolute z-50 mt-1 w-64 rounded-md border border-border bg-popover shadow-md">
            <Command>
              <CommandInput placeholder={`Buscar ${noun}...`} />
              <CommandList className="max-h-44 overflow-y-auto">
                <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem key={item.id} onSelect={() => onToggle(item.id)}>
                      <Check className={`mr-2 h-4 w-4 ${selectedIds.includes(item.id) ? 'opacity-100' : 'opacity-0'}`} />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dialog ─────────────────────────────────────────────────────────────────────

interface PromotionFormDialogProps {
  open: boolean;
  editingId: number | null;
  form: PromotionFormState;
  setF: <K extends keyof PromotionFormState>(key: K, value: PromotionFormState[K]) => void;
  isSaving: boolean;
  buyPickerOpen: boolean;
  setBuyPickerOpen: (v: boolean) => void;
  payPickerOpen: boolean;
  setPayPickerOpen: (v: boolean) => void;
  toggleScopeId: (field: 'buyScopeTargetIds' | 'payScopeTargetIds', id: number) => void;
  removeId: (field: 'buyScopeTargetIds' | 'payScopeTargetIds', id: number) => void;
  scopeLabel: (type: PromotionApplyScopeType, id: number) => string;
  pickerItems: (type: PromotionApplyScopeType) => { id: number; label: string }[];
  addTier: () => void;
  removeTier: (i: number) => void;
  updateTier: <K extends keyof FormProgressiveTier>(i: number, key: K, value: FormProgressiveTier[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function PromotionFormDialog({
  open, editingId, form, setF, isSaving,
  buyPickerOpen, setBuyPickerOpen, payPickerOpen, setPayPickerOpen,
  toggleScopeId, removeId, scopeLabel, pickerItems,
  addTier, removeTier, updateTier,
  onClose, onSubmit,
}: PromotionFormDialogProps) {
  const isEdit = editingId !== null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar promoção' : 'Criar promoção'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-1">

          {/* ── Nome ── */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Nome da promoção</p>
            <Input placeholder="Ex: Leve 2 pague 1 — Camisetas" value={form.name} onChange={(e) => setF('name', e.target.value)} />
            <p className="text-xs text-muted-foreground">Esse nome não será exibido para os seus clientes.</p>
          </div>

          <Separator />

          {/* ── Tipo de desconto ── */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Tipo de desconto</p>
            <Select value={form.discountType} onValueChange={(v) => setF('discountType', v as PromotionDiscountType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="font-medium">{opt.label}</span>
                    <span className="ml-1 text-muted-foreground text-xs">— {opt.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* BUY_X_PAY_Y */}
            {form.discountType === 'BUY_X_PAY_Y' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Comprando</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} value={form.buyQuantity} onChange={(e) => setF('buyQuantity', e.target.value)} className="w-20" />
                    <span className="text-sm text-muted-foreground">produtos</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pague</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} value={form.payQuantity} onChange={(e) => setF('payQuantity', e.target.value)} className="w-20" />
                    <span className="text-sm text-muted-foreground">produtos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shared discount value */}
            {(form.discountType === 'PRICE_DISCOUNT' || form.discountType === 'CROSS_SELLING' || form.discountType === 'CART_DISCOUNT') && (
              <div className="flex items-center gap-2">
                <Input type="number" min={0} step="0.01" placeholder="0" value={form.discountValue} onChange={(e) => setF('discountValue', e.target.value)} className="w-28" />
                <Select value={form.discountValueType} onValueChange={(v) => setF('discountValueType', v as DiscountValueType)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">%</SelectItem>
                    <SelectItem value="FIXED">R$</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">de desconto</span>
              </div>
            )}

            {/* CART_DISCOUNT minimum */}
            {form.discountType === 'CART_DISCOUNT' && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Valor mínimo (opcional):</Label>
                <span className="text-sm text-muted-foreground">R$</span>
                <Input type="number" min={0} step="0.01" placeholder="0,00" value={form.minCartAmount} onChange={(e) => setF('minCartAmount', e.target.value)} className="w-28" />
              </div>
            )}

            {/* PROGRESSIVE_DISCOUNT tiers */}
            {form.discountType === 'PROGRESSIVE_DISCOUNT' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Faixas de quantidade</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addTier} className="h-6 text-xs gap-1">
                    <Plus className="h-3 w-3" /> Adicionar faixa
                  </Button>
                </div>
                {form.progressiveTiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">A partir de</span>
                    <Input type="number" min={2} placeholder="qtd" value={tier.minQty} onChange={(e) => updateTier(i, 'minQty', e.target.value)} className="w-14 h-7 text-xs" />
                    <span className="text-xs text-muted-foreground">un →</span>
                    <Input type="number" min={0} step="0.01" placeholder="desc." value={tier.discountValue} onChange={(e) => updateTier(i, 'discountValue', e.target.value)} className="w-16 h-7 text-xs" />
                    <Select value={tier.discountValueType} onValueChange={(v) => updateTier(i, 'discountValueType', v as DiscountValueType)}>
                      <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">%</SelectItem>
                        <SelectItem value="FIXED">R$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive shrink-0" onClick={() => removeTier(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* ── Aplicar a ── */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Aplicar a</p>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{form.discountType === 'CROSS_SELLING' ? 'Produto(s) de gatilho' : 'Escopo'}</Label>
              <Select value={form.buyScopeType} onValueChange={(v) => setF('buyScopeType', v as PromotionApplyScopeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SCOPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <ScopePicker
                scopeType={form.buyScopeType} selectedIds={form.buyScopeTargetIds}
                pickerOpen={buyPickerOpen} setPickerOpen={setBuyPickerOpen}
                pickerItems={pickerItems} scopeLabel={scopeLabel}
                onToggle={(id) => toggleScopeId('buyScopeTargetIds', id)}
                onRemove={(id) => removeId('buyScopeTargetIds', id)}
              />
            </div>

            {(form.discountType === 'CROSS_SELLING' || form.discountType === 'BUY_X_PAY_Y') && (
              <div className="space-y-2 mt-3">
                <Label className="text-xs text-muted-foreground">
                  {form.discountType === 'CROSS_SELLING' ? 'Produto(s) com desconto' : 'Produto(s) que serão gratuitos'}
                </Label>
                <Select value={form.payScopeType} onValueChange={(v) => setF('payScopeType', v as PromotionApplyScopeType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SCOPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <ScopePicker
                  scopeType={form.payScopeType} selectedIds={form.payScopeTargetIds}
                  pickerOpen={payPickerOpen} setPickerOpen={setPayPickerOpen}
                  pickerItems={pickerItems} scopeLabel={scopeLabel}
                  onToggle={(id) => toggleScopeId('payScopeTargetIds', id)}
                  onRemove={(id) => removeId('payScopeTargetIds', id)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* ── Combinar com ── */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Combinar com outros descontos</p>
            <div className="space-y-2.5">
              {[
                { field: 'combineWithPriceDiscounts' as const, label: 'Descontos sobre preços' },
                { field: 'combineWithFreeShipping' as const, label: 'Frete grátis' },
                { field: 'combineWithCartDiscounts' as const, label: 'Descontos sobre o valor do carrinho' },
                { field: 'combineWithAppDiscounts' as const, label: 'Descontos de aplicativos', tooltip: 'Inclui meios de pagamento, cupons percentuais e cupons de valor fixo' },
              ].map(({ field, label, tooltip }) => (
                <div key={field} className="flex items-center gap-2">
                  <input type="checkbox" id={field} checked={form[field]} onChange={(e) => setF(field, e.target.checked)} className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                  <label htmlFor={field} className="text-sm cursor-pointer select-none">{label}</label>
                  {tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                      <TooltipContent side="right" className="max-w-48 text-xs">{tooltip}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Limites de uso ── */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Limites de uso</p>
            <div className="flex gap-3">
              {[{ value: 'unlimited', label: 'Ilimitada' }, { value: 'period', label: 'Período definido' }].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input type="radio" name="dateType" value={value} checked={form.dateType === value} onChange={() => setF('dateType', value as 'unlimited' | 'period')} className="accent-primary" />
                  {label}
                </label>
              ))}
            </div>
            {form.dateType === 'period' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Início</Label>
                  <Input type="datetime-local" value={form.startsAt} onChange={(e) => setF('startsAt', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim</Label>
                  <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setF('expiresAt', e.target.value)} />
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Limite de usos:</Label>
              <Input type="number" min={1} placeholder="Sem limite" value={form.usageLimit} onChange={(e) => setF('usageLimit', e.target.value)} className="w-36" />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="promo-active" className="cursor-pointer">Promoção ativa</Label>
            <Switch id="promo-active" checked={form.active} onCheckedChange={(v) => setF('active', v)} />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isSaving}>{isSaving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
