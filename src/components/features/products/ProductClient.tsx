'use client';

import { ReactNode, useRef, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowUpDown,
  Camera,
  Check,
  ChevronLeft,
  CirclePlus,
  Copy,
  Download,
  ExternalLink,
  HelpCircle,
  LayoutList,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { categoryService, product as productService } from '@/services/catalog';
import { Category } from '@/types/category';
import { CreateProductRequest, Product, ProductListFilters } from '@/types/product';

const QUERY_KEY = ['products'];

type FilterOption<T extends string> = {
  value: T | null;
  label: string;
};

type DrawerFilters = Omit<ProductListFilters, 'search' | 'brandId' | 'sortBy' | 'sortOrder'>;

const EMPTY_DRAWER_FILTERS: DrawerFilters = {
  categoryId: undefined,
  stockStatus: undefined,
  priceType: undefined,
  visibility: undefined,
  shippingPromotion: undefined,
  weightDimensions: undefined,
};

type SortOption = {
  key: string;
  label: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  href?: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: 'newest',      label: 'Mais novo',     sortBy: 'createdAt',   sortOrder: 'desc' },
  { key: 'oldest',      label: 'Mais antigo',   sortBy: 'createdAt',   sortOrder: 'asc' },
  { key: 'price-asc',  label: 'Menor preço',   sortBy: 'price',       sortOrder: 'asc' },
  { key: 'price-desc', label: 'Maior preço',   sortBy: 'price',       sortOrder: 'desc' },
  { key: 'az',         label: 'A – Z',         sortBy: 'name',        sortOrder: 'asc' },
  { key: 'za',         label: 'Z – A',         sortBy: 'name',        sortOrder: 'desc' },
  { key: 'best',       label: 'Mais vendidos', sortBy: 'bestSelling', sortOrder: 'desc' },
  { key: 'manual',     label: 'Ordem manual',  href: '/admin/products/organize' },
];

const STOCK_OPTIONS: FilterOption<NonNullable<DrawerFilters['stockStatus']>>[] = [
  { value: null, label: 'Todos' },
  { value: 'IN_STOCK', label: 'Em estoque' },
  { value: 'OUT_OF_STOCK', label: 'Fora de estoque' },
  { value: 'BY_QUANTITY', label: 'Por quantidade' },
];

const PRICE_OPTIONS: FilterOption<NonNullable<DrawerFilters['priceType']>>[] = [
  { value: null, label: 'Todos' },
  { value: 'PROMOTIONAL', label: 'Promocional' },
  { value: 'NON_PROMOTIONAL', label: 'Não promocional' },
];

const VISIBILITY_OPTIONS: FilterOption<NonNullable<DrawerFilters['visibility']>>[] = [
  { value: null, label: 'Todos' },
  { value: 'VISIBLE', label: 'Visíveis' },
  { value: 'HIDDEN', label: 'Ocultos' },
];

const SHIPPING_OPTIONS: FilterOption<NonNullable<DrawerFilters['shippingPromotion']>>[] = [
  { value: null, label: 'Todos' },
  { value: 'FREE_SHIPPING', label: 'Com envio grátis' },
  { value: 'NO_FREE_SHIPPING', label: 'Sem envio grátis' },
];

const WEIGHT_DIMENSIONS_OPTIONS: FilterOption<NonNullable<DrawerFilters['weightDimensions']>>[] = [
  { value: null, label: 'Todos' },
  { value: 'WITHOUT_DIMENSIONS', label: 'Sem dimensões' },
  { value: 'WITHOUT_WEIGHT', label: 'Sem peso' },
  { value: 'WITHOUT_WEIGHT_AND_DIMENSIONS', label: 'Sem peso nem dimensões' },
];

const formatMoney = (value: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const buildProductPayload = (product: Product, overrides?: Partial<CreateProductRequest>): CreateProductRequest => ({
  sku: product.sku || null,
  name: product.name,
  description: product.description || '',
  price: Number(product.price || 0),
  compareAtPrice: product.compareAtPrice ?? null,
  salePrice: product.salePrice ?? null,
  showPriceInStore: product.showPriceInStore,
  costPrice: product.costPrice ?? null,
  currency: product.currency || 'BRL',
  stock: product.stock ?? 0,
  infiniteStock: Boolean(product.infiniteStock),
  barcode: product.barcode ?? undefined,
  weightKg: product.weightKg ?? undefined,
  lengthCm: product.lengthCm ?? undefined,
  widthCm: product.widthCm ?? undefined,
  heightCm: product.heightCm ?? undefined,
  categoryId: product.categoryId ?? null,
  brandId: product.brandId ?? null,
  tags: product.tags ?? undefined,
  seoTitle: product.seoTitle ?? undefined,
  seoDescription: product.seoDescription ?? undefined,
  sizeOptions: product.sizeOptions ?? undefined,
  freeShipping: product.freeShipping,
  featuredProduct: product.featuredProduct,
  productType: product.productType ?? 'PHYSICAL',
  videoUrl: product.videoUrl ?? undefined,
  isNew: product.isNew,
  ...overrides,
});

type ActionIconButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
};

function ActionIconButton({ label, onClick, disabled, children }: ActionIconButtonProps) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="cursor-pointer rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-95 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
        {label}
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-foreground" />
      </span>
    </div>
  );
}

type InlinePriceInputProps = {
  product: Product;
  field: 'price' | 'salePrice';
  onSave: (product: Product, newValue: number | null) => void;
};

function InlinePriceInput({ product, field, onSave }: InlinePriceInputProps) {
  const currentValue = field === 'price' ? product.price : (product.salePrice ?? null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(currentValue != null ? String(Number(currentValue)) : '');
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const parsed = draft === '' ? null : parseFloat(draft.replace(',', '.'));
    if (parsed === null && field === 'price') return; // price is required
    const newVal = parsed !== null && !isNaN(parsed) ? parsed : null;
    const original = currentValue != null ? Number(currentValue) : null;
    if (newVal !== original) {
      onSave(product, newVal);
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        step="0.01"
        min="0"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-24 rounded border border-primary bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Clique para editar"
      className="cursor-text rounded px-1 py-0.5 text-sm text-foreground hover:bg-muted/60 hover:ring-1 hover:ring-border"
    >
      {currentValue != null ? formatMoney(Number(currentValue), product.currency || 'BRL') : <span className="text-muted-foreground">—</span>}
    </button>
  );
}

export function ProductClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<string>('newest');
  const [appliedFilters, setAppliedFilters] = useState<DrawerFilters>(EMPTY_DRAWER_FILTERS);
  const [draftFilters, setDraftFilters] = useState<DrawerFilters>(EMPTY_DRAWER_FILTERS);
  const [duplicateSource, setDuplicateSource] = useState<Product | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const handleExportCsv = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const { default: apiClient } = await import('@/lib/api');
      const response = await apiClient.get('/products/store/export/csv', {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `produtos_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Exportação concluída!');
    } catch {
      toast.error('Erro ao exportar produtos.');
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsImporting(true);
    try {
      const { default: apiClient } = await import('@/lib/api');
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/products/store/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { created, skipped, errors } = response.data as { created: number; skipped: number; errors: string[] };
      toast.success(`Importação concluída: ${created} criado(s), ${skipped} ignorado(s).`);
      if (errors.length > 0) toast.warning(`${errors.length} linha(s) com erro.`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    } catch {
      toast.error('Erro ao importar o arquivo CSV.');
    } finally {
      setIsImporting(false);
    }
  };

  const currentSortOption = SORT_OPTIONS.find((o) => o.key === activeSort) ?? SORT_OPTIONS[0];

  const queryFilters = useMemo<ProductListFilters>(() => {
    const searchTerm = search.trim();
    return {
      ...appliedFilters,
      search: searchTerm || undefined,
      sortBy: currentSortOption.sortBy,
      sortOrder: currentSortOption.sortOrder,
    };
  }, [appliedFilters, search, currentSortOption]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: [...QUERY_KEY, queryFilters],
    queryFn: () => productService.listAll(queryFilters),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'product-filters'],
    queryFn: () => categoryService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => productService.delete(productId),
    onSuccess: () => {
      toast.success('Produto removido');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => toast.error('Não foi possível remover o produto'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (payload: CreateProductRequest) => productService.create(payload),
    onSuccess: () => {
      toast.success('Produto duplicado');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setDuplicateSource(null);
      setDuplicateName('');
    },
    onError: () => toast.error('Não foi possível duplicar o produto'),
  });

  const priceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateProductRequest }) =>
      productService.update(id, payload),
    onSuccess: () => {
      toast.success('Preço atualizado');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => toast.error('Não foi possível atualizar o preço'),
  });

  const handlePriceSave = useCallback((product: Product, field: 'price' | 'salePrice', newValue: number | null) => {
    const payload = buildProductPayload(product, { [field]: newValue });
    priceMutation.mutate({ id: product.id, payload });
  }, [priceMutation]);

  const handleDelete = (product: Product) => {
    const confirmed = window.confirm(`Eliminar o produto "${product.name}"?`);
    if (confirmed) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleOpenDuplicate = (product: Product) => {
    setDuplicateSource(product);
    setDuplicateName(`${product.name} - (cópia)`);
  };

  const handleConfirmDuplicate = () => {
    if (!duplicateSource) return;
    const name = duplicateName.trim();
    if (name.length < 3) {
      toast.error('Nome do novo produto deve ter ao menos 3 caracteres');
      return;
    }
    duplicateMutation.mutate(buildProductPayload(duplicateSource, { sku: null, name }));
  };

  const openFilterDrawer = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearDraftFilters = () => {
    setDraftFilters(EMPTY_DRAWER_FILTERS);
  };

  const handleSortSelect = (option: SortOption) => {
    if (option.href) return; // navigation handled by <Link>
    setActiveSort(option.key);
    setIsSortOpen(false);
  };

  const renderFilterOptions = <T extends string>(
    currentValue: T | undefined,
    options: FilterOption<T>[],
    onSelect: (value: T | undefined) => void,
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === null ? currentValue == null : option.value === currentValue;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onSelect(option.value ?? undefined)}
            className={[
              'cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Produtos</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={isImporting}
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importando...' : 'Importar CSV'}
          </Button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          <Button variant="outline" className="gap-2" onClick={openFilterDrawer}>
            <SlidersHorizontal className="h-4 w-4" />
            Filtrar
          </Button>
          <Link href="/admin/products/new">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, SKU, marca ou categoria"
            className="pl-9"
          />
        </div>

        {/* Sort menu */}
        <div className="relative" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen((v) => !v)}
            title="Ordenar"
            className={[
              'flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
              isSortOpen
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-foreground hover:bg-muted/50',
            ].join(' ')}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{currentSortOption.label}</span>
          </button>

          {isSortOpen && (
            <>
              {/* backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSortOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-card p-1 shadow-lg">
                {SORT_OPTIONS.map((option) => {
                  const isActive = option.key === activeSort;
                  if (option.href) {
                    return (
                      <Link
                        key={option.key}
                        href={option.href}
                        onClick={() => setIsSortOpen(false)}
                        className="flex items-center gap-2 w-full rounded-sm px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <LayoutList className="h-3.5 w-3.5 shrink-0" />
                        {option.label}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSortSelect(option)}
                      className={[
                        'flex items-center gap-2 w-full rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                        isActive ? 'font-semibold text-foreground' : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      <span className="h-3.5 w-3.5 shrink-0">
                        {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">{products.length} produtos</div>

      <div className="overflow-x-auto overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Produto</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Estoque</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Preço</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Promo</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando produtos...
                </td>
              </tr>
            )}

            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}

            {!isLoading &&
              products.map((product) => (
                <tr key={product.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                        {product.primaryImageUrl ? (
                          <img
                            src={product.primaryImageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Camera className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">SKU: {product.sku || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {product.infiniteStock ? (
                      <span className="text-muted-foreground">∞ Infinito</span>
                    ) : (
                      <span className={product.stock === 0 ? 'text-destructive' : 'text-foreground'}>
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <InlinePriceInput
                      product={product}
                      field="price"
                      onSave={(p, v) => v !== null && handlePriceSave(p, 'price', v)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <InlinePriceInput
                      product={product}
                      field="salePrice"
                      onSave={(p, v) => handlePriceSave(p, 'salePrice', v)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ActionIconButton
                        label="Duplicar"
                        onClick={() => handleOpenDuplicate(product)}
                        disabled={duplicateMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        label="Eliminar"
                        onClick={() => handleDelete(product)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary">
        <HelpCircle className="h-3.5 w-3.5" />
        <a href="#" className="inline-flex items-center gap-1 hover:underline">
          Mais sobre produtos
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <Dialog open={Boolean(duplicateSource)} onOpenChange={(open) => !open && setDuplicateSource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar produto</DialogTitle>
            <DialogDescription>Nome do novo produto</DialogDescription>
          </DialogHeader>

          <Input
            value={duplicateName}
            onChange={(event) => setDuplicateName(event.target.value)}
            placeholder="Nome do novo produto"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateSource(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDuplicate} disabled={duplicateMutation.isPending}>
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed left-auto right-0 top-0 h-screen w-full max-w-115 translate-x-0 translate-y-0 gap-0 rounded-none border-l border-border p-0 sm:max-w-115"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-border px-4 py-4">
              <DialogClose asChild>
                <button
                  type="button"
                  className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Fechar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </DialogClose>
              <DialogTitle className="text-3xl font-semibold text-foreground">Filtrar produtos</DialogTitle>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Categoria</p>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                  value={draftFilters.categoryId ?? ''}
                  onChange={(event) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      categoryId: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Disponibilidade em estoque</p>
                {renderFilterOptions(draftFilters.stockStatus, STOCK_OPTIONS, (value) =>
                  setDraftFilters((prev) => ({ ...prev, stockStatus: value }))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Tipo de preço</p>
                {renderFilterOptions(draftFilters.priceType, PRICE_OPTIONS, (value) =>
                  setDraftFilters((prev) => ({ ...prev, priceType: value }))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Visível na loja</p>
                {renderFilterOptions(draftFilters.visibility, VISIBILITY_OPTIONS, (value) =>
                  setDraftFilters((prev) => ({ ...prev, visibility: value }))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Promoção de envio</p>
                {renderFilterOptions(draftFilters.shippingPromotion, SHIPPING_OPTIONS, (value) =>
                  setDraftFilters((prev) => ({ ...prev, shippingPromotion: value }))
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Peso e dimensões</p>
                {renderFilterOptions(draftFilters.weightDimensions, WEIGHT_DIMENSIONS_OPTIONS, (value) =>
                  setDraftFilters((prev) => ({ ...prev, weightDimensions: value }))
                )}
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-primary/40 bg-primary/10 px-3 py-3 text-left transition-colors hover:bg-primary/15"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/60 p-1 text-primary">
                    <CirclePlus className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-primary">Criar campo personalizado</span>
                    <span className="block text-xs text-primary/90">Adicione diferentes atributos aos seus produtos</span>
                  </span>
                </div>
                <span className="text-primary">›</span>
              </button>
            </div>

            <DialogFooter className="border-t border-border px-4 py-4 sm:justify-between">
              <Button type="button" variant="outline" onClick={clearDraftFilters}>
                Limpar filtros
              </Button>
              <Button type="button" onClick={applyFilters}>
                Filtrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
