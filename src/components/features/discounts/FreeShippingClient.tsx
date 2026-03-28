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
import brandService from '@/services/catalog/brand';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Brand } from '@/types/brand';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowLeft,
  ExternalLink,
  Tag,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { FieldHelper } from '@/components/shared/field-helper';

/* -- helpers --------------------------------------------------- */

function formatCurrency(value: number | null | undefined) {
  if (value == null) return 'Â';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'Â';
  return new Date(iso).toLocaleDateString('pt-BR');
}

const SCOPE_LABELS: Record<ShippingApplyScopeType, string> = {
  ENTIRE_STORE: 'Toda a loja',
  CATEGORIES: 'Categorias especÃ­ficas',
  PRODUCTS: 'Produtos especÃ­ficos',
  BRANDS: 'Marcas especÃ­ficas',
};

const SCOPE_DESCRIPTIONS: Record<ShippingApplyScopeType, string> = {
  ENTIRE_STORE: 'Aplica o frete grÃ¡tis para qualquer produto da loja.',
  CATEGORIES: 'Somente produtos de categorias selecionadas recebem o benefÃ­cio.',
  PRODUCTS: 'Somente os produtos selecionados recebem o benefÃ­cio.',
  BRANDS: 'Somente produtos das marcas selecionadas recebem o benefÃ­cio.',
};

const ZONE_LABELS: Record<DeliveryZoneType, string> = {
  ALL: 'Todo o Brasil',
  SPECIFIC: 'RegiÃµes especÃ­ficas',
};

const ZONE_DESCRIPTIONS: Record<DeliveryZoneType, string> = {
  ALL: 'Frete grÃ¡tis para qualquer endereÃ§o de entrega.',
  SPECIFIC: 'Defina estados ou zonas postais elegÃ­veis.',
};

/* -- form state ------------------------------------------------ */

type CartAmountMode = 'NONE' | 'MIN';
type DateMode = 'UNLIMITED' | 'PERIOD';

type FormState = {
  name: string;
  lowestCostOnly: boolean;
  allowCombineWithOtherDiscounts: boolean;
  deliveryZoneType: DeliveryZoneType;
  applyScopeType: ShippingApplyScopeType;
  applyScopeTargetIds: number[];
  cartAmountMode: CartAmountMode;
  minCartAmount: string;
  dateMode: DateMode;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perCustomerLimit: string;
  active: boolean;
};

const BLANK_FORM: FormState = {
  name: '',
  lowestCostOnly: true,
  allowCombineWithOtherDiscounts: true,
  deliveryZoneType: 'ALL',
  applyScopeType: 'ENTIRE_STORE',
  applyScopeTargetIds: [],
  cartAmountMode: 'NONE',
  minCartAmount: '',
  dateMode: 'UNLIMITED',
  startsAt: '',
  expiresAt: '',
  usageLimit: '',
  perCustomerLimit: '',
  active: true,
};

function offerToForm(offer: ShippingOffer): FormState {
  return {
    name: offer.name,
    lowestCostOnly: offer.lowestCostOnly,
    allowCombineWithOtherDiscounts: offer.allowCombineWithOtherDiscounts,
    deliveryZoneType: offer.deliveryZoneType,
    applyScopeType: offer.applyScopeType,
    applyScopeTargetIds: offer.applyScopeTargetIds ?? [],
    cartAmountMode: offer.minCartAmount != null ? 'MIN' : 'NONE',
    minCartAmount: offer.minCartAmount != null ? String(offer.minCartAmount) : '',
    dateMode: offer.startsAt || offer.expiresAt ? 'PERIOD' : 'UNLIMITED',
    startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 16) : '',
    expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString().slice(0, 16) : '',
    usageLimit: offer.usageLimit != null ? String(offer.usageLimit) : '',
    perCustomerLimit: offer.perCustomerLimit != null ? String(offer.perCustomerLimit) : '',
    active: offer.active,
  };
}

function formToPayload(form: FormState): ShippingOfferUpsertRequest {
  return {
    name: form.name.trim(),
    shippingMethodCodes: ['ALL'],
    lowestCostOnly: form.lowestCostOnly,
    allowCombineWithOtherDiscounts: form.allowCombineWithOtherDiscounts,
    applyScopeType: form.applyScopeType,
    applyScopeTargetIds:
      form.applyScopeType !== 'ENTIRE_STORE' && form.applyScopeTargetIds.length > 0
        ? form.applyScopeTargetIds
        : undefined,
    deliveryZoneType: form.deliveryZoneType,
    minCartAmount:
      form.cartAmountMode === 'MIN' && form.minCartAmount ? Number(form.minCartAmount) : undefined,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : null,
    startsAt:
      form.dateMode === 'PERIOD' && form.startsAt
        ? new Date(form.startsAt).toISOString()
        : undefined,
    expiresAt:
      form.dateMode === 'PERIOD' && form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : undefined,
    active: form.active,
  };
}

/* -- Section wrapper ------------------------------------------- */

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

/* -- Radio card ------------------------------------------------ */

function RadioCard({
  selected,
  onClick,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:border-foreground/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected ? 'border-primary' : 'border-muted-foreground/40'
          }`}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <p className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
              {title}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

/* -- Truck SVG illustration ------------------------------------ */

function TruckIllustration() {
  return (
    <svg
      width="120"
      height="90"
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Road */}
      <rect x="0" y="72" width="120" height="6" rx="3" fill="#E2E8F0" />
      {/* Trailer body */}
      <rect x="4" y="30" width="72" height="44" rx="4" fill="#3B82F6" />
      {/* Cabin */}
      <path d="M76 50 L76 74 L110 74 L110 50 L96 36 L76 36 Z" fill="#2563EB" />
      {/* Cabin window */}
      <path d="M80 38 L80 50 L108 50 L108 38 L96 27 Z" fill="#BFDBFE" />
      {/* Door line */}
      <line x1="93" y1="50" x2="93" y2="74" stroke="#1D4ED8" strokeWidth="1.5" />
      {/* Wheel back */}
      <circle cx="22" cy="76" r="10" fill="#1E293B" />
      <circle cx="22" cy="76" r="6" fill="#475569" />
      <circle cx="22" cy="76" r="2" fill="#94A3B8" />
      {/* Wheel front small */}
      <circle cx="56" cy="76" r="10" fill="#1E293B" />
      <circle cx="56" cy="76" r="6" fill="#475569" />
      <circle cx="56" cy="76" r="2" fill="#94A3B8" />
      {/* Wheel cabin */}
      <circle cx="96" cy="76" r="10" fill="#1E293B" />
      <circle cx="96" cy="76" r="6" fill="#475569" />
      <circle cx="96" cy="76" r="2" fill="#94A3B8" />
      {/* Check circle overlay on trailer */}
      <circle cx="38" cy="52" r="12" fill="white" fillOpacity="0.9" />
      <path
        d="M32 52 L36 56 L44 48"
        stroke="#16A34A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --------------------------------------------------------------
   Main component
--------------------------------------------------------------- */

export function FreeShippingClient() {
  const queryClient = useQueryClient();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingOffer, setEditingOffer] = useState<ShippingOffer | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [scopePickerOpen, setScopePickerOpen] = useState(false);

  /* -- queries -- */
  const { data: offers = [], isLoading } = useQuery<ShippingOffer[]>({
    queryKey: ['shipping-offers'],
    queryFn: shippingOfferService.list,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products-for-shipping'],
    queryFn: () => productService.listAll(),
    enabled: view === 'form' && form.applyScopeType === 'PRODUCTS',
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-shipping'],
    queryFn: () => categoryService.list(),
    enabled: view === 'form' && form.applyScopeType === 'CATEGORIES',
  });

  const { data: allBrands = [] } = useQuery<Brand[]>({
    queryKey: ['brands-for-shipping'],
    queryFn: () => brandService.list(),
    enabled: view === 'form' && form.applyScopeType === 'BRANDS',
  });

  /* -- mutations -- */
  const createMutation = useMutation({
    mutationFn: (payload: ShippingOfferUpsertRequest) => shippingOfferService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-offers'] });
      toast.success('Oferta de frete grÃ¡tis criada!');
      closeForm();
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
      closeForm();
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

  /* -- navigation helpers -- */
  const openCreate = () => {
    setEditingOffer(null);
    setForm(BLANK_FORM);
    setScopePickerOpen(false);
    setView('form');
  };

  const openEdit = (offer: ShippingOffer) => {
    setEditingOffer(offer);
    setForm(offerToForm(offer));
    setScopePickerOpen(false);
    setView('form');
  };

  const closeForm = () => {
    setView('list');
    setEditingOffer(null);
    setForm(BLANK_FORM);
  };

  /* -- scope picker helpers -- */
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
    if (form.applyScopeType === 'BRANDS')
      return allBrands.find((b) => b.id === id)?.name ?? `Marca #${id}`;
    return `#${id}`;
  };

  const pickerItems: { id: number; label: string }[] =
    form.applyScopeType === 'PRODUCTS'
      ? allProducts.map((p) => ({ id: p.id, label: p.name }))
      : form.applyScopeType === 'BRANDS'
      ? allBrands.map((b) => ({ id: b.id, label: b.name }))
      : allCategories.map((c) => ({ id: c.id, label: c.name }));

  /* -- save -- */
  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome da oferta.');
      return;
    }
    if (form.applyScopeType !== 'ENTIRE_STORE' && form.applyScopeTargetIds.length === 0) {
      toast.error('Selecione ao menos um item para o escopo especÃ­fico.');
      return;
    }
    if (form.cartAmountMode === 'MIN' && !form.minCartAmount) {
      toast.error('Informe o valor mÃ­nimo do carrinho.');
      return;
    }
    const payload = formToPayload(form);
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isEditing = !!editingOffer;
  const activeOffers = offers.filter((o) => o.active);

  /* --------------------------------------------------------------
     VIEW: FORM (full-page)
  --------------------------------------------------------------- */
  if (view === 'form') {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">

        {/* -- Sticky top bar -- */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={closeForm}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-semibold text-foreground">
              {isEditing ? 'Editar oferta de frete grÃ¡tis' : 'Configurar frete grÃ¡tis'}
            </span>
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </div>

        {/* -- Scrollable form body -- */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">

            {/* 0 Â Name */}
            <FormSection title="Nome da oferta">
              <div className="space-y-1.5">
                <Label htmlFor="offer-name" className="text-xs text-muted-foreground">
                  Use um nome descritivo para identificar internamente.
                  <FieldHelper
                    content="Este nome ajuda a equipe a identificar rapidamente a regra de frete grátis no painel."
                    learnMoreHref="/admin/tutorials/marketing"
                  />
                </Label>
                <Input
                  id="offer-name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder='Ex: "Frete grÃ¡tis acima de R$ 199 Â Sul e Sudeste"'
                />
              </div>
            </FormSection>

            {/* 1 Â Where to apply */}
            <FormSection title="Onde o frete grÃ¡tis serÃ¡ aplicado?">
              <div className="space-y-2">
                {(
                  ['ENTIRE_STORE', 'CATEGORIES', 'PRODUCTS', 'BRANDS'] as ShippingApplyScopeType[]
                ).map((s) => (
                  <RadioCard
                    key={s}
                    selected={form.applyScopeType === s}
                    onClick={() => {
                      setForm((p) => ({ ...p, applyScopeType: s, applyScopeTargetIds: [] }));
                      setScopePickerOpen(false);
                    }}
                    title={SCOPE_LABELS[s]}
                    description={SCOPE_DESCRIPTIONS[s]}
                    icon={
                      s === 'CATEGORIES' ? (
                        <Tag className="h-3.5 w-3.5" />
                      ) : s === 'BRANDS' ? (
                        <Package className="h-3.5 w-3.5" />
                      ) : s === 'PRODUCTS' ? (
                        <Truck className="h-3.5 w-3.5" />
                      ) : undefined
                    }
                  />
                ))}
              </div>

              {/* Scope target picker (categories / products / brands) */}
              {form.applyScopeType !== 'ENTIRE_STORE' && (
                <div className="space-y-2 pt-1">
                  <Label className="text-xs text-muted-foreground">
                    {form.applyScopeType === 'PRODUCTS'
                      ? 'Selecionar produtos'
                      : form.applyScopeType === 'BRANDS'
                      ? 'Selecionar marcas'
                      : 'Selecionar categorias'}
                    <FieldHelper
                      content="Escolha os alvos da promoção para controlar impacto de margem e evitar frete grátis em todo catálogo sem necessidade."
                      learnMoreHref="/admin/tutorials/marketing"
                    />
                  </Label>

                  {form.applyScopeTargetIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.applyScopeTargetIds.map((id) => (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1 text-xs">
                          {scopeItemLabel(id)}
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
                      {form.applyScopeType === 'PRODUCTS'
                        ? 'Buscar produtos...'
                        : form.applyScopeType === 'BRANDS'
                        ? 'Buscar marcas...'
                        : 'Buscar categorias...'}
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
                              : form.applyScopeType === 'BRANDS'
                              ? 'Filtrar marcas...'
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

              {/* Delivery zone */}
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  RegiÃ£o de entrega
                  <FieldHelper
                    content="Defina se a oferta vale para todo o Brasil ou apenas para regiões específicas de entrega."
                    learnMoreHref="/admin/tutorials/marketing"
                  />
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(['ALL', 'SPECIFIC'] as DeliveryZoneType[]).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setField('deliveryZoneType', z)}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-all ${
                        form.deliveryZoneType === z
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <MapPin
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          form.deliveryZoneType === z ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm leading-tight font-medium ${
                            form.deliveryZoneType === z ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {ZONE_LABELS[z]}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                          {ZONE_DESCRIPTIONS[z]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </FormSection>

            {/* 2 Â Shipping type */}
            <FormSection title="Tipo de envio">
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    id="lowest-cost-only"
                    checked={form.lowestCostOnly}
                    onCheckedChange={(checked: boolean | 'indeterminate') => setField('lowestCostOnly', checked === true)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">
                      Aplicar somente para a opÃ§Ã£o de envio com menor custo
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Recomendado para proteger a margem de lucro Â o frete grÃ¡tis Ã© concedido
                      apenas na modalidade econÃ´mica (PAC / Envio FÃ¡cil), evitando subsidiar
                      fretes expressos.
                    </p>
                  </div>
                </label>

                <Separator />

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    id="combine"
                    checked={form.allowCombineWithOtherDiscounts}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      setField('allowCombineWithOtherDiscounts', checked === true)
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">
                      Permitir combinar com outros descontos
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Quando ativo, clientes podem usar cupons ou promoÃ§Ãµes em conjunto com este
                      frete grÃ¡tis.
                    </p>
                  </div>
                </label>
              </div>
            </FormSection>

            {/* 3 Â Conditions */}
            <FormSection title="CondiÃ§Ãµes de uso">

              {/* Cart value */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Valor do carrinho</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['NONE', 'MIN'] as CartAmountMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setField('cartAmountMode', mode)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        form.cartAmountMode === mode
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      {mode === 'NONE' ? 'Sem mÃ­nimo' : 'A partir de'}
                    </button>
                  ))}
                </div>
                {form.cartAmountMode === 'MIN' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-medium text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.minCartAmount}
                      onChange={(e) => setField('minCartAmount', e.target.value)}
                      placeholder="199,00"
                      className="max-w-45"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Validity date */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Validade</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['UNLIMITED', 'PERIOD'] as DateMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setField('dateMode', mode)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        form.dateMode === mode
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      {mode === 'UNLIMITED' ? 'Ilimitada' : 'PerÃ­odo'}
                    </button>
                  ))}
                </div>
                {form.dateMode === 'PERIOD' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">De</Label>
                      <Input
                        type="datetime-local"
                        value={form.startsAt}
                        onChange={(e) => setField('startsAt', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">AtÃ©</Label>
                      <Input
                        type="datetime-local"
                        value={form.expiresAt}
                        onChange={(e) => setField('expiresAt', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Usage limits */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Limites de uso</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="usage-limit" className="text-xs text-muted-foreground">
                      Total de usos
                    </Label>
                    <Input
                      id="usage-limit"
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={(e) => setField('usageLimit', e.target.value)}
                      placeholder="Ilimitado"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="per-customer-limit" className="text-xs text-muted-foreground">
                      Por cliente
                    </Label>
                    <Input
                      id="per-customer-limit"
                      type="number"
                      min="1"
                      value={form.perCustomerLimit}
                      onChange={(e) => setField('perCustomerLimit', e.target.value)}
                      placeholder="Ilimitado"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para usos ilimitados.
                </p>
              </div>
            </FormSection>

            {/* 4 Â Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Oferta ativa</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {form.active ? 'VisÃ­vel para clientes no checkout' : 'Oculta para clientes'}
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setField('active', v)}
              />
            </div>

            {/* Help link */}
            <div className="flex justify-center py-2">
              <a
                href="https://ajuda.rapidocart.com.br/promocoes-e-descontos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Mais sobre promoÃ§Ãµes e descontos
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* -- Fixed bottom bar -- */}
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur px-6 py-4">
          <div className="mx-auto max-w-2xl flex gap-3">
            <Button variant="outline" className="flex-1" onClick={closeForm}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar alteraÃ§Ãµes' : 'Criar oferta'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
     VIEW: LIST / LANDING PAGE
  --------------------------------------------------------------- */
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Frete GrÃ¡tis</h1>
          <p className="text-sm text-muted-foreground">
            Regras de frete grÃ¡tis com escopo, valor mÃ­nimo e perÃ­odo de vigÃªncia.
          </p>
        </div>
        {offers.length > 0 && (
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova oferta
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : offers.length === 0 ? (

        /* -- Landing page (empty state) -- */
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 px-8 text-center">
          <TruckIllustration />
          <h2 className="mt-6 text-xl font-bold text-foreground">
            Aumente o ticket mÃ©dio oferecendo frete grÃ¡tis
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
            OfereÃ§a frete grÃ¡tis para todo o paÃ­s, regiÃµes especÃ­ficas, categorias, produtos ou
            marcas Â a partir de um valor mÃ­nimo de compra ou sem condiÃ§Ãµes.
          </p>
          <Button className="mt-8 gap-2 px-6" size="lg" onClick={openCreate}>
            <Truck className="h-4 w-4" />
            Configurar frete grÃ¡tis
          </Button>
          <a
            href="https://ajuda.rapidocart.com.br/promocoes-e-descontos"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Mais sobre promoÃ§Ãµes e descontos
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <Truck className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Ativas</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {activeOffers.length}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total</span>
              </div>
              <p className="text-2xl font-bold">{offers.length}</p>
            </div>
          </div>

          {/* Offers list */}
          <div className="space-y-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-lg border border-border bg-card p-5 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground">{offer.name}</p>
                    {offer.active ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300 text-[10px]"
                      >
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px]">
                        Inativa
                      </Badge>
                    )}
                    {offer.lowestCostOnly && (
                      <Badge variant="secondary" className="text-[10px]">
                        Menor custo
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <strong>RegiÃ£o:</strong>{' '}
                      {offer.deliveryZoneType === 'ALL' ? 'Todo o Brasil' : 'RegiÃµes especÃ­ficas'}
                    </span>
                    <span>
                      <strong>Escopo:</strong>{' '}
                      {SCOPE_LABELS[offer.applyScopeType] ?? offer.applyScopeType}
                    </span>
                    {offer.minCartAmount != null && (
                      <span>
                        <strong>MÃ­nimo:</strong> {formatCurrency(offer.minCartAmount)}
                      </span>
                    )}
                    <span>
                      <strong>Usos:</strong> {offer.usageCount}/
                      {offer.usageLimit != null ? offer.usageLimit : '8'}
                    </span>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(offer)}
                  >
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
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover oferta de frete grÃ¡tis?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta aÃ§Ã£o nÃ£o pode ser desfeita. A oferta serÃ¡ removida permanentemente.
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
