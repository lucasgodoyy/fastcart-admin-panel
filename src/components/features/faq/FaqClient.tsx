'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronRight,
  FileQuestion,
  HelpCircle,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import faqService from '@/services/admin/faqService';
import { FaqCategory, FaqItem } from '@/types/faq';
import { t } from '@/lib/admin-language';

type CategoryFormState = {
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

type ItemFormState = {
  categoryId: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
};

type CategorySection = FaqCategory & { items: FaqItem[] };

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sortByOrder<T extends { sortOrder: number }>(entries: T[]) {
  return [...entries].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function FaqClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const [catDialog, setCatDialog] = useState<{ open: boolean; category?: FaqCategory }>({ open: false });
  const [catForm, setCatForm] = useState<CategoryFormState>({ name: '', slug: '', sortOrder: 1, active: true });

  const [itemDialog, setItemDialog] = useState<{ open: boolean; item?: FaqItem; categoryId?: number | null }>({ open: false });
  const [itemForm, setItemForm] = useState<ItemFormState>({ categoryId: 'none', question: '', answer: '', sortOrder: 1, active: true });

  const { data: categories, isLoading: loadingCategories } = useQuery<FaqCategory[]>({
    queryKey: ['faq-categories'],
    queryFn: faqService.listCategories,
  });

  const { data: items, isLoading: loadingItems } = useQuery<FaqItem[]>({
    queryKey: ['faq-items'],
    queryFn: faqService.listItems,
  });

  const invalidateFaq = () => {
    queryClient.invalidateQueries({ queryKey: ['faq-categories'] });
    queryClient.invalidateQueries({ queryKey: ['faq-items'] });
  };

  const createCategoryMutation = useMutation({
    mutationFn: () => faqService.createCategory(buildCategoryPayload(catForm)),
    onSuccess: () => {
      invalidateFaq();
      setCatDialog({ open: false });
      toast.success(t('Categoria criada!', 'Category created!'));
    },
    onError: () => toast.error(t('Erro ao criar categoria.', 'Failed to create category.')),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: () => faqService.updateCategory(catDialog.category!.id, buildCategoryPayload(catForm)),
    onSuccess: () => {
      invalidateFaq();
      setCatDialog({ open: false });
      toast.success(t('Categoria atualizada!', 'Category updated!'));
    },
    onError: () => toast.error(t('Erro ao atualizar categoria.', 'Failed to update category.')),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => faqService.deleteCategory(id),
    onSuccess: () => {
      invalidateFaq();
      toast.success(t('Categoria removida!', 'Category removed!'));
    },
    onError: () => toast.error(t('Erro ao remover categoria.', 'Failed to remove category.')),
  });

  const createItemMutation = useMutation({
    mutationFn: () => faqService.createItem(buildItemPayload(itemForm)),
    onSuccess: () => {
      invalidateFaq();
      setItemDialog({ open: false });
      toast.success(t('Pergunta criada!', 'Question created!'));
    },
    onError: () => toast.error(t('Erro ao criar pergunta.', 'Failed to create question.')),
  });

  const updateItemMutation = useMutation({
    mutationFn: () => faqService.updateItem(itemDialog.item!.id, buildItemPayload(itemForm)),
    onSuccess: () => {
      invalidateFaq();
      setItemDialog({ open: false });
      toast.success(t('Pergunta atualizada!', 'Question updated!'));
    },
    onError: () => toast.error(t('Erro ao atualizar pergunta.', 'Failed to update question.')),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => faqService.deleteItem(id),
    onSuccess: () => {
      invalidateFaq();
      toast.success(t('Pergunta removida!', 'Question removed!'));
    },
    onError: () => toast.error(t('Erro ao remover pergunta.', 'Failed to remove question.')),
  });

  const normalizedSearch = search.trim().toLowerCase();

  const sections = useMemo<CategorySection[]>(() => {
    const categoryList = sortByOrder(categories ?? []);
    const itemList = sortByOrder(items ?? []);

    return categoryList
      .map((category) => ({
        ...category,
        items: itemList.filter((item) => item.categoryId === category.id),
      }))
      .filter((section) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          section.name.toLowerCase().includes(normalizedSearch) ||
          section.slug.toLowerCase().includes(normalizedSearch) ||
          section.items.some(
            (item) =>
              item.question.toLowerCase().includes(normalizedSearch) ||
              item.answer.toLowerCase().includes(normalizedSearch)
          )
        );
      });
  }, [categories, items, normalizedSearch]);

  const uncategorizedItems = useMemo(
    () =>
      sortByOrder(
        (items ?? []).filter((item) => {
          if (item.categoryId !== null) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          return (
            item.question.toLowerCase().includes(normalizedSearch) ||
            item.answer.toLowerCase().includes(normalizedSearch)
          );
        })
      ),
    [items, normalizedSearch]
  );

  const isLoading = loadingCategories || loadingItems;
  const totalCategories = categories?.length ?? 0;
  const totalItems = items?.length ?? 0;
  const totalHelpful = (items ?? []).reduce((sum, item) => sum + item.helpfulYes, 0);
  const inactiveItems = (items ?? []).filter((item) => !item.active).length;

  function buildCategoryPayload(form: CategoryFormState) {
    return {
      name: form.name.trim(),
      slug: (form.slug.trim() || slugify(form.name)).slice(0, 150),
      sortOrder: form.sortOrder,
      active: form.active,
    };
  }

  function buildItemPayload(form: ItemFormState) {
    return {
      categoryId: form.categoryId === 'none' ? null : Number(form.categoryId),
      question: form.question.trim(),
      answer: form.answer.trim(),
      sortOrder: form.sortOrder,
      active: form.active,
    };
  }

  function openNewCategory() {
    setCatForm({
      name: '',
      slug: '',
      sortOrder: totalCategories + 1,
      active: true,
    });
    setCatDialog({ open: true });
  }

  function openEditCategory(category: FaqCategory) {
    setCatForm({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      active: category.active,
    });
    setCatDialog({ open: true, category });
  }

  function openNewItem(categoryId?: number | null) {
    setItemForm({
      categoryId: categoryId ? String(categoryId) : 'none',
      question: '',
      answer: '',
      sortOrder: totalItems + 1,
      active: true,
    });
    setItemDialog({ open: true, categoryId });
  }

  function openEditItem(item: FaqItem) {
    setItemForm({
      categoryId: item.categoryId ? String(item.categoryId) : 'none',
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      active: item.active,
    });
    setItemDialog({ open: true, item, categoryId: item.categoryId });
  }

  function renderQuestionRow(item: FaqItem) {
    return (
      <div key={item.id} className="rounded-xl border border-border/60 bg-background/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{item.question}</p>
              {!item.active && <Badge variant="secondary">{t('Inativa', 'Inactive')}</Badge>}
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.answer}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {item.helpfulYes}</span>
              <span className="inline-flex items-center gap-1"><ThumbsDown className="h-3.5 w-3.5" /> {item.helpfulNo}</span>
              <span>{t('Ordem', 'Order')}: {item.sortOrder}</span>
              {item.categoryName && <span>{item.categoryName}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditItem(item)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => {
                if (confirm(t('Excluir esta pergunta?', 'Delete this question?'))) {
                  deleteItemMutation.mutate(item.id);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('Central de FAQ', 'FAQ Center')}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {t(
                'Organize respostas por categoria, destaque as dúvidas mais úteis e mantenha sua central de ajuda pronta para reduzir tickets repetidos.',
                'Organize answers by category, highlight the most useful questions, and keep your help center ready to reduce repetitive tickets.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openNewItem()}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('Nova Pergunta', 'New Question')}
            </Button>
            <Button onClick={openNewCategory}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('Nova Categoria', 'New Category')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: HelpCircle,
              label: t('Categorias', 'Categories'),
              value: totalCategories,
              tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
            },
            {
              icon: FileQuestion,
              label: t('Perguntas', 'Questions'),
              value: totalItems,
              tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            },
            {
              icon: ThumbsUp,
              label: t('Votos úteis', 'Helpful votes'),
              value: totalHelpful,
              tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
            },
            {
              icon: MessageSquareQuote,
              label: t('Itens inativos', 'Inactive items'),
              value: inactiveItems,
              tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
            },
          ].map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${entry.tone}`}>
                  <entry.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{entry.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-lg">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('Buscar por pergunta, resposta ou categoria...', 'Search by question, answer, or category...')}
                />
              </div>
              <Badge variant="outline" className="w-fit">
                {t('Exibindo', 'Showing')} {sections.reduce((count, section) => count + section.items.length, 0) + uncategorizedItems.length}
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {sections.map((section) => {
                  const isExpanded = normalizedSearch ? true : expandedKey === String(section.id);
                  return (
                    <div key={section.id} className="overflow-hidden rounded-2xl border border-border/80 bg-background/40">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left hover:bg-muted/40"
                        onClick={() => setExpandedKey(isExpanded ? null : String(section.id))}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                            <p className="text-sm font-semibold text-foreground">{section.name}</p>
                            {!section.active && <Badge variant="secondary">{t('Inativa', 'Inactive')}</Badge>}
                            <Badge variant="outline">{section.items.length} {t('itens', 'items')}</Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">/{section.slug}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); openNewItem(section.id); }}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); openEditCategory(section); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (confirm(t('Excluir categoria e itens vinculados?', 'Delete category and linked items?'))) {
                                deleteCategoryMutation.mutate(section.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border/60 px-4 py-4">
                          {section.items.length > 0 ? (
                            <div className="space-y-3">{section.items.map((item) => renderQuestionRow(item))}</div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                              {t('Nenhuma pergunta nesta categoria ainda.', 'No questions in this category yet.')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {uncategorizedItems.length > 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('Sem categoria', 'Uncategorized')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('Itens válidos, mas ainda não agrupados na navegação pública.', 'Valid items that are not grouped in the public navigation yet.')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openNewItem(null)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        {t('Adicionar item', 'Add item')}
                      </Button>
                    </div>
                    <div className="space-y-3">{uncategorizedItems.map((item) => renderQuestionRow(item))}</div>
                  </div>
                )}

                {!sections.length && !uncategorizedItems.length && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 py-16 text-center">
                    <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">{t('Nenhum item encontrado.', 'No items found.')}</p>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      {normalizedSearch
                        ? t('Tente outra busca ou limpe os filtros.', 'Try another search or clear the filters.')
                        : t('Comece criando categorias e perguntas para montar sua central de ajuda.', 'Start by creating categories and questions to build your help center.')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {t('Playbook SaaS', 'SaaS playbook')}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                {t('O que um FAQ bom precisa ter', 'What a good FAQ needs')}
              </h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>{t('1. Categorias orientadas por jornada: entrega, pagamento, pedidos, trocas e suporte.', '1. Journey-based categories: shipping, payments, orders, returns, and support.')}</p>
                <p>{t('2. Respostas curtas no início e passos acionáveis logo abaixo.', '2. Short answer first, then actionable steps below.')}</p>
                <p>{t('3. Atualize os itens mais votados para reduzir tickets repetidos.', '3. Keep the most-voted items updated to reduce repetitive tickets.')}</p>
                <p>{t('4. Tudo que vira ticket recorrente deve ganhar uma resposta pública.', '4. Anything that turns into a recurring ticket should become a public answer.')}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {t('Checklist público', 'Public checklist')}
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="font-medium text-foreground">{t('Help center da loja', 'Store help center')}</p>
                  <p>{t('Deixe FAQ, contato e consulta de tickets visíveis no menu de ajuda.', 'Keep FAQ, contact, and ticket lookup visible in the help menu.')}</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="font-medium text-foreground">{t('Base para suporte', 'Support foundation')}</p>
                  <p>{t('Perguntas com maior volume de votos negativos são candidatas a revisão imediata.', 'Questions with the highest negative votes should be reviewed immediately.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={catDialog.open} onOpenChange={(open) => !open && setCatDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{catDialog.category ? t('Editar categoria', 'Edit category') : t('Nova categoria', 'New category')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Nome', 'Name')}</Label>
              <Input value={catForm.name} onChange={(event) => setCatForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={catForm.slug}
                onChange={(event) => setCatForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder={slugify(catForm.name) || 'entrega-e-frete'}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Ordem', 'Order')}</Label>
              <Input
                type="number"
                value={catForm.sortOrder}
                onChange={(event) => setCatForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{t('Categoria ativa', 'Active category')}</p>
                <p className="text-xs text-muted-foreground">{t('Categorias inativas não devem aparecer na central pública.', 'Inactive categories should not appear in the public help center.')}</p>
              </div>
              <Switch checked={catForm.active} onCheckedChange={(value) => setCatForm((current) => ({ ...current, active: value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog({ open: false })}>{t('Cancelar', 'Cancel')}</Button>
            <Button
              onClick={() => (catDialog.category ? updateCategoryMutation.mutate() : createCategoryMutation.mutate())}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending || !catForm.name.trim()}
            >
              {t('Salvar', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialog.open} onOpenChange={(open) => !open && setItemDialog({ open: false })}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{itemDialog.item ? t('Editar pergunta', 'Edit question') : t('Nova pergunta', 'New question')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Categoria', 'Category')}</Label>
              <Select value={itemForm.categoryId} onValueChange={(value) => setItemForm((current) => ({ ...current, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Selecione uma categoria', 'Select a category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('Sem categoria', 'Uncategorized')}</SelectItem>
                  {sortByOrder(categories ?? []).map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Pergunta', 'Question')}</Label>
              <Input value={itemForm.question} onChange={(event) => setItemForm((current) => ({ ...current, question: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('Resposta', 'Answer')}</Label>
              <Textarea rows={7} value={itemForm.answer} onChange={(event) => setItemForm((current) => ({ ...current, answer: event.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('Ordem', 'Order')}</Label>
                <Input
                  type="number"
                  value={itemForm.sortOrder}
                  onChange={(event) => setItemForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('Pergunta ativa', 'Active question')}</p>
                  <p className="text-xs text-muted-foreground">{t('Somente perguntas ativas entram na experiência pública.', 'Only active questions are published publicly.')}</p>
                </div>
                <Switch checked={itemForm.active} onCheckedChange={(value) => setItemForm((current) => ({ ...current, active: value }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog({ open: false })}>{t('Cancelar', 'Cancel')}</Button>
            <Button
              onClick={() => (itemDialog.item ? updateItemMutation.mutate() : createItemMutation.mutate())}
              disabled={createItemMutation.isPending || updateItemMutation.isPending || !itemForm.question.trim() || !itemForm.answer.trim()}
            >
              {t('Salvar', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}