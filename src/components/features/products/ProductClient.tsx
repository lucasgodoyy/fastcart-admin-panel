'use client';

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Camera,
  ChevronLeft,
  CirclePlus,
  Copy,
  ExternalLink,
  HelpCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
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

type DrawerFilters = Omit<ProductListFilters, 'search' | 'brandId'>;

const EMPTY_DRAWER_FILTERS: DrawerFilters = {
  categoryId: undefined,
  stockStatus: undefined,
  priceType: undefined,
  visibility: undefined,
  shippingPromotion: undefined,
  weightDimensions: undefined,
};

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

const buildDuplicatePayload = (product: Product, name: string): CreateProductRequest => ({
  sku: null,
  name,
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

export function ProductClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<DrawerFilters>(EMPTY_DRAWER_FILTERS);
  const [draftFilters, setDraftFilters] = useState<DrawerFilters>(EMPTY_DRAWER_FILTERS);
  const [duplicateSource, setDuplicateSource] = useState<Product | null>(null);
  const [duplicateName, setDuplicateName] = useState('');

  const queryFilters = useMemo<ProductListFilters>(() => {
    const searchTerm = search.trim();
    return {
      ...appliedFilters,
      search: searchTerm || undefined,
    };
  }, [appliedFilters, search]);

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

  const handleDelete = (product: Product) => {
    const confirmed = window.confirm(`Eliminar o produto \"${product.name}\"?`);
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

    duplicateMutation.mutate(buildDuplicatePayload(duplicateSource, name));
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
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-5 font-semibold text-foreground">Produtos</h1>
        <div className="flex items-center gap-3">
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

      <div className="mb-2 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, SKU, marca ou categoria"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">{products.length} produtos</div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                        <Camera className="h-4 w-4 text-muted-foreground" />
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
                  <td className="px-4 py-3 text-sm text-foreground">
                    {product.infiniteStock ? '∞' : product.stock}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatMoney(product.price, product.currency || 'BRL')}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {product.salePrice ? formatMoney(product.salePrice, product.currency || 'BRL') : '-'}
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
