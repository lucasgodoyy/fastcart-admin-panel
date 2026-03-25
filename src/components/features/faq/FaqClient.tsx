'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import faqService from '@/services/admin/faqService';
import { FaqCategory, FaqItem } from '@/types/faq';
import { t } from '@/lib/admin-language';

export function FaqClient() {
  const queryClient = useQueryClient();
  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  const [catDialog, setCatDialog] = useState<{ open: boolean; category?: FaqCategory }>({ open: false });
  const [catForm, setCatForm] = useState({ name: '', slug: '', sortOrder: 0, active: true });

  const [itemDialog, setItemDialog] = useState<{ open: boolean; categoryId: number; item?: FaqItem }>({ open: false, categoryId: 0 });
  const [itemForm, setItemForm] = useState({ question: '', answer: '', sortOrder: 0, active: true });

  const { data: categories, isLoading } = useQuery<FaqCategory[]>({
    queryKey: ['faq-categories'],
    queryFn: faqService.listCategories,
  });

  const createCatMutation = useMutation({
    mutationFn: () => faqService.createCategory(catForm.name, catForm.sortOrder),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faq-categories'] }); setCatDialog({ open: false }); toast.success(t('Categoria criada!', 'Category created!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const updateCatMutation = useMutation({
    mutationFn: () => faqService.updateCategory(catDialog.category!.id, catForm.name, catForm.sortOrder, catForm.active),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faq-categories'] }); setCatDialog({ open: false }); toast.success(t('Categoria atualizada!', 'Category updated!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => faqService.deleteCategory(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faq-categories'] }); toast.success(t('Categoria removida!', 'Category removed!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const createItemMutation = useMutation({
    mutationFn: () => faqService.createItem(itemDialog.categoryId, itemForm.question, itemForm.answer, itemForm.sortOrder),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faq-categories'] }); setItemDialog({ open: false, categoryId: 0 }); toast.success(t('Pergunta criada!', 'Question created!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const updateItemMutation = useMutation({
    mutationFn: () => faqService.updateItem(itemDialog.item!.id, itemForm.question, itemForm.answer, itemForm.sortOrder, itemForm.active),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faq-categories'] }); setItemDialog({ open: false, categoryId: 0 }); toast.success(t('Pergunta atualizada!', 'Question updated!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ itemId }: { catId: number; itemId: number }) => faqService.deleteItem(itemId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['faq-categories'] }); toast.success(t('Pergunta removida!', 'Question removed!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  function openNewCategory() {
    setCatForm({ name: '', slug: '', sortOrder: (categories?.length ?? 0) + 1, active: true });
    setCatDialog({ open: true });
  }

  function openEditCategory(cat: FaqCategory) {
    setCatForm({ name: cat.name, slug: '', sortOrder: cat.sortOrder, active: cat.active });
    setCatDialog({ open: true, category: cat });
  }

  function openNewItem(catId: number) {
    setItemForm({ question: '', answer: '', sortOrder: 0, active: true });
    setItemDialog({ open: true, categoryId: catId });
  }

  function openEditItem(catId: number, item: FaqItem) {
    setItemForm({ question: item.question, answer: item.answer, sortOrder: item.sortOrder, active: item.active });
    setItemDialog({ open: true, categoryId: catId, item });
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Perguntas Frequentes (FAQ)', 'Frequently Asked Questions (FAQ)')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Gerencie categorias e perguntas do FAQ da loja.', 'Manage FAQ categories and questions for the store.')}
          </p>
        </div>
        <Button size="sm" onClick={openNewCategory}>
          <Plus className="mr-1.5 h-4 w-4" />{t('Nova Categoria', 'New Category')}
        </Button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}

      <div className="space-y-3">
        {categories?.map((cat) => {
          const isExpanded = expandedCat === cat.id;
          return (
            <div key={cat.id} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40" onClick={() => setExpandedCat(isExpanded ? null : cat.id)}>
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">({cat.items?.length ?? 0} {t('itens', 'items')})</span>
                  {!cat.active && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t('Inativo', 'Inactive')}</span>}
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon-xs" variant="ghost" onClick={() => openEditCategory(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(t('Excluir categoria?', 'Delete category?'))) deleteCatMutation.mutate(cat.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border px-4 py-3">
                  {cat.items && cat.items.length > 0 ? (
                    <div className="space-y-2">
                      {cat.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.question}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.answer}</p>
                          </div>
                          <div className="ml-2 flex items-center gap-1 shrink-0">
                            <Button size="icon-xs" variant="ghost" onClick={() => openEditItem(cat.id, item)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(t('Excluir pergunta?', 'Delete question?'))) deleteItemMutation.mutate({ catId: cat.id, itemId: item.id }); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('Nenhuma pergunta nesta categoria.', 'No questions in this category.')}</p>
                  )}
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => openNewItem(cat.id)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />{t('Adicionar Pergunta', 'Add Question')}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        {!isLoading && (!categories || categories.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t('Nenhuma categoria criada ainda.', 'No categories created yet.')}</p>
          </div>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={catDialog.open} onOpenChange={(v) => !v && setCatDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{catDialog.category ? t('Editar Categoria', 'Edit Category') : t('Nova Categoria', 'New Category')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{t('Nome', 'Name')}</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="ex: envio-entrega" /></div>
            <div><Label>{t('Ordem', 'Order')}</Label><Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })} /></div>
            <div className="flex items-center justify-between">
              <Label>{t('Ativa', 'Active')}</Label>
              <Switch checked={catForm.active} onCheckedChange={(v) => setCatForm({ ...catForm, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog({ open: false })}>{t('Cancelar', 'Cancel')}</Button>
            <Button onClick={() => catDialog.category ? updateCatMutation.mutate() : createCatMutation.mutate()} disabled={createCatMutation.isPending || updateCatMutation.isPending || !catForm.name}>
              {t('Salvar', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialog.open} onOpenChange={(v) => !v && setItemDialog({ open: false, categoryId: 0 })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemDialog.item ? t('Editar Pergunta', 'Edit Question') : t('Nova Pergunta', 'New Question')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{t('Pergunta', 'Question')}</Label><Input value={itemForm.question} onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })} /></div>
            <div><Label>{t('Resposta', 'Answer')}</Label><Textarea rows={4} value={itemForm.answer} onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })} /></div>
            <div><Label>{t('Ordem', 'Order')}</Label><Input type="number" value={itemForm.sortOrder} onChange={(e) => setItemForm({ ...itemForm, sortOrder: Number(e.target.value) })} /></div>
            <div className="flex items-center justify-between">
              <Label>{t('Ativa', 'Active')}</Label>
              <Switch checked={itemForm.active} onCheckedChange={(v) => setItemForm({ ...itemForm, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog({ open: false, categoryId: 0 })}>{t('Cancelar', 'Cancel')}</Button>
            <Button onClick={() => itemDialog.item ? updateItemMutation.mutate() : createItemMutation.mutate()} disabled={createItemMutation.isPending || updateItemMutation.isPending || !itemForm.question || !itemForm.answer}>
              {t('Salvar', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
