'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shippingOfferService, {
  ShippingOffer,
  ShippingOfferUpsertRequest,
  ShippingApplyScopeType,
  DeliveryZoneType,
} from '@/services/shippingOfferService';
import productService from '@/services/catalog/product';
import categoryService from '@/services/catalog/categoryService';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import {
  Truck,
  Plus,
  Loader2,
  Package,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── helpers ─────────────────────────────────────────────────── */

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

const SCOPE_LABELS: Record<ShippingApplyScopeType, string> = {
  ENTIRE_STORE: 'Toda a loja',
  CATEGORIES: 'Categorias específicas',
  PRODUCTS: 'Produtos específicos',
};

const ZONE_LABELS: Record<DeliveryZoneType, string> = {
  ALL: 'Todo o Brasil',
  SPECIFIC: 'Regiões específicas',
};

/* ── form state ──────────────────────────────────────────────── */

type FormState = {
  name: string;
  minCartAmount: string;
  deliveryZoneType: DeliveryZoneType;
  applyScopeType: ShippingApplyScopeType;
  applyScopeTargetIds: number[];
  usageLimit: string;
  perCustomerLimit: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const BLANK_FORM: FormState = {
  name: '',
  minCartAmount: '',
  deliveryZoneType: 'ALL',
  applyScopeType: 'ENTIRE_STORE',
  applyScopeTargetIds: [],
  usageLimit: '',
  perCustomerLimit: '',
  startsAt: '',
  expiresAt: '',
  active: true,
};

function offerToForm(offer: ShippingOffer): FormState {
  return {
    name: offer.name,
    minCartAmount: offer.minCartAmount != null ? String(offer.minCartAmount) : '',
    deliveryZoneType: offer.deliveryZoneType,
    applyScopeType: offer.applyScopeType,
    applyScopeTargetIds: offer.applyScopeTargetIds ?? [],
    usageLimit: offer.usageLimit != null ? String(offer.usageLimit) : '',
    perCustomerLimit: offer.perCustomerLimit != null ? String(offer.perCustomerLimit) : '',
    startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 16) : '',
    expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString().slice(0, 16) : '',
    active: offer.active,
  };
}

function formToPayload(form: FormState): ShippingOfferUpsertRequest {
  return {
    name: form.name.trim(),
    shippingMethodCodes: ['ALL'],
    applyScopeType: form.applyScopeType,
    applyScopeTargetIds:
      form.applyScopeType !== 'ENTIRE_STORE' && form.applyScopeTargetIds.length > 0
        ? form.applyScopeTargetIds
        : undefined,
    deliveryZoneType: form.deliveryZoneType,
    minCartAmount: form.minCartAmount ? Number(form.minCartAmount) : undefined,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : null,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    active: form.active,
  };
}

/* ══════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════ */

export function FreeShippingClient() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ShippingOffer | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [scopePickerOpen, setScopePickerOpen] = useState(false);

  /* ── queries ── */
  const { data: offers = [], isLoading } = useQuery<ShippingOffer[]>({
    queryKey: ['shipping-offers'],
    queryFn: shippingOfferService.list,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-for-shipping'],
    queryFn: () => productService.listAll(),
    enabled: sheetOpen && form.applyScopeType === 'PRODUCTS',
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-shipping'],
    queryFn: () => categoryService.list(),
    enabled: sheetOpen && form.applyScopeType === 'CATEGORIES',
  });

  /* ── mutations ── */
  const createMutation = useMutation({
    mutationFn: (payload: ShippingOfferUpsertRequest) => shippingOfferService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-offers'] });
      toast.success('Oferta de frete grátis criada!');
      closeSheet();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Erro ao criar oferta.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ShippingOfferUpsertRequest }) =>
      shippingOfferService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-offers'] });
      toast.success('Oferta atualizada!');
      closeSheet();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Erro ao atualizar oferta.');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      shippingOfferService.toggleActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipping-offers'] }),
    onError: () => toast.error('Erro ao alterar status.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => shippingOfferService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-offers'] });
      toast.success('Oferta removida.');
      setDeleteId(null);
    },
    onError: () => toast.error('Erro ao remover oferta.'),
  });

  /* ── sheet helpers ── */
  const openCreate = () => {
    setEditingOffer(null);
    setForm(BLANK_FORM);
    setScopePickerOpen(false);
    setSheetOpen(true);
  };

  const openEdit = (offer: ShippingOffer) => {
    setEditingOffer(offer);
    setForm(offerToForm(offer));
    setScopePickerOpen(false);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingOffer(null);
    setForm(BLANK_FORM);
  };

  /* ── scope picker helpers ── */
  const toggleScopeId = (id: number) => {
    setForm((prev) => {
      const set = new Set(prev.applyScopeTargetIds);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, applyScopeTargetIds: Array.from(set) };
    });
  };

  const removeScopeId = (id: number) =>
    setForm((prev) => ({
      ...prev,
      applyScopeTargetIds: prev.applyScopeTargetIds.filter((x) => x !== id),
    }));

  const scopeItemLabel = (id: number): string => {
    if (form.applyScopeType === 'PRODUCTS')
      return allProducts.find((p) => p.id === id)?.name ?? `Produto #${id}`;
    if (form.applyScopeType === 'CATEGORIES')
      return allCategories.find((c) => c.id === id)?.name ?? `Categoria #${id}`;
    return `#${id}`;
  };

  /* ── save ── */
  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome da oferta.');
      return;
    }
    if (form.applyScopeType !== 'ENTIRE_STORE' && form.applyScopeTargetIds.length === 0) {
      toast.error('Selecione ao menos um item para o escopo específico.');
      return;
    }
    const payload = formToPayload(form);
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const activeOffers = offers.filter((o) => o.active);

  const pickerItems =
    form.applyScopeType === 'PRODUCTS'
      ? allProducts.map((p) => ({ id: p.id, label: p.name }))
      : allCategories.map((c) => ({ id: c.id, label: c.name }));

  /* ── render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Frete Grátis</h1>
          <p className="text-sm text-muted-foreground">
            Regras de frete grátis com escopo, valor mínimo e período de vigência.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova oferta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10 p-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <Truck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Ativas</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{activeOffers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold">{offers.length}</p>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Truck className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">Nenhuma oferta de frete grátis</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crie sua primeira oferta para incentivar compras.
          </p>
          <Button size="sm" className="mt-5 gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova oferta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-xl border border-border bg-card p-5 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="font-semibold text-foreground">{offer.name}</p>
                  {offer.active ? (
                    <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">
                      Ativa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      Inativa
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    <strong>Zona:</strong> {ZONE_LABELS[offer.deliveryZoneType] ?? offer.deliveryZoneType}
                  </span>
                  <span>
                    <strong>Escopo:</strong> {SCOPE_LABELS[offer.applyScopeType] ?? offer.applyScopeType}
                  </span>
                  {offer.minCartAmount != null && (
                    <span>
                      <strong>Mínimo:</strong> {formatCurrency(offer.minCartAmount)}
                    </span>
                  )}
                  <span>
                    <strong>Usos:</strong> {offer.usageCount}/{offer.usageLimit != null ? offer.usageLimit : '∞'}
                  </span>
                  {offer.perCustomerLimit != null && (
                    <span>
                      <strong>Por cliente:</strong> {offer.perCustomerLimit}x
                    </span>
                  )}
                  {offer.startsAt && (
                    <span>
                      <strong>Início:</strong> {formatDate(offer.startsAt)}
                    </span>
                  )}
                  {offer.expiresAt && (
                    <span>
                      <strong>Expira:</strong> {formatDate(offer.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={offer.active}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: offer.id, active: checked })
                  }
                  disabled={toggleMutation.isPending}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(offer)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(offer.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet editor */}
      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingOffer ? 'Editar oferta de frete grátis' : 'Nova oferta de frete grátis'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5 pb-6">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Nome da oferta *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Frete grátis acima de R$ 199"
              />
            </div>

            {/* Min cart amount */}
            <div className="space-y-1.5">
              <Label>Frete grátis acima de (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.minCartAmount}
                onChange={(e) => setForm((p) => ({ ...p, minCartAmount: e.target.value }))}
                placeholder="Sem mínimo — sempre gratuito"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para oferecer frete grátis independente do valor do carrinho.
              </p>
            </div>

            <Separator />

            {/* Zone */}
            <div className="space-y-2">
              <Label>Zona de entrega</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['ALL', 'SPECIFIC'] as DeliveryZoneType[]).map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, deliveryZoneType: z }))}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      form.deliveryZoneType === z
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {ZONE_LABELS[z]}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Scope */}
            <div className="space-y-2">
              <Label>Aplicar a</Label>
              <div className="space-y-2">
                {(['ENTIRE_STORE', 'CATEGORIES', 'PRODUCTS'] as ShippingApplyScopeType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        applyScopeType: s,
                        applyScopeTargetIds: [],
                      }))
                    }
                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      form.applyScopeType === s
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {SCOPE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope target picker */}
            {form.applyScopeType !== 'ENTIRE_STORE' && (
              <div className="space-y-2">
                <Label>
                  {form.applyScopeType === 'PRODUCTS'
                    ? 'Selecionar produtos'
                    : 'Selecionar categorias'}
                </Label>

                {form.applyScopeTargetIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.applyScopeTargetIds.map((id) => (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1">
                        <span className="text-xs">{scopeItemLabel(id)}</span>
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

                <button
                  type="button"
                  onClick={() => setScopePickerOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:border-foreground/30 transition-colors"
                >
                  <span>
                    {form.applyScopeType === 'PRODUCTS' ? 'Buscar produtos...' : 'Buscar categorias...'}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${scopePickerOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {scopePickerOpen && (
                  <div className="rounded-lg border border-border shadow-sm">
                    <Command>
                      <CommandInput
                        placeholder={
                          form.applyScopeType === 'PRODUCTS'
                            ? 'Filtrar produtos...'
                            : 'Filtrar categorias...'
                        }
                      />
                      <CommandList className="max-h-48">
                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                        <CommandGroup>
                          {pickerItems.map((item) => {
                            const selected = form.applyScopeTargetIds.includes(item.id);
                            return (
                              <CommandItem
                                key={item.id}
                                value={item.label}
                                onSelect={() => toggleScopeId(item.id)}
                                className="gap-2"
                              >
                                <div
                                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                                    selected ? 'bg-primary border-primary' : 'border-input'
                                  }`}
                                >
                                  {selected && (
                                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                  )}
                                </div>
                                {item.label}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Usage limits */}
            <div className="space-y-3">
              <Label>Limites de uso</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Total de usos</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Por cliente</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.perCustomerLimit}
                    onChange={(e) => setForm((p) => ({ ...p, perCustomerLimit: e.target.value }))}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe vazio para usos ilimitados — a oferta fica ativa até você desativar.
              </p>
            </div>

            <Separator />

            {/* Validity period */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label>Período de vigência</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Início</Label>
                  <Input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Expiração</Label>
                  <Input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe vazio para ativar/desativar manualmente a qualquer momento.
              </p>
            </div>

            <Separator />

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Oferta ativa</p>
                <p className="text-xs text-muted-foreground">
                  {form.active ? 'Visível para clientes' : 'Oculta para clientes'}
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={closeSheet}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingOffer ? 'Salvar alterações' : 'Criar oferta'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover oferta de frete grátis?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A oferta será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
