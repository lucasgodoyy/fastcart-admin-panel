'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { categoryService } from '@/services/catalog';
import { Category, UpdateCategoryRequest } from '@/types/category';

interface CategoryFormClientProps {
  categoryId: number;
}

interface FormState {
  name: string;
  description: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  googleShoppingCategory: string;
  active: boolean;
  parentId: number | null;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  imageUrl: '',
  seoTitle: '',
  seoDescription: '',
  slug: '',
  googleShoppingCategory: '',
  active: true,
  parentId: null,
};

export function CategoryFormClient({ categoryId }: CategoryFormClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [hydrated, setHydrated] = useState(false);

  const { data: category, isLoading } = useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.getById(categoryId),
  });

  // Hydrate form from fetched data (runs once per fetched category)
  if (category && !hydrated) {
    setHydrated(true);
    setForm({
      name: category.name,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      seoTitle: category.seoTitle ?? '',
      seoDescription: category.seoDescription ?? '',
      slug: category.slug,
      googleShoppingCategory: category.googleShoppingCategory ?? '',
      active: category.active,
      parentId: category.parentId ?? null,
    });
  }

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const updateMutation = useMutation({
    mutationFn: () => {
      const payload: UpdateCategoryRequest = {
        name: form.name.trim(),
        parentId: form.parentId,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        slug: form.slug || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        googleShoppingCategory: form.googleShoppingCategory || null,
        active: form.active,
      };
      return categoryService.update(categoryId, payload);
    },
    onSuccess: () => {
      toast.success('Categoria salva com sucesso');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', categoryId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Não foi possível salvar a categoria');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => categoryService.softDelete(categoryId),
    onSuccess: () => {
      toast.success('Categoria eliminada');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/admin/products/categories');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Não foi possível eliminar a categoria. Verifique se não existem subcategorias.');
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('imageUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (window.confirm(`Eliminar a categoria "${form.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-sm text-muted-foreground">
        Carregando categoria...
      </div>
    );
  }

  if (!category && !isLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Categoria não encontrada.</p>
        <Link href="/admin/products/categories" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar para categorias
        </Link>
      </div>
    );
  }

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/categories"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Categorias
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold truncate max-w-50 sm:max-w-xs">
            {category?.name || 'Editar categoria'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
          <Button
            size="sm"
            onClick={() => updateMutation.mutate()}
            disabled={!form.name.trim() || isPending}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">

        {/* ── Main column ── */}
        <div className="space-y-5">

          {/* Informações da categoria */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Informações da categoria</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block">Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ex: Camisetas"
                  maxLength={100}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs">Descrição (opcional)</Label>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                    onClick={() => toast.info('Geração com IA disponível em breve')}
                  >
                    <Sparkles className="h-3 w-3" />
                    Gerar com IA
                  </button>
                </div>
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value.slice(0, 140))}
                  placeholder="Conte aos seus clientes o que irão encontrar nesta categoria."
                  className="text-sm resize-none"
                  rows={3}
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {form.description.length}/140 caracteres
                </p>
              </div>
            </div>
          </section>

          {/* Imagem */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-1 text-sm font-semibold">Imagem</h2>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Ela irá aparecer no topo da página de uma categoria
            </p>
            <div className="space-y-3">
              {form.imageUrl ? (
                <div className="relative rounded-md overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="Banner da categoria"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set('imageUrl', '')}
                    className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-white transition-colors"
                    aria-label="Remover imagem"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 p-8 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Carregar imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              <p className="text-[11px] text-muted-foreground">
                Tamanho recomendado: 220px altura × 1580px largura
              </p>
            </div>
          </section>

          {/* Google Shopping */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-1 text-sm font-semibold">Google Shopping</h2>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Aumente a relevância dos seus produtos nos buscadores Google.
            </p>
            <div>
              <Label className="text-xs mb-1.5 block">Categoria do Google Shopping</Label>
              <Input
                value={form.googleShoppingCategory}
                onChange={(e) => set('googleShoppingCategory', e.target.value)}
                placeholder="Ex: Vestuário e acessórios > Roupas"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                O texto deve ser igual ao do Google
              </p>
            </div>
          </section>

          {/* SEO */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">SEO</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs">Título SEO</Label>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                    onClick={() => toast.info('Geração com IA disponível em breve')}
                  >
                    <Sparkles className="h-3 w-3" />
                    Gerar com IA
                  </button>
                </div>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => set('seoTitle', e.target.value.slice(0, 70))}
                  placeholder="Ex: Comprar camisetas"
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {form.seoTitle.length}/70 caracteres
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs">Descrição SEO</Label>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                    onClick={() => toast.info('Geração com IA disponível em breve')}
                  >
                    <Sparkles className="h-3 w-3" />
                    Gerar com IA
                  </button>
                </div>
                <Textarea
                  value={form.seoDescription}
                  onChange={(e) => set('seoDescription', e.target.value.slice(0, 160))}
                  placeholder="Ex: Camisetas com até 30% de desconto!"
                  className="text-sm resize-none"
                  rows={2}
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {form.seoDescription.length}/160 caracteres
                </p>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">URL da categoria</Label>
                <div className="flex items-center rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                  <span className="bg-muted px-3 py-2 text-[11px] text-muted-foreground border-r border-input whitespace-nowrap shrink-0">
                    ...sua-loja.com/
                  </span>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      set(
                        'slug',
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    className="border-0 rounded-none shadow-none focus-visible:ring-0 text-sm"
                    placeholder="nome-da-categoria"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Visibilidade</h2>
            <div className="flex items-start gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => set('active', v)}
              />
              <div>
                <p className="text-sm font-medium leading-tight">
                  Mostrar essa categoria na loja
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Ao ocultar essa categoria na loja, as subcategorias associadas a ela também serão ocultadas.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
