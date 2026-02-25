'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronDown,
  CircleHelp,
  ExternalLink,
  EyeOff,
  FolderPlus,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { categoryService } from '@/services/catalog';
import { Category } from '@/types/category';

type CategoryWithDepth = Category & { depth: number };
const QUERY_KEY = ['categories'];

const buildCategoryTree = (categories: Category[]): CategoryWithDepth[] => {
  const byParent = new Map<number | null, Category[]>();
  categories.forEach((category) => {
    const parentId = category.parentId ?? null;
    const current = byParent.get(parentId) ?? [];
    byParent.set(parentId, [...current, category]);
  });

  const ordered: CategoryWithDepth[] = [];
  const walk = (parentId: number | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).sort((a, b) => a.name.localeCompare(b.name));
    children.forEach((child) => {
      ordered.push({ ...child, depth });
      walk(child.id, depth + 1);
    });
  };

  walk(null, 0);
  return ordered;
};

export function CategoryClient() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [insertAfterId, setInsertAfterId] = useState<number | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: QUERY_KEY,
    queryFn: () => categoryService.list(),
  });

  const orderedCategories = useMemo(() => buildCategoryTree(categories), [categories]);

  const createMutation = useMutation({
    mutationFn: () => categoryService.create({ name: newCategoryName.trim(), parentId }),
    onSuccess: () => {
      toast.success('Categoria criada com sucesso');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setIsCreating(false);
      setParentId(null);
      setInsertAfterId(null);
      setNewCategoryName('');
    },
    onError: () => toast.error('Não foi possível criar a categoria'),
  });

  const hideMutation = useMutation({
    mutationFn: (category: Category) => categoryService.toggleActive(category.id, !category.active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Categoria atualizada');
    },
    onError: () => toast.error('Não foi possível atualizar a categoria'),
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => categoryService.softDelete(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Categoria removida');
    },
    onError: () => toast.error('Não foi possível remover a categoria'),
  });

  const startCreateRoot = () => {
    setIsCreating(true);
    setParentId(null);
    setInsertAfterId(null);
    setNewCategoryName('');
  };

  const startCreateSubcategory = (category: Category) => {
    setIsCreating(true);
    setParentId(category.id);
    setInsertAfterId(category.id);
    setNewCategoryName('');
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setParentId(null);
    setInsertAfterId(null);
    setNewCategoryName('');
  };

  const saveCreate = () => {
    if (newCategoryName.trim().length < 2) {
      toast.error('Nome da categoria deve ter ao menos 2 caracteres');
      return;
    }
    createMutation.mutate();
  };

  const hasUnsavedChanges = isCreating && newCategoryName.trim().length > 0;

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) {
        return;
      }
      if (rootRef.current?.contains(anchor)) {
        return;
      }

      const origin = window.location.origin;
      const absoluteHref = anchor.href;
      if (!absoluteHref.startsWith(origin)) {
        return;
      }

      event.preventDefault();
      setPendingHref(absoluteHref);
      setShowLeaveDialog(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasUnsavedChanges]);

  const handleCancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingHref(null);
  };

  const handleConfirmLeave = () => {
    cancelCreate();
    setShowLeaveDialog(false);
    if (pendingHref) {
      window.location.href = pendingHref;
    }
    setPendingHref(null);
  };

  const confirmDelete = (category: Category) => {
    const confirmed = window.confirm(`Excluir a categoria "${category.name}"?`);
    if (confirmed) {
      deleteMutation.mutate(category.id);
    }
  };

  const renderCreateRow = (depth: number) => (
    <div className="border-b border-border px-4 py-3" style={{ paddingLeft: `${16 + depth * 20}px` }}>
      <div className="flex items-center gap-2">
        <Input
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          placeholder="Nova categoria"
          className="h-8"
        />
        <button type="button" className="rounded-full border border-border p-1.5 text-muted-foreground">
          <EyeOff className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="rounded-full border border-border p-1.5 text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
        <button type="button" className="rounded-full border border-border p-1.5 text-muted-foreground">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-5 font-semibold text-foreground">Categorias</h1>
        <Button className="h-8 bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90" onClick={startCreateRoot}>
          Criar categoria
        </Button>
      </div>

      <p className="mb-5 text-sm text-foreground/90">
        Para organizar seus produtos, crie categorias e subcategorias que aparecerão no menu da loja.
      </p>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {isLoading && <div className="px-4 py-8 text-sm text-muted-foreground">Carregando categorias...</div>}

        {!isLoading && orderedCategories.length === 0 && !isCreating && (
          <div className="px-4 py-8 text-sm text-muted-foreground">Nenhuma categoria encontrada.</div>
        )}

        {!isLoading &&
          orderedCategories.map((category, index) => {
            const next = orderedCategories[index + 1];
            const hasChildren = (next?.depth ?? 0) > category.depth;

            return (
              <div key={category.id}>
                <div
                  className="flex items-center border-b border-border px-4 py-2.5 hover:bg-muted/50"
                  style={{ paddingLeft: `${16 + category.depth * 20}px` }}
                >
                  <GripVertical className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  {hasChildren ? (
                    <ChevronDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <span className="mr-2 h-3.5 w-3.5" />
                  )}
                  <span className="flex-1 text-sm text-foreground">{category.name}</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-accent">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => startCreateSubcategory(category)}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Criar subcategoria
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.info('Edição completa será adicionada na próxima etapa')}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => hideMutation.mutate(category)}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        {category.active ? 'Ocultar na loja' : 'Mostrar na loja'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => confirmDelete(category)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={startCreateRoot}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar categoria
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isCreating && insertAfterId === category.id && renderCreateRow(category.depth + 1)}
              </div>
            );
          })}

        {isCreating && insertAfterId === null && renderCreateRow(0)}
      </div>

      {isCreating && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={cancelCreate}>
            Cancelar
          </Button>
          <Button size="sm" onClick={saveCreate} disabled={createMutation.isPending}>
            Salvar
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-primary">
        <CircleHelp className="h-3.5 w-3.5" />
        <a href="#" className="inline-flex items-center gap-1 hover:underline">
          Mais sobre criar e organizar as categorias
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <Dialog open={showLeaveDialog} onOpenChange={(open) => setShowLeaveDialog(open)}>
        <DialogContent>
          <DialogTitle>Sair sem salvar as alterações?</DialogTitle>
          <DialogDescription>
            Se sair agora, você perderá todas as alterações realizadas no formulário.
          </DialogDescription>
          <DialogFooter className="mt-3 flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleCancelLeave} size="sm">
              Continuar editando
            </Button>
            <Button onClick={handleConfirmLeave} size="sm">
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
