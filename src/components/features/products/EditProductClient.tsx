'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoryService, product as productService } from '@/services/catalog';
import { Category } from '@/types/category';
import { CreateProductRequest, Product } from '@/types/product';

type EditProductClientProps = {
  productId: number;
};

const initialForm: CreateProductRequest = {
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
  categoryId: null,
  brandId: null,
  freeShipping: false,
  featuredProduct: false,
  isNew: false,
};

const mapProductToForm = (product: Product): CreateProductRequest => ({
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
  categoryId: product.categoryId ?? null,
  brandId: product.brandId ?? null,
  freeShipping: Boolean(product.freeShipping),
  featuredProduct: Boolean(product.featuredProduct),
  isNew: Boolean(product.isNew),
  tags: product.tags || undefined,
  seoTitle: product.seoTitle || undefined,
  seoDescription: product.seoDescription || undefined,
  color: product.color || undefined,
  sizeOptions: product.sizeOptions || undefined,
  material: product.material || undefined,
  gender: product.gender || undefined,
  promoText: product.promoText || undefined,
  socialProof: product.socialProof || undefined,
  videoUrl: product.videoUrl || undefined,
  productType: product.productType || undefined,
});

export function EditProductClient({ productId }: EditProductClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<CreateProductRequest>(initialForm);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'edit-product'],
    queryFn: () => categoryService.list(),
  });

  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => productService.getById(productId),
  });

  useEffect(() => {
    if (product) {
      setForm(mapProductToForm(product));
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (request: CreateProductRequest) => productService.update(productId, request),
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso');
      router.push('/admin/products');
    },
    onError: () => toast.error('Não foi possível atualizar o produto'),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.name.trim().length < 3) {
      toast.error('Nome do produto deve ter ao menos 3 caracteres');
      return;
    }

    if (Number.isNaN(form.price) || form.price < 0) {
      toast.error('Preço inválido');
      return;
    }

    const payload: CreateProductRequest = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || '',
      stock: form.infiniteStock ? 0 : Math.max(0, Math.trunc(form.stock || 0)),
      salePrice: form.salePrice && form.salePrice > 0 ? form.salePrice : null,
      compareAtPrice: form.compareAtPrice && form.compareAtPrice > 0 ? form.compareAtPrice : null,
      categoryId: form.categoryId ?? null,
      brandId: form.brandId ?? null,
      sku: form.sku?.trim() || null,
      currency: (form.currency || 'BRL').toUpperCase(),
    };

    updateMutation.mutate(payload);
  };

  if (isLoadingProduct) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando produto...</div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Produto não encontrado.</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Editar produto</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              Salvar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Nome e descrição</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nome</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ex: Tênis esportivo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Descrição</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Descrição do produto"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Preço e estoque</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Preço</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Preço promocional</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    salePrice: event.target.value ? Number(event.target.value) : null,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Preço comparativo</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    compareAtPrice: event.target.value ? Number(event.target.value) : null,
                  }))
                }
                placeholder="Ex: preço original antes do desconto"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Custo do produto</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    costPrice: event.target.value ? Number(event.target.value) : null,
                  }))
                }
                placeholder="Custo de aquisição (não visível ao cliente)"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Moeda</label>
              <Input
                value={form.currency}
                onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                maxLength={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">SKU (opcional)</label>
              <Input
                value={form.sku ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Código de barras</label>
              <Input
                value={form.barcode ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
                placeholder="EAN / GTIN"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.infiniteStock}
                onChange={(event) => setForm((prev) => ({ ...prev, infiniteStock: event.target.checked }))}
              />
              Estoque infinito
            </label>

            {!form.infiniteStock && (
              <div className="max-w-xs">
                <label className="mb-1 block text-sm text-muted-foreground">Quantidade em estoque</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
                />
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.freeShipping ?? false}
                onChange={(event) => setForm((prev) => ({ ...prev, freeShipping: event.target.checked }))}
              />
              Frete grátis
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.featuredProduct ?? false}
                onChange={(event) => setForm((prev) => ({ ...prev, featuredProduct: event.target.checked }))}
              />
              Produto destaque
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isNew ?? false}
                onChange={(event) => setForm((prev) => ({ ...prev, isNew: event.target.checked }))}
              />
              Produto novo
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.showPriceInStore ?? true}
                onChange={(event) => setForm((prev) => ({ ...prev, showPriceInStore: event.target.checked }))}
              />
              Exibir preço na loja
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Categoria</h2>
          <label className="mb-1 block text-sm text-muted-foreground">Categoria do produto</label>
          <select
            value={form.categoryId ?? ''}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                categoryId: event.target.value ? Number(event.target.value) : null,
              }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
}
