'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, TicketPercent, Trash2, X, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { couponService } from '@/services/sales';
import productService from '@/services/catalog/product';
import categoryService from '@/services/catalog/categoryService';
import { Coupon, CouponScopeType, CouponType, CouponUpsertRequest } from '@/types/coupon';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

type CouponFormState = {
  code: string;
  scopeType: CouponScopeType;
  scopeTargetIds: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  perCustomerLimit: string;
  firstOrderOnly: boolean;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const EMPTY_FORM: CouponFormState = {
  code: '',
  scopeType: 'ALL_PRODUCTS',
  scopeTargetIds: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  perCustomerLimit: '',
  firstOrderOnly: false,
  startsAt: '',
  expiresAt: '',
  active: true,
};

const parseNumber = (value: string): number | null => {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseIds = (value: string): number[] | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = normalized
    .split(',')
    .map((token) => Number(token.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  return parsed.length ? Array.from(new Set(parsed)) : null;
};

const resolveApiErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string; error?: string; details?: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.response?.data?.details ||
    axiosError.message ||
    fallback
  );
};

const valueLabel = (coupon: Coupon) =>
  coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}%` : `R$ ${Number(coupon.value).toFixed(2)}`;

export function CouponsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: couponService.listAll,
  });

  const createMutation = useMutation({
    mutationFn: (request: CouponUpsertRequest) => couponService.create(request),
    onSuccess: () => {
      toast.success('Cupom criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao criar cupom')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: CouponUpsertRequest }) => couponService.update(id, request),
    onSuccess: () => {
      toast.success('Cupom atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao atualizar cupom')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => couponService.toggleActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao alterar status do cupom')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponService.delete(id),
    onSuccess: () => {
      toast.success('Cupom excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao excluir cupom')),
  });

  const filteredCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return coupons;

    return coupons.filter((coupon) => {
      return (
        coupon.code.toLowerCase().includes(term) ||
        coupon.scopeType.toLowerCase().includes(term) ||
        coupon.type.toLowerCase().includes(term)
      );
    });
  }, [coupons, search]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      scopeType: coupon.scopeType,
      scopeTargetIds: coupon.scopeTargetIds?.join(',') || '',
      type: coupon.type,
      value: String(coupon.value ?? ''),
      minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : '',
      maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      perCustomerLimit: coupon.perCustomerLimit != null ? String(coupon.perCustomerLimit) : '',
      firstOrderOnly: coupon.firstOrderOnly,
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
      active: coupon.active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
  };

  const toPayload = (): CouponUpsertRequest | null => {
    const value = parseNumber(form.value);
    if (!form.code.trim() || value === null || value <= 0) {
      toast.error('Informe código e valor de desconto válidos');
      return null;
    }

    const scopeTargetIds = parseIds(form.scopeTargetIds);
    if (form.scopeType !== 'ALL_PRODUCTS' && !scopeTargetIds) {
      toast.error('Para escopo específico, informe ao menos um ID de destino');
      return null;
    }

    return {
      code: form.code.trim().toUpperCase(),
      scopeType: form.scopeType,
      scopeTargetIds,
      type: form.type,
      value,
      minOrderAmount: parseNumber(form.minOrderAmount),
      maxDiscountAmount: parseNumber(form.maxDiscountAmount),
      usageLimit: parseNumber(form.usageLimit),
      perCustomerLimit: parseNumber(form.perCustomerLimit),
      firstOrderOnly: form.firstOrderOnly,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    };
  };

  const handleSubmit = () => {
    const payload = toPayload();
    if (!payload) return;

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, request: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Product & Category data for scope pickers ──
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-for-coupon'],
    queryFn: () => productService.listAll(),
    enabled: isDialogOpen && (form.scopeType === 'SPECIFIC_PRODUCTS' || form.scopeType === 'SPECIFIC_COLLECTIONS'),
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-coupon'],
    queryFn: () => categoryService.list(),
    enabled: isDialogOpen && form.scopeType === 'SPECIFIC_CATEGORIES',
  });

  const selectedIds = useMemo(() => {
    const raw = form.scopeTargetIds.trim();
    if (!raw) return [] as number[];
    return raw.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
  }, [form.scopeTargetIds]);

  const toggleScopeId = (id: number) => {
    const current = new Set(selectedIds);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setForm((prev) => ({ ...prev, scopeTargetIds: Array.from(current).join(',') }));
  };

  const removeScopeId = (id: number) => {
    setForm((prev) => ({
      ...prev,
      scopeTargetIds: selectedIds.filter((x) => x !== id).join(','),
    }));
  };

  const scopeLabel = (id: number): string => {
    if (form.scopeType === 'SPECIFIC_PRODUCTS' || form.scopeType === 'SPECIFIC_COLLECTIONS') {
      return allProducts.find((p) => p.id === id)?.name || `Produto #${id}`;
    }
    if (form.scopeType === 'SPECIFIC_CATEGORIES') {
      return allCategories.find((c) => c.id === id)?.name || `Categoria #${id}`;
    }
    return `#${id}`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-5 font-semibold text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground">Cupons com desconto percentual ou valor fixo.</p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Novo cupom
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cupom por código, tipo ou escopo"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">{filteredCoupons.length} cupons</div>

      <div className="overflow-x-auto overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Código</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Discount</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Uso</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando cupons...
                </td>
              </tr>
            )}

            {!isLoading && filteredCoupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhum cupom encontrado.
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{coupon.code}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{valueLabel(coupon)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {coupon.usageCount}/{coupon.usageLimit ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        coupon.active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(coupon)}>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: coupon.id, active: !coupon.active })}
                      >
                        {coupon.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Excluir cupom "${coupon.code}" permanentemente?`)) {
                            deleteMutation.mutate(coupon.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Editar cupom' : 'Criar cupom'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Code */}
            <div className="space-y-1.5">
              <Label>Código do cupom</Label>
              <Input
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="Ex.: BEMVINDO10"
              />
            </div>

            {/* Discount Type + Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de desconto</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as CouponType }))}
                >
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED_AMOUNT">Valor fixo (R$)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>{form.type === 'PERCENTAGE' ? 'Valor do desconto (%)' : 'Valor do desconto (R$)'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.value}
                  onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
                  placeholder={form.type === 'PERCENTAGE' ? 'Ex.: 10' : 'Ex.: 25.00'}
                />
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-1.5">
              <Label>Escopo de aplicação</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.scopeType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    scopeType: event.target.value as CouponScopeType,
                    scopeTargetIds: '',
                  }))
                }
              >
                <option value="ALL_PRODUCTS">Todos os produtos</option>
                <option value="SPECIFIC_PRODUCTS">Produtos específicos</option>
                <option value="SPECIFIC_CATEGORIES">Categorias específicas</option>
                <option value="SPECIFIC_COLLECTIONS">Coleções específicas</option>
              </select>
            </div>

            {/* Scope Target Picker */}
            {form.scopeType !== 'ALL_PRODUCTS' && (
              <div className="space-y-1.5">
                <Label>
                  {form.scopeType === 'SPECIFIC_PRODUCTS' || form.scopeType === 'SPECIFIC_COLLECTIONS'
                    ? 'Selecione os produtos'
                    : 'Selecione as categorias'}
                </Label>

                {/* Selected items badges */}
                {selectedIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedIds.map((id) => (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1">
                        <span className="text-xs">{scopeLabel(id)}</span>
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

                {/* Searchable picker */}
                <ScopePicker
                  scopeType={form.scopeType}
                  products={allProducts}
                  categories={allCategories}
                  selectedIds={selectedIds}
                  onToggle={toggleScopeId}
                />
              </div>
            )}

            {/* Min Order + Max Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pedido mínimo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={(event) => setForm((prev) => ({ ...prev, minOrderAmount: event.target.value }))}
                  placeholder="Sem mínimo"
                />
                <p className="text-xs text-muted-foreground">Valor mínimo do carrinho para aplicar o cupom</p>
              </div>
              <div className="space-y-1.5">
                <Label>Desconto máximo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.maxDiscountAmount}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxDiscountAmount: event.target.value }))}
                  placeholder="Sem limite"
                />
                <p className="text-xs text-muted-foreground">Teto do desconto (útil para cupons percentuais)</p>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Limite total de usos</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={(event) => setForm((prev) => ({ ...prev, usageLimit: event.target.value }))}
                  placeholder="Ilimitado"
                />
                <p className="text-xs text-muted-foreground">Quantas vezes o cupom pode ser usado no total</p>
              </div>
              <div className="space-y-1.5">
                <Label>Limite por cliente</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.perCustomerLimit}
                  onChange={(event) => setForm((prev) => ({ ...prev, perCustomerLimit: event.target.value }))}
                  placeholder="Ilimitado"
                />
                <p className="text-xs text-muted-foreground">Quantas vezes cada cliente pode usar este cupom</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data de início</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Data de expiração</Label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.firstOrderOnly}
                onChange={(event) => setForm((prev) => ({ ...prev, firstOrderOnly: event.target.checked }))}
              />
              Apenas primeiro pedido
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Cupom ativo
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingCoupon ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary">
        <TicketPercent className="h-3.5 w-3.5" />
        Cupons ligados ao backend em /api/v1/coupons
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Scope Picker — searchable product/category multi-select
// ═══════════════════════════════════════════════════════════════

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
    : categories.map((c) => ({ id: c.id, label: c.name, extra: c.slug }));

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    (item.extra?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-sm font-normal">
          {selectedIds.length > 0
            ? `${selectedIds.length} ${isProduct ? 'produto(s)' : 'categoria(s)'} selecionado(s)`
            : `Buscar ${isProduct ? 'produtos' : 'categorias'}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={isProduct ? 'Buscar produto por nome ou SKU...' : 'Buscar categoria por nome...'}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filtered.map((item) => (
                <CommandItem key={item.id} onSelect={() => onToggle(item.id)} className="cursor-pointer">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center ${
                        selectedIds.includes(item.id)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      }`}
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
