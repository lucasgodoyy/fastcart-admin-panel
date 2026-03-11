'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tags, X, Check, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { promotionService } from '@/services/sales';
import productService from '@/services/catalog/product';
import categoryService from '@/services/catalog/categoryService';
import { Promotion, PromotionApplyScopeType, PromotionUpsertRequest } from '@/types/promotion';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

type PromotionFormState = {
  name: string;
  buyQuantity: string;
  payQuantity: string;
  buyScopeType: PromotionApplyScopeType;
  buyScopeTargetIds: number[];
  payScopeType: PromotionApplyScopeType;
  payScopeTargetIds: number[];
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const EMPTY_FORM: PromotionFormState = {
  name: '',
  buyQuantity: '2',
  payQuantity: '1',
  buyScopeType: 'ENTIRE_STORE',
  buyScopeTargetIds: [],
  payScopeType: 'ENTIRE_STORE',
  payScopeTargetIds: [],
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  active: true,
};

const SCOPE_OPTIONS: { value: PromotionApplyScopeType; label: string }[] = [
  { value: 'ENTIRE_STORE', label: 'Loja inteira' },
  { value: 'CATEGORIES', label: 'Categorias específicas' },
  { value: 'PRODUCTS', label: 'Produtos específicos' },
  { value: 'BRANDS', label: 'Marcas específicas' },
];

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

export function PromotionsClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [buyPickerOpen, setBuyPickerOpen] = useState(false);
  const [payPickerOpen, setPayPickerOpen] = useState(false);

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: promotionService.listAll,
  });

  const needsProducts = isDialogOpen && (form.buyScopeType === 'PRODUCTS' || form.payScopeType === 'PRODUCTS');
  const needsCategories = isDialogOpen && (form.buyScopeType === 'CATEGORIES' || form.payScopeType === 'CATEGORIES');

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-for-promotion'],
    queryFn: () => productService.listAll(),
    enabled: needsProducts,
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-promotion'],
    queryFn: () => categoryService.list(),
    enabled: needsCategories,
  });

  const createMutation = useMutation({
    mutationFn: (request: PromotionUpsertRequest) => promotionService.create(request),
    onSuccess: () => {
      toast.success('Promoção criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao criar promoção')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: PromotionUpsertRequest }) => promotionService.update(id, request),
    onSuccess: () => {
      toast.success('Promoção atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao atualizar promoção')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => promotionService.toggleActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao alterar status da promoção')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionService.delete(id),
    onSuccess: () => {
      toast.success('Promoção removida com sucesso');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setDeleteId(null);
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao remover promoção')),
  });

  const stats = useMemo(() => {
    const activeCount = promotions.filter((promotion) => promotion.active).length;
    return {
      total: promotions.length,
      active: activeCount,
      inactive: promotions.length - activeCount,
    };
  }, [promotions]);

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setForm({
      name: promotion.name,
      buyQuantity: String(promotion.buyQuantity),
      payQuantity: String(promotion.payQuantity),
      buyScopeType: promotion.buyScopeType,
      buyScopeTargetIds: promotion.buyScopeTargetIds ?? [],
      payScopeType: promotion.payScopeType,
      payScopeTargetIds: promotion.payScopeTargetIds ?? [],
      usageLimit: promotion.usageLimit != null ? String(promotion.usageLimit) : '',
      startsAt: promotion.startsAt ? promotion.startsAt.slice(0, 16) : '',
      expiresAt: promotion.expiresAt ? promotion.expiresAt.slice(0, 16) : '',
      active: promotion.active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromotion(null);
    setForm(EMPTY_FORM);
  };

  const toPayload = (): PromotionUpsertRequest | null => {
    const buyQuantity = Number(form.buyQuantity);
    const payQuantity = Number(form.payQuantity);

    if (!form.name.trim() || !Number.isInteger(buyQuantity) || !Number.isInteger(payQuantity)) {
      toast.error('Nome, quantidade de compra e de pagamento são obrigatórios');
      return null;
    }

    if (buyQuantity < 1 || payQuantity < 1 || payQuantity > buyQuantity) {
      toast.error('Regra inválida: comprar deve ser >= pagar e ambos >= 1');
      return null;
    }

    if (form.buyScopeType !== 'ENTIRE_STORE' && form.buyScopeTargetIds.length === 0) {
      toast.error('Selecione ao menos um item para o escopo de compra');
      return null;
    }

    if (form.payScopeType !== 'ENTIRE_STORE' && form.payScopeTargetIds.length === 0) {
      toast.error('Selecione ao menos um item para o escopo de pagamento');
      return null;
    }

    return {
      name: form.name.trim(),
      discountType: 'BUY_X_PAY_Y',
      buyQuantity,
      payQuantity,
      buyScopeType: form.buyScopeType,
      buyScopeTargetIds: form.buyScopeType !== 'ENTIRE_STORE' ? form.buyScopeTargetIds : null,
      payScopeType: form.payScopeType,
      payScopeTargetIds: form.payScopeType !== 'ENTIRE_STORE' ? form.payScopeTargetIds : null,
      combineWithPriceDiscounts: true,
      combineWithFreeShipping: false,
      combineWithCartDiscounts: false,
      combineWithAppDiscounts: false,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    };
  };

  const handleSubmit = () => {
    const payload = toPayload();
    if (!payload) return;

    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, request: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── scope helpers ── */
  const toggleId = (field: 'buyScopeTargetIds' | 'payScopeTargetIds', id: number) => {
    setForm((prev) => {
      const set = new Set(prev[field]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  const removeId = (field: 'buyScopeTargetIds' | 'payScopeTargetIds', id: number) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((x) => x !== id) }));

  const scopeItemLabel = (scopeType: PromotionApplyScopeType, id: number): string => {
    if (scopeType === 'PRODUCTS') return allProducts.find((p) => p.id === id)?.name ?? `Produto #${id}`;
    if (scopeType === 'CATEGORIES') return allCategories.find((c) => c.id === id)?.name ?? `Categoria #${id}`;
    return `#${id}`;
  };

  const pickerItems = (scopeType: PromotionApplyScopeType) => {
    if (scopeType === 'PRODUCTS') return allProducts.map((p) => ({ id: p.id, label: p.name }));
    if (scopeType === 'CATEGORIES') return allCategories.map((c) => ({ id: c.id, label: c.name }));
    return [];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-5 font-semibold text-foreground">Promoções</h1>
          <p className="text-sm text-muted-foreground">Descontos por regra Compre X, Pague Y aplicados automaticamente.</p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nova promoção
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Ativas</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{stats.active}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Inativas</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{stats.inactive}</p>
        </div>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Nome</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Regra</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Uso</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando promoções...
                </td>
              </tr>
            )}

            {!isLoading && promotions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma promoção encontrada.
                </td>
              </tr>
            )}

            {!isLoading &&
              promotions.map((promotion) => (
                <tr key={promotion.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{promotion.name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    Compre {promotion.buyQuantity}, pague {promotion.payQuantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {promotion.usageCount}/{promotion.usageLimit ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        promotion.active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {promotion.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(promotion)}>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: promotion.id, active: !promotion.active })}
                      >
                        {promotion.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(promotion.id)}
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Editar promoção' : 'Criar promoção'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nome interno da promoção"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                min="1"
                value={form.buyQuantity}
                onChange={(event) => setForm((prev) => ({ ...prev, buyQuantity: event.target.value }))}
                placeholder="Quantidade de compra"
              />
              <Input
                type="number"
                min="1"
                value={form.payQuantity}
                onChange={(event) => setForm((prev) => ({ ...prev, payQuantity: event.target.value }))}
                placeholder="Quantidade de pagamento"
              />
            </div>

            {/* Buy scope select */}
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Escopo de compra</span>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.buyScopeType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, buyScopeType: e.target.value as PromotionApplyScopeType, buyScopeTargetIds: [] }))
                }
              >
                {SCOPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            {/* Buy scope picker */}
            {form.buyScopeType !== 'ENTIRE_STORE' && form.buyScopeType !== 'BRANDS' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {form.buyScopeTargetIds.map((id) => (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {scopeItemLabel(form.buyScopeType, id)}
                      <button type="button" onClick={() => removeId('buyScopeTargetIds', id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setBuyPickerOpen((v) => !v)}
                  >
                    Selecionar {form.buyScopeType === 'CATEGORIES' ? 'categorias' : 'produtos'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                  {buyPickerOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                      <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList className="max-h-44 overflow-y-auto">
                          <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                          <CommandGroup>
                            {pickerItems(form.buyScopeType).map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => toggleId('buyScopeTargetIds', item.id)}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    form.buyScopeTargetIds.includes(item.id) ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
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
            )}

            {/* Pay scope select */}
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Escopo de pagamento</span>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={form.payScopeType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, payScopeType: e.target.value as PromotionApplyScopeType, payScopeTargetIds: [] }))
                }
              >
                {SCOPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            {/* Pay scope picker */}
            {form.payScopeType !== 'ENTIRE_STORE' && form.payScopeType !== 'BRANDS' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {form.payScopeTargetIds.map((id) => (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {scopeItemLabel(form.payScopeType, id)}
                      <button type="button" onClick={() => removeId('payScopeTargetIds', id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setPayPickerOpen((v) => !v)}
                  >
                    Selecionar {form.payScopeType === 'CATEGORIES' ? 'categorias' : 'produtos'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                  {payPickerOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                      <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList className="max-h-44 overflow-y-auto">
                          <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                          <CommandGroup>
                            {pickerItems(form.payScopeType).map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => toggleId('payScopeTargetIds', item.id)}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    form.payScopeTargetIds.includes(item.id) ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
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
            )}

            <Input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(event) => setForm((prev) => ({ ...prev, usageLimit: event.target.value }))}
              placeholder="Limite de uso (opcional)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Início</span>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Expiração</span>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Promoção ativa
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingPromotion ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary">
        <Tags className="h-3.5 w-3.5" />
        Promoções disponíveis via /api/v1/promotions
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover promoção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A promoção será excluída permanentemente.
            </AlertDialogDescription>
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
  );
}
