'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  ChevronLeft,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { brandService, categoryService, product as productService } from '@/services/catalog';
import aiService from '@/services/aiService';
import { Sparkles } from 'lucide-react';
import inventoryMovementService, { type InventoryMovement } from '@/services/catalog/inventoryMovementService';
import { Brand } from '@/types/brand';
import { Category } from '@/types/category';
import { CreateProductRequest, Product, ProductImage } from '@/types/product';
import { GeneratedVariant, ProductVariations, VariantOption } from './ProductVariations';
import { FieldHelper } from '@/components/shared/field-helper';

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                             */
/* ────────────────────────────────────────────────────────────────── */

type ProductFormClientProps =
  | { mode: 'create' }
  | { mode: 'edit'; productId: number };

/* ────────────────────────────────────────────────────────────────── */
/*  Constants                                                         */
/* ────────────────────────────────────────────────────────────────── */

const emptyForm: CreateProductRequest = {
  sku: null,
  name: '',
  description: '',
  price: 0,
  compareAtPrice: null,
  salePrice: null,
  showPriceInStore: true,
  costPrice: null,
  currency: 'BRL',
  stock: 0,
  infiniteStock: true,
  barcode: '',
  weightKg: 0.14,
  lengthCm: 30,
  widthCm: 30,
  heightCm: 30,
  freeShipping: false,
  featuredProduct: false,
  tags: '',
  seoTitle: '',
  seoDescription: '',
  relatedProductIds: [],
  complementaryProductIds: [],
  categoryId: null,
  categoryIds: [],
  brandId: null,
  sizeOptions: '',
  productType: 'PHYSICAL',
  videoUrl: '',
  isNew: false,
};

/* ────────────────────────────────────────────────────────────────── */
/*  Helpers                                                           */
/* ────────────────────────────────────────────────────────────────── */

function mapProductToForm(product: Product): CreateProductRequest {
  return {
    sku: product.sku || null,
    name: product.name || '',
    description: product.description || '',
    price: Number(product.price || 0),
    compareAtPrice: product.compareAtPrice ?? null,
    salePrice: product.salePrice ?? null,
    showPriceInStore: product.showPriceInStore ?? true,
    costPrice: product.costPrice ?? null,
    currency: (product.currency || 'BRL').toUpperCase(),
    stock: product.infiniteStock ? 0 : Number(product.stock || 0),
    infiniteStock: Boolean(product.infiniteStock),
    barcode: product.barcode || '',
    weightKg: product.weightKg ?? undefined,
    lengthCm: product.lengthCm ?? undefined,
    widthCm: product.widthCm ?? undefined,
    heightCm: product.heightCm ?? undefined,
    freeShipping: Boolean(product.freeShipping),
    featuredProduct: Boolean(product.featuredProduct),
    isNew: Boolean(product.isNew),
    tags: product.tags || '',
    seoTitle: product.seoTitle || '',
    seoDescription: product.seoDescription || '',
    relatedProductIds: product.relatedProductIds || [],
    complementaryProductIds: product.complementaryProductIds || [],
    categoryId: product.categoryId ?? null,
    categoryIds: product.categoryIds ?? [],
    brandId: product.brandId ?? null,
    color: product.color || undefined,
    sizeOptions: product.sizeOptions || '',
    material: product.material || undefined,
    gender: product.gender || undefined,
    promoText: product.promoText || undefined,
    socialProof: product.socialProof || undefined,
    videoUrl: product.videoUrl || undefined,
    productType: product.productType || 'PHYSICAL',
  };
}

function buildInitialOptions(product: Product): VariantOption[] | undefined {
  if (!product.variants || product.variants.length === 0) return undefined;
  const colorValues = new Set<string>();
  const sizeValues = new Set<string>();
  for (const v of product.variants) {
    if (v.color) colorValues.add(v.color);
    if (v.size) sizeValues.add(v.size);
  }
  const options: VariantOption[] = [];
  let id = 0;
  if (colorValues.size > 0) {
    options.push({ id: `init_${++id}`, name: 'Cor', values: Array.from(colorValues) });
  }
  if (sizeValues.size > 0) {
    options.push({ id: `init_${++id}`, name: 'Tamanho', values: Array.from(sizeValues) });
  }
  return options.length > 0 ? options : undefined;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Main Component                                                    */
/* ────────────────────────────────────────────────────────────────── */

export function ProductFormClient(props: ProductFormClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = props.mode === 'edit';
  const productId = isEdit ? props.productId : undefined;

  /* ── State ── */
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [showMovements, setShowMovements] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showRelatedModal, setShowRelatedModal] = useState(false);
  const [showComplementaryModal, setShowComplementaryModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantDataRef = useRef<{ variants: GeneratedVariant[]; options: VariantOption[] }>({
    variants: [],
    options: [],
  });

  /* ── Queries ── */
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => productService.getById(productId!),
    enabled: isEdit && !!productId,
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ['categories', 'product-form'],
    queryFn: () => categoryService.list(),
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands', 'product-form'],
    queryFn: () => brandService.list(),
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products', 'all-for-relations'],
    queryFn: () => productService.listAll(),
  });

  const { data: movements = [] } = useQuery<InventoryMovement[]>({
    queryKey: ['inventory-movements', productId],
    queryFn: () => inventoryMovementService.listByProduct(productId!),
    enabled: isEdit && !!productId && showMovements,
  });

  /* ── Init form from product (edit) ── */
  const [lastProductId, setLastProductId] = useState<number | null>(null);
  if (product && product.id !== lastProductId) {
    setLastProductId(product.id);
    setForm(mapProductToForm(product));
    setExistingImages(product.images || []);
  }

  /* ── Variant handler ── */
  const handleVariationsChange = useCallback(
    (variants: GeneratedVariant[], options: VariantOption[]) => {
      variantDataRef.current = { variants, options };
      const sizeOpt = options.find((o) => o.name === 'Tamanho');
      setForm((prev) => ({ ...prev, sizeOptions: sizeOpt ? sizeOpt.values.join(',') : '' }));
    },
    [],
  );

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (payload: { request: CreateProductRequest; images: File[] }) =>
      productService.create(payload.request, payload.images),
    onSuccess: () => {
      toast.success('Produto criado com sucesso');
      router.push('/admin/products');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const msg = error?.response?.data?.message || error?.message || '';
      if (msg.includes('Limite de produtos')) {
        toast.error(msg, {
          duration: 8000,
          action: { label: 'Fazer upgrade', onClick: () => router.push('/admin/billing') },
        });
      } else {
        toast.error(msg || 'Não foi possível criar o produto');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { request: CreateProductRequest; images?: File[] }) =>
      payload.images && payload.images.length > 0
        ? productService.updateWithImages(productId!, payload.request, payload.images)
        : productService.update(productId!, payload.request),
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      router.push('/admin/products');
    },
    onError: () => toast.error('Não foi possível atualizar o produto'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productService.delete(productId!),
    onSuccess: () => {
      toast.success('Produto excluído com sucesso');
      router.push('/admin/products');
    },
    onError: () => toast.error('Não foi possível excluir o produto'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (req: { name: string }) => categoryService.create(req),
    onSuccess: (cat) => {
      toast.success(`Categoria "${cat.name}" criada`);
      setForm((prev) => ({
        ...prev,
        categoryId: prev.categoryId ?? cat.id,
        categoryIds: [...(prev.categoryIds || []), cat.id],
      }));
      setShowNewCategory(false);
      setNewCategoryName('');
      refetchCategories();
    },
    onError: () => toast.error('Não foi possível criar a categoria'),
  });

  /* ── Derived values ── */
  const updateNumeric = (field: keyof CreateProductRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value === '' ? undefined : Number(value) }));
  };

  const canSave = useMemo(() => {
    return (form.name?.trim().length ?? 0) >= 3 && Number(form.price) > 0;
  }, [form.name, form.price]);

  const discountPercent = useMemo(() => {
    if (form.price > 0 && form.salePrice && form.salePrice > 0 && form.salePrice < form.price) {
      return Math.round(((form.price - form.salePrice) / form.price) * 100);
    }
    return null;
  }, [form.price, form.salePrice]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  /* ── Image handlers ── */
  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setNewImages((prev) => [...prev, ...Array.from(files)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId: number) => {
    try {
      await productService.deleteImage(productId!, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Imagem removida');
    } catch {
      toast.error('Erro ao remover imagem');
    }
  };

  const setPrimaryImage = async (imageId: number) => {
    try {
      await productService.setPrimaryImage(productId!, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === imageId })),
      );
      toast.success('Imagem de capa definida');
    } catch {
      toast.error('Erro ao definir capa');
    }
  };

  /* ── Submit ── */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((form.name?.trim().length ?? 0) < 3) {
      toast.error('Nome do produto deve ter ao menos 3 caracteres');
      return;
    }
    if (Number.isNaN(form.price) || Number(form.price) <= 0) {
      toast.error('Preencha um preço válido');
      return;
    }

    const payload: CreateProductRequest = {
      ...form,
      name: form.name!.trim(),
      description: form.description?.trim() || '',
      sku: form.sku?.trim() || null,
      currency: (form.currency || 'BRL').toUpperCase(),
      stock: form.infiniteStock ? 0 : Math.max(0, Math.trunc(Number(form.stock || 0))),
      compareAtPrice: form.compareAtPrice && form.compareAtPrice > 0 ? form.compareAtPrice : null,
      salePrice: form.salePrice && form.salePrice > 0 ? form.salePrice : null,
      costPrice: form.costPrice && form.costPrice > 0 ? form.costPrice : null,
      barcode: form.barcode?.trim() || undefined,
      categoryId: form.categoryId ?? null,
      categoryIds: form.categoryIds?.length ? form.categoryIds : undefined,
      brandId: form.brandId ?? null,
      tags: form.tags?.trim() || undefined,
      seoTitle: form.seoTitle?.trim() || undefined,
      seoDescription: form.seoDescription?.trim() || undefined,
      videoUrl: form.videoUrl?.trim() || undefined,
      productType: form.productType || 'PHYSICAL',
      sizeOptions: form.sizeOptions?.trim() || undefined,
      relatedProductIds: form.relatedProductIds?.length ? form.relatedProductIds : undefined,
      complementaryProductIds: form.complementaryProductIds?.length
        ? form.complementaryProductIds
        : undefined,
      initialVariants: !isEdit
        ? variantDataRef.current.variants
            .filter((v) => v.available)
            .map((v) => ({
              sku: v.sku || undefined,
              size: v.combination['Tamanho'] || undefined,
              color: v.combination['Cor'] || undefined,
              stock: v.stock,
              priceAdjustment: v.priceAdjustment || undefined,
            }))
        : undefined,
    };

    if (isEdit) {
      updateMutation.mutate({
        request: payload,
        images: newImages.length > 0 ? newImages : undefined,
      });
    } else {
      createMutation.mutate({ request: payload, images: newImages });
    }
  };

  /* ── Loading / Not found ── */
  if (isEdit && isLoadingProduct) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">
        Carregando produto...
      </div>
    );
  }

  if (isEdit && !product && !isLoadingProduct) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">
        Produto não encontrado.
      </div>
    );
  }

  const selectableProducts = allProducts.filter((p) => !isEdit || p.id !== productId);
  const effectivePrice = form.salePrice && form.salePrice > 0 ? form.salePrice : form.price;

  /* ── Render ── */
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              {isEdit ? product?.name || 'Editar produto' : 'Novo Produto'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSave || isPending}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </div>

        {/* ── 1. Nome e Descrição ─────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Nome e descrição</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nome *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Tênis esportivo"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Descrição</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!form.name?.trim()}
                  onClick={async () => {
                    if (!form.name?.trim()) return;
                    try {
                      toast.loading('Gerando descrição com IA...', { id: 'ai-desc' });
                      const catName = categories.find((c) => c.id === form.categoryId)?.name;
                      const res = await aiService.generateDescription({
                        productName: form.name,
                        category: catName,
                        keywords: form.tags || undefined,
                        language: 'pt',
                        tone: 'professional',
                      });
                      setForm((prev) => ({ ...prev, description: res.content }));
                      toast.success(`Descrição gerada! (${res.usedThisMonth}/${res.monthlyLimit} usados)`, { id: 'ai-desc' });
                    } catch {
                      toast.error('Erro ao gerar descrição com IA', { id: 'ai-desc' });
                    }
                  }}
                  className="gap-1 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar com IA
                </Button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={5}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Descreva o produto em detalhes"
              />
            </div>
          </div>
        </section>

        {/* ── 2. Fotos e Vídeo ────────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Fotos e vídeo</h2>

          {/* Existing images (edit mode) */}
          {isEdit && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm text-muted-foreground">Imagens atuais</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative h-24 w-24 rounded-lg border border-border overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {img.isPrimary && (
                      <Badge className="absolute top-1 left-1 gap-1 bg-amber-500 text-white text-[10px] px-1.5 py-0 hover:bg-amber-500">
                        <Star className="h-2.5 w-2.5" /> Capa
                      </Badge>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(img.id)}
                          className="rounded-full bg-white/90 p-1.5 text-amber-600 hover:bg-white transition-colors"
                          title="Definir como capa"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteExistingImage(img.id)}
                        className="rounded-full bg-white/90 p-1.5 text-red-600 hover:bg-white transition-colors"
                        title="Remover imagem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dropzone */}
          <div
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center text-sm transition-colors ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <Upload className="mb-2 h-6 w-6 text-primary/60" />
            <span className="text-primary font-medium">
              Arraste e solte, ou clique para selecionar
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Mínimo recomendado: 1024px · Formatos: WEBP, PNG, JPEG ou GIF
            </p>
          </div>

          {/* New image previews */}
          {newImages.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-muted-foreground">
                {newImages.length} {newImages.length === 1 ? 'nova imagem' : 'novas imagens'}
              </p>
              <div className="flex flex-wrap gap-3">
                {newImages.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="group relative h-24 w-24 rounded-lg border border-border overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video link */}
          <div className="mt-4">
            <label className="mb-1 block text-sm text-muted-foreground">
              Link para vídeo externo
            </label>
            <Input
              value={form.videoUrl || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="Cole um link do Youtube ou do Vimeo"
            />
          </div>
        </section>

        {/* ── 3. Preço e Promoção ─────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Preço e promoção</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Preço *
                <FieldHelper
                  content="Este é o valor principal exibido na loja e usado como base para cálculos de desconto e margem."
                  learnMoreHref="/admin/tutorials/products"
                />
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateNumeric('price', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Preço promocional
                <FieldHelper
                  content="Defina um valor menor para criar oferta. Se vazio, o produto será vendido pelo preço principal."
                  learnMoreHref="/admin/tutorials/marketing"
                />
                {discountPercent != null && (
                  <span className="ml-2 text-xs font-semibold text-emerald-600">
                    &minus;{discountPercent}% de desconto
                  </span>
                )}
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice ?? ''}
                onChange={(e) => updateNumeric('salePrice', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Preço comparativo
                <FieldHelper
                  content="Mostra o preço de referência riscado para evidenciar economia em promoções."
                  learnMoreHref="/admin/tutorials/marketing"
                />
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice ?? ''}
                onChange={(e) => updateNumeric('compareAtPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Custo por unidade
                <FieldHelper
                  content="Use o custo real para acompanhar sua margem de lucro e evitar promoções abaixo do custo."
                  learnMoreHref="/admin/tutorials/products"
                />
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice ?? ''}
                onChange={(e) => updateNumeric('costPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Profit margin indicator */}
          {form.costPrice != null &&
            form.costPrice > 0 &&
            form.price > 0 &&
            effectivePrice > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Lucro estimado:{' '}
                <span className="font-semibold text-emerald-600">
                  R$ {(effectivePrice - form.costPrice).toFixed(2)}
                </span>{' '}
                ({Math.round(((effectivePrice - form.costPrice) / effectivePrice) * 100)}%
                margem)
              </p>
            )}

          <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.showPriceInStore)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, showPriceInStore: e.target.checked }))
              }
            />
            Mostrar preço na loja
          </label>
        </section>

        {/* ── 4. Estoque ──────────────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Estoque</h2>
          <p className="mb-3 text-sm font-medium text-foreground">Quantidade</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="inventory"
                checked={Boolean(form.infiniteStock)}
                onChange={() => setForm((prev) => ({ ...prev, infiniteStock: true }))}
              />
              Infinito
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="inventory"
                checked={!form.infiniteStock}
                onChange={() => setForm((prev) => ({ ...prev, infiniteStock: false }))}
              />
              Limitado
            </label>
          </div>
          {!form.infiniteStock && (
            <div className="mt-3 max-w-xs">
              <label className="mb-1 block text-sm text-muted-foreground">
                Quantidade em estoque
                <FieldHelper
                  content="Quantidade disponível para venda quando o estoque for limitado. Ao chegar em zero, o item pode ficar indisponível."
                  learnMoreHref="/admin/tutorials/products"
                />
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => updateNumeric('stock', e.target.value)}
              />
            </div>
          )}
        </section>

        {/* ── 5. Tipo de Produto ──────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Tipo de produto</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="productType"
                checked={(form.productType || 'PHYSICAL') === 'PHYSICAL'}
                onChange={() => setForm((prev) => ({ ...prev, productType: 'PHYSICAL' }))}
              />
              Físico
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="productType"
                checked={form.productType === 'DIGITAL'}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    productType: 'DIGITAL',
                    infiniteStock: true,
                  }))
                }
              />
              Digital
            </label>
          </div>
        </section>

        {/* ── 6. Códigos ──────────────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Códigos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">SKU</label>
              <Input
                value={form.sku ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Código interno para identificar produtos e variações.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Código de barras
              </label>
              <Input
                value={form.barcode ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                EAN/GTIN composto por 13 dígitos.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Peso e Dimensões ─────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Peso e dimensões</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Preencha para calcular o frete e exibir opções de entrega.
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Peso</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.weightKg ?? ''}
                  onChange={(e) => updateNumeric('weightKg', e.target.value)}
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Comprimento</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.lengthCm ?? ''}
                  onChange={(e) => updateNumeric('lengthCm', e.target.value)}
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Largura</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.widthCm ?? ''}
                  onChange={(e) => updateNumeric('widthCm', e.target.value)}
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Altura</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.heightCm ?? ''}
                  onChange={(e) => updateNumeric('heightCm', e.target.value)}
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.freeShipping)}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, freeShipping: e.target.checked }))
              }
            />
            Este produto tem frete grátis
          </label>
        </section>

        {/* ── 8. Categoria ────────────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Categorias</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Selecione uma ou mais categorias para este produto.
          </p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-muted-foreground">
                Adicionar categoria
              </label>
              <select
                value=""
                onChange={(e) => {
                  const catId = Number(e.target.value);
                  if (!catId) return;
                  setForm((prev) => {
                    const ids = prev.categoryIds || [];
                    if (ids.includes(catId)) return prev;
                    const newIds = [...ids, catId];
                    return { ...prev, categoryIds: newIds, categoryId: prev.categoryId ?? catId };
                  });
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Selecionar...</option>
                {categories
                  .filter((c) => !(form.categoryIds || []).includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 shrink-0"
              onClick={() => setShowNewCategory(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Nova
            </Button>
          </div>
          {(form.categoryIds || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(form.categoryIds || []).map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                return (
                  <Badge key={catId} variant="secondary" className="gap-1 pr-1">
                    {cat?.name ?? `#${catId}`}
                    <button
                      type="button"
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      onClick={() =>
                        setForm((prev) => {
                          const newIds = (prev.categoryIds || []).filter((id) => id !== catId);
                          return {
                            ...prev,
                            categoryIds: newIds,
                            categoryId: newIds[0] ?? null,
                          };
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 9. Variações ────────────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Variações</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Combine propriedades do produto. Ex: cor + tamanho.
          </p>
          <ProductVariations
            onChange={handleVariationsChange}
            initialOptions={
              isEdit && product?.variants && product.variants.length > 0
                ? buildInitialOptions(product)
                : undefined
            }
          />
        </section>

        {/* ── 10. Tags, Marca e SEO ───────────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Tags, marca e SEO</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Facilite a busca deste produto na loja e no Google.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-muted-foreground">Tags</label>
              <Input
                value={form.tags ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: esporte,corrida,masculino"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Marca</label>
              <select
                value={form.brandId ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    brandId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sem marca</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                SEO título
                <span
                  className={`text-xs ${
                    (form.seoTitle?.length || 0) > 160
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {form.seoTitle?.length || 0}/160
                </span>
              </label>
              <Input
                value={form.seoTitle ?? ''}
                maxLength={160}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                SEO descrição
                <span
                  className={`text-xs ${
                    (form.seoDescription?.length || 0) > 320
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {form.seoDescription?.length || 0}/320
                </span>
              </label>
              <textarea
                value={form.seoDescription ?? ''}
                maxLength={320}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                }
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!form.name?.trim()}
                onClick={async () => {
                  if (!form.name?.trim()) return;
                  try {
                    toast.loading('Gerando SEO com IA...', { id: 'ai-seo' });
                    const catName = categories.find((c) => c.id === form.categoryId)?.name;
                    const res = await aiService.generateSeo({
                      productName: form.name,
                      category: catName,
                      keywords: form.tags || undefined,
                      language: 'pt',
                    });
                    setForm((prev) => ({
                      ...prev,
                      seoTitle: res.seoTitle,
                      seoDescription: res.metaDescription,
                    }));
                    toast.success(`SEO gerado! (${res.usedThisMonth}/${res.monthlyLimit} usados)`, { id: 'ai-seo' });
                  } catch {
                    toast.error('Erro ao gerar SEO com IA', { id: 'ai-seo' });
                  }
                }}
                className="gap-1 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Gerar SEO com IA
              </Button>
            </div>
          </div>
        </section>

        {/* ── 11. Destaque e Visibilidade ─────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Destaque e visibilidade
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Controle onde este produto aparece e com quais destaques.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={Boolean(form.featuredProduct)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, featuredProduct: e.target.checked }))
                }
              />
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" /> Produto em destaque
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={Boolean(form.isNew)}
                onChange={(e) => setForm((prev) => ({ ...prev, isNew: e.target.checked }))}
              />
              Produto novo (badge &quot;NEW&quot;)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={Boolean(form.showPriceInStore)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, showPriceInStore: e.target.checked }))
                }
              />
              Exibir preço na loja
            </label>
          </div>
        </section>

        {/* ── 12. Produtos Relacionados ───────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Produtos relacionados
              </h2>
              <p className="text-sm text-muted-foreground">
                Sugira produtos semelhantes ao cliente.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowRelatedModal(true)}
            >
              <Search className="h-3.5 w-3.5" /> Selecionar
            </Button>
          </div>
          {(form.relatedProductIds?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.relatedProductIds!.map((id) => {
                const p = allProducts.find((pr) => pr.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1">
                    {p?.name || `#${id}`}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          relatedProductIds: prev.relatedProductIds?.filter(
                            (x) => x !== id,
                          ),
                        }))
                      }
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 13. Produtos Complementares ─────────────────────────── */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Produtos complementares
              </h2>
              <p className="text-sm text-muted-foreground">
                Cross-sell: &quot;Compre junto&quot; na página do produto.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowComplementaryModal(true)}
            >
              <Search className="h-3.5 w-3.5" /> Selecionar
            </Button>
          </div>
          {(form.complementaryProductIds?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.complementaryProductIds!.map((id) => {
                const p = allProducts.find((pr) => pr.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1">
                    {p?.name || `#${id}`}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          complementaryProductIds:
                            prev.complementaryProductIds?.filter((x) => x !== id),
                        }))
                      }
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 14. Histórico de Estoque (edit only) ────────────────── */}
        {isEdit && (
          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMovements((v) => !v)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">
                  Histórico de estoque
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {showMovements ? 'Ocultar' : 'Ver histórico'}
              </span>
            </button>

            {showMovements && (
              <div className="px-6 pb-6">
                {movements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma movimentação registrada.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted text-muted-foreground">
                          <th className="text-left px-3 py-2 font-medium">Tipo</th>
                          <th className="text-right px-3 py-2 font-medium">Antes</th>
                          <th className="text-right px-3 py-2 font-medium">Depois</th>
                          <th className="text-right px-3 py-2 font-medium">Delta</th>
                          <th className="text-left px-3 py-2 font-medium">Motivo</th>
                          <th className="text-left px-3 py-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {movements.map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-3 py-2">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  m.movementType === 'DEDUCTION'
                                    ? 'bg-red-50 text-red-700'
                                    : m.movementType === 'RESTORE'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {m.movementType === 'DEDUCTION'
                                  ? 'Dedução'
                                  : m.movementType === 'RESTORE'
                                    ? 'Reposição'
                                    : 'Manual'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {m.quantityBefore}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {m.quantityAfter}
                            </td>
                            <td
                              className={`px-3 py-2 text-right tabular-nums font-semibold ${
                                m.quantityDelta < 0 ? 'text-red-600' : 'text-emerald-600'
                              }`}
                            >
                              {m.quantityDelta > 0
                                ? `+${m.quantityDelta}`
                                : m.quantityDelta}
                            </td>
                            <td className="px-3 py-2 max-w-40 truncate text-muted-foreground">
                              {m.reason ?? '-'}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                              {new Date(m.createdAt).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── 15. Excluir Produto (edit only) ─────────────────────── */}
        {isEdit && (
          <section className="rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
                  Excluir produto
                </h2>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
              </Button>
            </div>
          </section>
        )}
      </form>

      {/* ── Modals ────────────────────────────────────────────────── */}

      {/* Create Category */}
      <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>
              Crie uma categoria sem sair desta página.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome da categoria"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCategory(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                newCategoryName.trim().length < 2 || createCategoryMutation.isPending
              }
              onClick={() =>
                createCategoryMutation.mutate({ name: newCategoryName.trim() })
              }
            >
              {createCategoryMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Deseja excluir o produto &quot;{product?.name}&quot;? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Related Products */}
      <ProductSearchModal
        open={showRelatedModal}
        onOpenChange={setShowRelatedModal}
        title="Selecionar produtos relacionados"
        products={selectableProducts}
        selectedIds={form.relatedProductIds || []}
        onConfirm={(ids) => {
          setForm((prev) => ({ ...prev, relatedProductIds: ids }));
          setShowRelatedModal(false);
        }}
      />

      {/* Complementary Products */}
      <ProductSearchModal
        open={showComplementaryModal}
        onOpenChange={setShowComplementaryModal}
        title="Selecionar produtos complementares"
        products={selectableProducts}
        selectedIds={form.complementaryProductIds || []}
        onConfirm={(ids) => {
          setForm((prev) => ({ ...prev, complementaryProductIds: ids }));
          setShowComplementaryModal(false);
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  ProductSearchModal                                                */
/* ────────────────────────────────────────────────────────────────── */

function ProductSearchModal({
  open,
  onOpenChange,
  title,
  products,
  selectedIds,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  products: Product[];
  selectedIds: number[];
  onConfirm: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedIds));

  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    setLastOpen(true);
    setSelected(new Set(selectedIds));
  }
  if (!open && lastOpen) {
    setLastOpen(false);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return products.slice(0, 20);
    const q = search.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [products, search]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{selected.size} selecionado(s)</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou SKU..."
            className="pl-9"
          />
        </div>
        <div className="max-h-72 overflow-y-auto space-y-1">
          {filtered.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors ${
                selected.has(p.id) ? 'bg-primary/5' : 'hover:bg-muted/40'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
              />
              <div className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {p.primaryImageUrl ? (
                  <img // eslint-disable-line @next/next/no-img-element
                    src={p.primaryImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {p.sku || '-'}</p>
              </div>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(Array.from(selected))}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
