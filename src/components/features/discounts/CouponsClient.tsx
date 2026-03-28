'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowLeftRight,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  X,
  Trash2,
  Loader2,
  TicketPercent,
  Truck,
  Banknote,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { couponService } from '@/services/sales';
import productService from '@/services/catalog/product';
import categoryService from '@/services/catalog/categoryService';
import {
  Coupon,
  CouponFilters,
  CouponScopeType,
  CouponSortOption,
  CouponType,
  CouponUpsertRequest,
  DEFAULT_FILTERS,
} from '@/types/coupon';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { FieldHelper } from '@/components/shared/field-helper';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseNumber = (v: string): number | null => {
  const n = v.trim();
  if (!n) return null;
  const p = Number(n);
  return Number.isFinite(p) ? p : null;
};

const parseIds = (v: string): number[] | null => {
  const n = v.trim();
  if (!n) return null;
  const ids = n.split(',').map(Number).filter((id) => Number.isInteger(id) && id > 0);
  return ids.length ? Array.from(new Set(ids)) : null;
};

function apiError(err: unknown, fallback: string): string {
  const e = err as AxiosError<{ message?: string; error?: string }>;
  return e.response?.data?.message || e.response?.data?.error || (e as Error).message || fallback;
}

function valueLabel(c: Coupon): string {
  if (c.type === 'PERCENTAGE') return `${Number(c.value)}%`;
  if (c.type === 'FREE_SHIPPING') return 'Frete grátis';
  return `R$ ${Number(c.value).toFixed(2)}`;
}

function couponTypeIcon(type: CouponType) {
  if (type === 'PERCENTAGE') return <TicketPercent className="h-3.5 w-3.5" />;
  if (type === 'FREE_SHIPPING') return <Truck className="h-3.5 w-3.5" />;
  return <Banknote className="h-3.5 w-3.5" />;
}

// ─── Form state ──────────────────────────────────────────────────────────────

type FormState = {
  code: string;
  type: CouponType;
  value: string;
  includeShippingInDiscount: boolean;
  cheapestShippingOnly: boolean;
  combineWithPromotions: boolean;
  scopeType: CouponScopeType;
  scopeTargetIds: string;
  usageLimitMode: 'unlimited' | 'limited';
  usageLimit: string;
  perCustomerMode: 'unlimited' | 'limited' | 'first_order';
  perCustomerLimit: string;
  dateMode: 'unlimited' | 'period';
  startsAt: string;
  expiresAt: string;
  minOrderAmount: string;
  maxDiscountMode: 'none' | 'cap';
  maxDiscountAmount: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  includeShippingInDiscount: false,
  cheapestShippingOnly: false,
  combineWithPromotions: false,
  scopeType: 'ALL_PRODUCTS',
  scopeTargetIds: '',
  usageLimitMode: 'unlimited',
  usageLimit: '',
  perCustomerMode: 'unlimited',
  perCustomerLimit: '',
  dateMode: 'unlimited',
  startsAt: '',
  expiresAt: '',
  minOrderAmount: '',
  maxDiscountMode: 'none',
  maxDiscountAmount: '',
  active: true,
};

function couponToForm(c: Coupon): FormState {
  return {
    code: c.code,
    type: c.type,
    value: c.type !== 'FREE_SHIPPING' ? String(c.value) : '0',
    includeShippingInDiscount: c.includeShippingInDiscount,
    cheapestShippingOnly: c.cheapestShippingOnly,
    combineWithPromotions: c.combineWithPromotions,
    scopeType: c.scopeType,
    scopeTargetIds: c.scopeTargetIds?.join(',') ?? '',
    usageLimitMode: c.usageLimit != null ? 'limited' : 'unlimited',
    usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
    perCustomerMode: c.firstOrderOnly ? 'first_order' : c.perCustomerLimit != null ? 'limited' : 'unlimited',
    perCustomerLimit: c.perCustomerLimit != null ? String(c.perCustomerLimit) : '',
    dateMode: c.startsAt || c.expiresAt ? 'period' : 'unlimited',
    startsAt: c.startsAt ? c.startsAt.slice(0, 16) : '',
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : '',
    minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : '',
    maxDiscountMode: c.maxDiscountAmount != null ? 'cap' : 'none',
    maxDiscountAmount: c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : '',
    active: c.active,
  };
}

// ─── Sort + filter helpers ────────────────────────────────────────────────────

function applySortAndFilter(
  coupons: Coupon[],
  search: string,
  sort: CouponSortOption,
  filters: CouponFilters,
): Coupon[] {
  let result = coupons.filter((c) => {
    const term = search.trim().toLowerCase();
    if (term && !c.code.toLowerCase().includes(term)) return false;
    if (filters.discountType !== 'ALL' && c.type !== filters.discountType) return false;
    if (filters.shippingIncluded === 'YES' && !c.includeShippingInDiscount && c.type !== 'FREE_SHIPPING') return false;
    if (filters.shippingIncluded === 'NO' && (c.includeShippingInDiscount || c.type === 'FREE_SHIPPING')) return false;
    if (filters.usageLimit === 'UNLIMITED' && c.usageLimit != null) return false;
    if (filters.usageLimit === 'LIMITED' && c.usageLimit == null) return false;
    if (filters.validity === 'UNLIMITED' && (c.startsAt || c.expiresAt)) return false;
    if (filters.validity === 'PERIOD' && !c.startsAt && !c.expiresAt) return false;
    if (filters.minCartValue === 'NONE' && c.minOrderAmount != null) return false;
    if (filters.minCartValue === 'HAS' && c.minOrderAmount == null) return false;
    if (filters.maxDiscount === 'NONE' && c.maxDiscountAmount != null) return false;
    if (filters.maxDiscount === 'HAS' && c.maxDiscountAmount == null) return false;
    if (filters.status === 'ACTIVE' && !c.active) return false;
    if (filters.status === 'INACTIVE' && c.active) return false;
    if (filters.createdAt === 'CUSTOM') {
      const created = new Date(c.createdAt).getTime();
      if (filters.createdFrom && created < new Date(filters.createdFrom).getTime()) return false;
      if (filters.createdTo && created > new Date(filters.createdTo + 'T23:59:59').getTime()) return false;
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'az': return a.code.localeCompare(b.code);
      case 'za': return b.code.localeCompare(a.code);
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most_used': return b.usageCount - a.usageCount;
      case 'least_used': return a.usageCount - b.usageCount;
    }
  });

  return result;
}

const SORT_LABELS: Record<CouponSortOption, string> = {
  az: 'A–Z',
  za: 'Z–A',
  newest: 'Mais novo',
  oldest: 'Mais antigo',
  most_used: 'Mais usado',
  least_used: 'Menos usado',
};

function activeFilterCount(f: CouponFilters): number {
  return [
    f.discountType !== 'ALL',
    f.shippingIncluded !== 'ALL',
    f.usageLimit !== 'ALL',
    f.validity !== 'ALL',
    f.minCartValue !== 'ALL',
    f.maxDiscount !== 'ALL',
    f.status !== 'ALL',
    f.createdAt !== 'ALL',
  ].filter(Boolean).length;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────────────

type Screen = 'list' | 'filters' | 'create';

export function CouponsClient() {
  const queryClient = useQueryClient();

  const [screen, setScreen] = useState<Screen>('list');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CouponSortOption>('newest');
  const [filters, setFilters] = useState<CouponFilters>(DEFAULT_FILTERS);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [confirmDeactivate, setConfirmDeactivate] = useState<Coupon | null>(null);

  // ── Queries ──
  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: couponService.listAll,
  });

  const isInCreate = screen === 'create';

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-for-coupon'],
    queryFn: () => productService.listAll(),
    enabled: isInCreate && (form.scopeType === 'SPECIFIC_PRODUCTS' || form.scopeType === 'SPECIFIC_COLLECTIONS'),
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-coupon'],
    queryFn: () => categoryService.list(),
    enabled: isInCreate && form.scopeType === 'SPECIFIC_CATEGORIES',
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (req: CouponUpsertRequest) => couponService.create(req),
    onSuccess: () => {
      toast.success('Cupom criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setScreen('list');
    },
    onError: (e) => toast.error(apiError(e, 'Falha ao criar cupom')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: CouponUpsertRequest }) => couponService.update(id, req),
    onSuccess: () => {
      toast.success('Cupom atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setScreen('list');
    },
    onError: (e) => toast.error(apiError(e, 'Falha ao atualizar cupom')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => couponService.toggleActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: (e) => toast.error(apiError(e, 'Falha ao alterar status')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponService.delete(id),
    onSuccess: () => {
      toast.success('Cupom excluído');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (e) => toast.error(apiError(e, 'Falha ao excluir cupom')),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Form helpers ──
  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  function openCreate() {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setScreen('create');
  }

  function openEdit(c: Coupon) {
    setEditingCoupon(c);
    setForm(couponToForm(c));
    setScreen('create');
  }

  function toPayload(): CouponUpsertRequest | null {
    if (!form.code.trim()) {
      toast.error('Informe o código do cupom.');
      return null;
    }
    const isFreeShipping = form.type === 'FREE_SHIPPING';
    const value = isFreeShipping ? 0 : parseNumber(form.value);
    if (!isFreeShipping && (value === null || value <= 0)) {
      toast.error('Informe um valor de desconto válido.');
      return null;
    }
    if (form.scopeType !== 'ALL_PRODUCTS' && !parseIds(form.scopeTargetIds)) {
      toast.error('Selecione ao menos um produto ou categoria.');
      return null;
    }

    return {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: value ?? 0,
      includeShippingInDiscount: form.includeShippingInDiscount,
      cheapestShippingOnly: form.cheapestShippingOnly,
      combineWithPromotions: form.combineWithPromotions,
      scopeType: form.scopeType,
      scopeTargetIds: parseIds(form.scopeTargetIds),
      usageLimit: form.usageLimitMode === 'limited' ? parseNumber(form.usageLimit) : null,
      perCustomerLimit: form.perCustomerMode === 'limited' ? parseNumber(form.perCustomerLimit) : null,
      firstOrderOnly: form.perCustomerMode === 'first_order',
      startsAt: form.dateMode === 'period' && form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.dateMode === 'period' && form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      minOrderAmount: parseNumber(form.minOrderAmount),
      maxDiscountAmount: form.maxDiscountMode === 'cap' ? parseNumber(form.maxDiscountAmount) : null,
      active: form.active,
    };
  }

  function handleSave() {
    const payload = toPayload();
    if (!payload) return;
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, req: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  // ── Scope picker helpers ──
  const selectedScopeIds = useMemo(() => {
    const raw = form.scopeTargetIds.trim();
    if (!raw) return [] as number[];
    return raw.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
  }, [form.scopeTargetIds]);

  const toggleScopeId = useCallback((id: number) => {
    setForm((prev) => {
      const cur = new Set(
        prev.scopeTargetIds
          .split(',')
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0),
      );
      if (cur.has(id)) cur.delete(id);
      else cur.add(id);
      return { ...prev, scopeTargetIds: Array.from(cur).join(',') };
    });
  }, []);

  const removeScopeId = useCallback((id: number) => {
    setForm((prev) => ({
      ...prev,
      scopeTargetIds: prev.scopeTargetIds
        .split(',')
        .map(Number)
        .filter((n) => n !== id)
        .join(','),
    }));
  }, []);

  const scopeLabel = (id: number): string => {
    if (form.scopeType === 'SPECIFIC_PRODUCTS' || form.scopeType === 'SPECIFIC_COLLECTIONS')
      return allProducts.find((p) => p.id === id)?.name ?? `Produto #${id}`;
    if (form.scopeType === 'SPECIFIC_CATEGORIES')
      return allCategories.find((c) => c.id === id)?.name ?? `Categoria #${id}`;
    return `#${id}`;
  };

  // ── Filtered list ──
  const filtered = useMemo(
    () => applySortAndFilter(coupons, search, sort, filters),
    [coupons, search, sort, filters],
  );

  const filterCount = activeFilterCount(filters);
  const isFormValid = form.code.trim().length > 0 && (form.type === 'FREE_SHIPPING' || (parseNumber(form.value) ?? 0) > 0);

  // ── Render ────────────────────────────────────────────────────────────────

  // ╔════════════════════════════════════════════════════════╗
  // ║  SCREEN: FILTERS                                       ║
  // ╚════════════════════════════════════════════════════════╝
  if (screen === 'filters') {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setScreen('list')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Filtrar por</h1>
          {filterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="space-y-5">
          <FilterGroup label="Tipo de desconto">
            {(['ALL', 'PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'] as const).map((t) => (
              <FilterChip key={t} active={filters.discountType === t} onClick={() => setFilters((f) => ({ ...f, discountType: t }))}>
                {t === 'ALL' ? 'Todos' : t === 'PERCENTAGE' ? 'Porcentagem' : t === 'FIXED_AMOUNT' ? 'Valor fixo' : 'Frete grátis'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Frete incluído">
            {(['ALL', 'YES', 'NO'] as const).map((v) => (
              <FilterChip key={v} active={filters.shippingIncluded === v} onClick={() => setFilters((f) => ({ ...f, shippingIncluded: v }))}>
                {v === 'ALL' ? 'Todos' : v === 'YES' ? 'Sim' : 'Não'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Limite de usos">
            {(['ALL', 'UNLIMITED', 'LIMITED'] as const).map((v) => (
              <FilterChip key={v} active={filters.usageLimit === v} onClick={() => setFilters((f) => ({ ...f, usageLimit: v }))}>
                {v === 'ALL' ? 'Todos' : v === 'UNLIMITED' ? 'Ilimitado' : 'Limitado'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Validade">
            {(['ALL', 'UNLIMITED', 'PERIOD'] as const).map((v) => (
              <FilterChip key={v} active={filters.validity === v} onClick={() => setFilters((f) => ({ ...f, validity: v }))}>
                {v === 'ALL' ? 'Todos' : v === 'UNLIMITED' ? 'Ilimitado' : 'Período'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Valor mínimo do carrinho">
            {(['ALL', 'NONE', 'HAS'] as const).map((v) => (
              <FilterChip key={v} active={filters.minCartValue === v} onClick={() => setFilters((f) => ({ ...f, minCartValue: v }))}>
                {v === 'ALL' ? 'Todos' : v === 'NONE' ? 'Sem mínimo' : 'Com mínimo'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Valor máximo de desconto">
            {(['ALL', 'NONE', 'HAS'] as const).map((v) => (
              <FilterChip key={v} active={filters.maxDiscount === v} onClick={() => setFilters((f) => ({ ...f, maxDiscount: v }))}>
                {v === 'ALL' ? 'Todos' : v === 'NONE' ? 'Sem valor máximo' : 'Com valor máximo'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Estado">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((v) => (
              <FilterChip key={v} active={filters.status === v} onClick={() => setFilters((f) => ({ ...f, status: v }))}>
                {v === 'ALL' ? 'Todos' : v === 'ACTIVE' ? 'Ativo' : 'Inativo'}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Data de criação">
            {(['ALL', 'CUSTOM'] as const).map((v) => (
              <FilterChip key={v} active={filters.createdAt === v} onClick={() => setFilters((f) => ({ ...f, createdAt: v }))}>
                {v === 'ALL' ? 'Todos' : 'Personalizado'}
              </FilterChip>
            ))}
          </FilterGroup>

          {filters.createdAt === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3 pl-1">
              <div className="space-y-1">
                <Label className="text-xs">De</Label>
                <Input type="date" value={filters.createdFrom} onChange={(e) => setFilters((f) => ({ ...f, createdFrom: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Até</Label>
                <Input type="date" value={filters.createdTo} onChange={(e) => setFilters((f) => ({ ...f, createdTo: e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button className="w-full" onClick={() => setScreen('list')}>
            Aplicar filtros
            {filterCount > 0 && (
              <span className="ml-2 text-xs opacity-80">
                ({filterCount} ativo{filterCount > 1 ? 's' : ''})
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ╔════════════════════════════════════════════════════════╗
  // ║  SCREEN: CREATE / EDIT                                 ║
  // ╚════════════════════════════════════════════════════════╝
  if (screen === 'create') {
    const isFreeShipping = form.type === 'FREE_SHIPPING';
    const showScopePicker = form.scopeType !== 'ALL_PRODUCTS';

    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setScreen('list')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {editingCoupon ? 'Editar cupom' : 'Criar cupom'}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={!isFormValid || isSaving} className="gap-2 hidden sm:inline-flex">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingCoupon ? 'Salvar' : 'Criar'}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Section 1: Code */}
          <FormCard>
            <FormCardTitle>Código do cupom</FormCardTitle>
            <Input
              value={form.code}
              onChange={(e) => setField('code', e.target.value)}
              placeholder="Ex: JANEIRO20"
              className="uppercase placeholder:normal-case font-mono tracking-widest text-sm"
              maxLength={64}
            />
            <p className="text-xs text-muted-foreground">
              O cliente digita este código no checkout. Maiúsculas e minúsculas são equivalentes.
            </p>
          </FormCard>

          {/* Section 2: Discount type */}
          <FormCard>
            <FormCardTitle>Tipo de desconto</FormCardTitle>
            <Tabs value={form.type} onValueChange={(v) => setField('type', v as CouponType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="PERCENTAGE" className="text-xs gap-1.5">
                  <TicketPercent className="h-3.5 w-3.5" />
                  Porcentagem
                </TabsTrigger>
                <TabsTrigger value="FIXED_AMOUNT" className="text-xs gap-1.5">
                  <Banknote className="h-3.5 w-3.5" />
                  Valor fixo
                </TabsTrigger>
                <TabsTrigger value="FREE_SHIPPING" className="text-xs gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  Frete grátis
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {!isFreeShipping && (
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>
                    {form.type === 'PERCENTAGE' ? 'Percentual de desconto (%)' : 'Valor do desconto (R$)'}
                    <FieldHelper
                      content="Percentual reduz uma fração do pedido; valor fixo subtrai um valor absoluto."
                      learnMoreHref="/admin/tutorials/marketing"
                    />
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={form.type === 'PERCENTAGE' ? 100 : undefined}
                    value={form.value}
                    onChange={(e) => setField('value', e.target.value)}
                    placeholder={form.type === 'PERCENTAGE' ? 'Ex: 10' : 'Ex: 25,00'}
                  />
                </div>
                <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                    checked={form.includeShippingInDiscount}
                    onChange={(e) => setField('includeShippingInDiscount', e.target.checked)}
                  />
                  Incluir o custo de envio no desconto
                </label>
              </div>
            )}

            {isFreeShipping && (
              <div className="mt-4">
                <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                    checked={form.cheapestShippingOnly}
                    onChange={(e) => setField('cheapestShippingOnly', e.target.checked)}
                  />
                  Aplicar somente para a opção de envio com menor custo
                </label>
              </div>
            )}
          </FormCard>

          {/* Section 3: Apply to */}
          <FormCard>
            <FormCardTitle>Aplicar a</FormCardTitle>
            <Tabs
              value={form.scopeType}
              onValueChange={(v) => {
                setField('scopeType', v as CouponScopeType);
                setField('scopeTargetIds', '');
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ALL_PRODUCTS" className="text-xs">Toda a loja</TabsTrigger>
                <TabsTrigger value="SPECIFIC_CATEGORIES" className="text-xs">Categorias</TabsTrigger>
                <TabsTrigger value="SPECIFIC_PRODUCTS" className="text-xs">Produtos</TabsTrigger>
              </TabsList>
            </Tabs>

            {showScopePicker && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Escopo do cupom
                  <FieldHelper
                    content="Defina se o cupom vale para toda a loja, categorias específicas ou produtos específicos."
                    learnMoreHref="/admin/tutorials/marketing"
                  />
                </Label>
                {selectedScopeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScopeIds.map((id) => (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1 text-xs">
                        {scopeLabel(id)}
                        <button
                          type="button"
                          onClick={() => removeScopeId(id)}
                          className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <ScopePicker
                  scopeType={form.scopeType}
                  products={allProducts}
                  categories={allCategories}
                  selectedIds={selectedScopeIds}
                  onToggle={toggleScopeId}
                />
              </div>
            )}
          </FormCard>

          {/* Section 4: Usage limits */}
          <FormCard>
            <FormCardTitle>Limites de uso</FormCardTitle>

            <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                checked={form.combineWithPromotions}
                onChange={(e) => setField('combineWithPromotions', e.target.checked)}
              />
              Permitir combinar com outras promoções
            </label>

            <Separator className="my-3" />

            {/* Total usage */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                Por cupom
                <FieldHelper
                  content="Controla quantas vezes esse código pode ser usado no total por todos os clientes."
                  learnMoreHref="/admin/tutorials/marketing"
                />
              </p>
              <div className="flex gap-2">
                <ModeChip active={form.usageLimitMode === 'unlimited'} onClick={() => setField('usageLimitMode', 'unlimited')}>
                  Ilimitado
                </ModeChip>
                <ModeChip active={form.usageLimitMode === 'limited'} onClick={() => setField('usageLimitMode', 'limited')}>
                  Limitado
                </ModeChip>
              </div>
              {form.usageLimitMode === 'limited' && (
                <Input
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={(e) => setField('usageLimit', e.target.value)}
                  placeholder="Quantas vezes o cupom poderá ser usado?"
                />
              )}
            </div>

            {/* Per customer */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-foreground">
                Por cliente
                <FieldHelper
                  content="Define limite individual por cliente para evitar abuso e controlar recorrência da promoção."
                  learnMoreHref="/admin/tutorials/marketing"
                />
              </p>
              <div className="flex flex-wrap gap-2">
                <ModeChip active={form.perCustomerMode === 'unlimited'} onClick={() => setField('perCustomerMode', 'unlimited')}>
                  Ilimitado
                </ModeChip>
                <ModeChip active={form.perCustomerMode === 'limited'} onClick={() => setField('perCustomerMode', 'limited')}>
                  Limitado
                </ModeChip>
                <ModeChip active={form.perCustomerMode === 'first_order'} onClick={() => setField('perCustomerMode', 'first_order')}>
                  Primeira compra
                </ModeChip>
              </div>
              {form.perCustomerMode === 'limited' && (
                <Input
                  type="number"
                  min="1"
                  value={form.perCustomerLimit}
                  onChange={(e) => setField('perCustomerLimit', e.target.value)}
                  placeholder="Limite de usos por cliente"
                />
              )}
            </div>

            {/* Date range */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-foreground">Data de validade</p>
              <div className="flex gap-2">
                <ModeChip active={form.dateMode === 'unlimited'} onClick={() => setField('dateMode', 'unlimited')}>
                  Ilimitado
                </ModeChip>
                <ModeChip active={form.dateMode === 'period'} onClick={() => setField('dateMode', 'period')}>
                  Período
                </ModeChip>
              </div>
              {form.dateMode === 'period' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">De</Label>
                    <Input type="datetime-local" value={form.startsAt} onChange={(e) => setField('startsAt', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Até</Label>
                    <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setField('expiresAt', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* Min cart */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-foreground">Valor mínimo do carrinho (R$)</p>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setField('minOrderAmount', e.target.value)}
                placeholder="Sem mínimo — deixar vazio"
              />
            </div>

            {/* Max discount cap */}
            {!isFreeShipping && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Valor máximo de desconto</p>
                <div className="flex gap-2">
                  <ModeChip active={form.maxDiscountMode === 'none'} onClick={() => setField('maxDiscountMode', 'none')}>
                    Nenhum
                  </ModeChip>
                  <ModeChip active={form.maxDiscountMode === 'cap'} onClick={() => setField('maxDiscountMode', 'cap')}>
                    Até R$…
                  </ModeChip>
                </div>
                {form.maxDiscountMode === 'cap' && (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setField('maxDiscountAmount', e.target.value)}
                    placeholder="Teto máximo do desconto (R$)"
                  />
                )}
              </div>
            )}
          </FormCard>
        </div>

        {/* Mobile floating save bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background px-4 py-3 flex items-center justify-between gap-3 sm:hidden">
          <Button variant="outline" onClick={() => setScreen('list')} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid || isSaving} className="flex-1 gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingCoupon ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </div>
    );
  }

  // ╔════════════════════════════════════════════════════════╗
  // ║  SCREEN: LIST (default)                                ║
  // ╚════════════════════════════════════════════════════════╝
  return (
    <>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Cupons</h1>
            <p className="mt-1 text-sm text-muted-foreground">Crie e gerencie cupons de desconto para sua loja.</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Criar
          </Button>
        </div>

        {/* Promo banner */}
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50/60 dark:bg-blue-900/10 dark:border-blue-800 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Aumente suas conversões com cupons</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 leading-relaxed">
              Crie cupons de desconto por porcentagem, valor fixo ou frete grátis. Combine com limites de uso,
              validade e valor mínimo de carrinho para campanhas precisas.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código..."
              className="pl-9"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0 relative"
            onClick={() => setScreen('filters')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {filterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {filterCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <ArrowLeftRight className="h-4 w-4" />
                {SORT_LABELS[sort]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(SORT_LABELS) as CouponSortOption[]).map((key) => (
                <DropdownMenuCheckboxItem key={key} checked={sort === key} onCheckedChange={() => setSort(key)} className="text-sm">
                  {SORT_LABELS[key]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {filtered.length} {filtered.length === 1 ? 'cupom' : 'cupons'}
          {filterCount > 0 && (
            <span className="text-primary">
              {' '}• {filterCount} filtro{filterCount > 1 ? 's' : ''} ativo{filterCount > 1 ? 's' : ''}
            </span>
          )}
        </p>

        {/* Coupon cards */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando cupons...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <TicketPercent className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {coupons.length === 0 ? 'Nenhum cupom criado ainda' : 'Nenhum cupom encontrado'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {coupons.length === 0
                ? 'Crie seu primeiro cupom de desconto e comece a atrair mais clientes.'
                : 'Tente ajustar os filtros ou o termo de busca.'}
            </p>
            {coupons.length === 0 && (
              <Button size="sm" className="mt-1 gap-1.5" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Criar cupom
              </Button>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={() => openEdit(coupon)}
                onToggle={() => {
                  if (coupon.active) setConfirmDeactivate(coupon);
                  else toggleMutation.mutate({ id: coupon.id, active: true });
                }}
                onDelete={() => {
                  if (confirm(`Excluir o cupom "${coupon.code}" permanentemente?`)) {
                    deleteMutation.mutate(coupon.id);
                  }
                }}
                isToggling={toggleMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm deactivate dialog */}
      <Dialog open={!!confirmDeactivate} onOpenChange={(o) => !o && setConfirmDeactivate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quer desativar este cupom?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O cupom{' '}
            <span className="font-mono font-semibold text-foreground">{confirmDeactivate?.code}</span> não
            poderá mais ser usado por novos clientes. Você pode reativá-lo a qualquer momento.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeactivate(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeactivate) {
                  toggleMutation.mutate({ id: confirmDeactivate.id, active: false });
                  setConfirmDeactivate(null);
                }
              }}
              disabled={toggleMutation.isPending}
            >
              {toggleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FormCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-5 space-y-3">{children}</div>;
}

function FormCardTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-foreground">{children}</p>;
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-transparent border-border text-foreground hover:border-primary/60 hover:text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function ModeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-transparent border-border text-foreground hover:border-primary/60',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function CouponCard({
  coupon,
  onEdit,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}: {
  coupon: Coupon;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const hasShipping = coupon.type === 'FREE_SHIPPING' || coupon.includeShippingInDiscount;

  return (
    <div className="rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4 p-4">
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            coupon.type === 'FREE_SHIPPING'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
              : coupon.type === 'PERCENTAGE'
              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'
              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600',
          ].join(' ')}
        >
          {couponTypeIcon(coupon.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-sm font-semibold text-foreground">{coupon.code}</span>
            <span
              className={[
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border',
                coupon.active
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-muted border-border text-muted-foreground',
              ].join(' ')}
            >
              {coupon.active ? 'Ativado' : 'Inativo'}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{valueLabel(coupon)}</span>
            {hasShipping && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <Truck className="h-3 w-3" />
                Frete incl.
              </span>
            )}
            <span>
              {coupon.usageCount}/{coupon.usageLimit != null ? coupon.usageLimit : '∞'} usos
            </span>
            {coupon.combineWithPromotions && (
              <span className="text-[11px] text-blue-500">Combina promos</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={onEdit}>
            Editar
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Switch
            checked={coupon.active}
            onCheckedChange={onToggle}
            disabled={isToggling}
            aria-label={coupon.active ? 'Desativar cupom' : 'Ativar cupom'}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Scope Picker
// ─────────────────────────────────────────────────────────────────────────────

function ScopePicker({
  scopeType,
  products,
  categories,
  selectedIds,
  onToggle,
}: {
  scopeType: CouponScopeType;
  products: Product[];
  categories: Category[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const isProduct = scopeType === 'SPECIFIC_PRODUCTS' || scopeType === 'SPECIFIC_COLLECTIONS';
  const items = isProduct
    ? products.map((p) => ({ id: p.id, label: p.name, extra: p.sku ? `SKU: ${p.sku}` : undefined }))
    : categories.map((c) => ({ id: c.id, label: c.name, extra: (c as any).slug }));

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      (item.extra?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  const label =
    selectedIds.length > 0
      ? `${selectedIds.length} ${isProduct ? 'produto(s)' : 'categoria(s)'} selecionado(s)`
      : `+ Selecionar ${isProduct ? 'produtos' : 'categorias'}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-sm font-normal text-primary border-primary/30 hover:border-primary"
        >
          {label}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={isProduct ? 'Buscar produto...' : 'Buscar categoria...'}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filteredItems.map((item) => (
                <CommandItem key={item.id} onSelect={() => onToggle(item.id)} className="cursor-pointer">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={[
                        'h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center',
                        selectedIds.includes(item.id)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30',
                      ].join(' ')}
                    >
                      {selectedIds.includes(item.id) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{item.label}</p>
                      {item.extra && <p className="text-xs text-muted-foreground truncate">{item.extra}</p>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

