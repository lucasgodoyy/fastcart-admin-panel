'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brandService, categoryService, product as productService } from '@/services/catalog';
import { Brand } from '@/types/brand';
import { Category } from '@/types/category';
import { CreateProductRequest } from '@/types/product';

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
  weightKg: 0.14,
  lengthCm: 30,
  widthCm: 30,
  heightCm: 30,
  freeShipping: false,
  featuredProduct: false,
  tags: '',
  seoTitle: '',
  seoDescription: '',
  categoryId: null,
  brandId: null,
  sizeOptions: '',
  productType: 'PHYSICAL',
  videoUrl: '',
  isNew: false,
};

export function CreateProductClient() {
  const router = useRouter();
  const [form, setForm] = useState<CreateProductRequest>(initialForm);
  const [images, setImages] = useState<File[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'create-product'],
    queryFn: () => categoryService.list(),
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands', 'create-product'],
    queryFn: () => brandService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { request: CreateProductRequest; images: File[] }) =>
      productService.create(payload.request, payload.images),
    onSuccess: () => {
      toast.success('Produto criado com sucesso');
      router.push('/admin/products');
    },
    onError: () => toast.error('Não foi possível criar o produto'),
  });

  const imagesLabel = useMemo(() => {
    if (images.length === 0) return 'Nenhuma imagem selecionada';
    if (images.length === 1) return images[0].name;
    return `${images.length} imagens selecionadas`;
  }, [images]);

  const updateNumeric = (field: keyof CreateProductRequest, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : Number(value),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.name?.trim().length < 3) {
      toast.error('Nome do produto deve ter ao menos 3 caracteres');
      return;
    }

    if (Number.isNaN(form.price) || Number(form.price) < 0) {
      toast.error('Preço inválido');
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
      brandId: form.brandId ?? null,
      tags: form.tags?.trim() || undefined,
      seoTitle: form.seoTitle?.trim() || undefined,
      seoDescription: form.seoDescription?.trim() || undefined,
      videoUrl: form.videoUrl?.trim() || undefined,
      productType: form.productType || 'PHYSICAL',
      sizeOptions: form.sizeOptions?.trim() || undefined,
    };

    createMutation.mutate({ request: payload, images });
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">Cadastrar produto</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Cadastrar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Nome e descrição</h2>
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
                rows={5}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Descrição do produto"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Fotos e vídeo</h2>
          <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center text-sm text-primary hover:bg-primary/10">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => setImages(Array.from(event.target.files ?? []))}
            />
            <span className="inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Arraste e solte, ou selecione fotos do produto
            </span>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Tamanho mínimo recomendado: 1024px / Formatos recomendados: WEBP, PNG, JPEG ou GIF
          </p>
          <p className="mt-2 text-xs text-foreground">{imagesLabel}</p>

          <div className="mt-4">
            <label className="mb-1 block text-sm text-muted-foreground">Link para vídeo externo</label>
            <Input
              value={form.videoUrl || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
              placeholder="Cole um link do Youtube ou do Vimeo sobre o seu produto"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Preços</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Preço</label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => updateNumeric('price', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Preço promocional</label>
              <Input type="number" min="0" step="0.01" value={form.salePrice ?? ''} onChange={(e) => updateNumeric('salePrice', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Preço comparativo</label>
              <Input type="number" min="0" step="0.01" value={form.compareAtPrice ?? ''} onChange={(e) => updateNumeric('compareAtPrice', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Custo</label>
              <Input type="number" min="0" step="0.01" value={form.costPrice ?? ''} onChange={(e) => updateNumeric('costPrice', e.target.value)} />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.showPriceInStore)}
              onChange={(event) => setForm((prev) => ({ ...prev, showPriceInStore: event.target.checked }))}
            />
            Mostrar preço na loja
          </label>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
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
              <label className="mb-1 block text-sm text-muted-foreground">Quantidade em estoque</label>
              <Input type="number" min="0" step="1" value={form.stock} onChange={(e) => updateNumeric('stock', e.target.value)} />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
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
                onChange={() => setForm((prev) => ({ ...prev, productType: 'DIGITAL', infiniteStock: true }))}
              />
              Digital
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Códigos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">SKU</label>
              <Input value={form.sku ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))} />
              <p className="mt-1 text-xs text-muted-foreground">SKU é um código interno para você identificar seus produtos com variações.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Barcode</label>
              <Input value={form.barcode ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))} />
              <p className="mt-1 text-xs text-muted-foreground">O código de barras é composto por 13 números e serve para identificar o produto.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Peso e dimensões</h2>
          <p className="mb-3 text-sm text-muted-foreground">Preencha os dados para calcular o frete e exibir opções de entrega na sua loja.</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Weight</label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" step="0.01" value={form.weightKg ?? ''} onChange={(e) => updateNumeric('weightKg', e.target.value)} />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Length</label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" step="0.01" value={form.lengthCm ?? ''} onChange={(e) => updateNumeric('lengthCm', e.target.value)} />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Width</label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" step="0.01" value={form.widthCm ?? ''} onChange={(e) => updateNumeric('widthCm', e.target.value)} />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Height</label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" step="0.01" value={form.heightCm ?? ''} onChange={(e) => updateNumeric('heightCm', e.target.value)} />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
          </div>
          <a href="#" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Mais sobre cálculo de peso e dimensões
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Categorias</h2>
          <p className="mb-3 text-sm text-muted-foreground">Isso ajuda seus clientes a encontrarem produtos mais rápido.</p>
          <label className="mb-1 block text-sm text-muted-foreground">Adicionar categorias</label>
          <select
            value={form.categoryId ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value ? Number(event.target.value) : null }))}
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

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Variações</h2>
          <p className="mb-3 text-sm text-muted-foreground">Combine diferentes propriedades do produto. Exemplo: cor + tamanho.</p>
          <label className="mb-1 block text-sm text-muted-foreground">Adicionar variações</label>
          <Input
            value={form.sizeOptions ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, sizeOptions: event.target.value }))}
            placeholder="Ex: P,M,G"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Tags, Marca e SEO</h2>
          <p className="mb-3 text-sm text-muted-foreground">Crie palavras-chave e facilite a busca deste produto na sua loja e nos buscadores Google.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-muted-foreground">Tags</label>
              <Input value={form.tags ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Ex: esporte,corrida,masculino" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Marca</label>
              <select
                value={form.brandId ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, brandId: event.target.value ? Number(event.target.value) : null }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sem marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">SEO título</label>
              <Input value={form.seoTitle ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-muted-foreground">SEO descrição</label>
              <textarea
                value={form.seoDescription ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Produto em destaque</h2>
          <p className="mb-3 text-sm text-muted-foreground">Escolha em quais seções da loja este produto deve ganhar mais visibilidade.</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={Boolean(form.featuredProduct)} onChange={(event) => setForm((prev) => ({ ...prev, featuredProduct: event.target.checked }))} />
              Escolher seções
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={Boolean(form.freeShipping)} onChange={(event) => setForm((prev) => ({ ...prev, freeShipping: event.target.checked }))} />
              Este produto tem frete grátis
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={Boolean(form.showPriceInStore)} onChange={(event) => setForm((prev) => ({ ...prev, showPriceInStore: event.target.checked }))} />
              Mostrar na minha loja
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
