'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Trash2, Pencil, X, Package } from 'lucide-react';
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
import { collectionService } from '@/services/catalog';
import { product as productService } from '@/services/catalog';
import { Collection, CollectionRequest } from '@/types/collection';
import { Product } from '@/types/product';

export function CollectionClient() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState<number | null>(null);
  const [showProducts, setShowProducts] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: () => collectionService.list(),
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products', 'for-collections'],
    queryFn: () => productService.listAll(),
  });

  const createMutation = useMutation({
    mutationFn: (req: CollectionRequest) => collectionService.create(req),
    onSuccess: () => {
      toast.success('Coleção criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      resetForm();
    },
    onError: () => toast.error('Erro ao criar coleção'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: CollectionRequest }) =>
      collectionService.update(id, req),
    onSuccess: () => {
      toast.success('Coleção atualizada');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      resetForm();
    },
    onError: () => toast.error('Erro ao atualizar coleção'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => collectionService.delete(id),
    onSuccess: () => {
      toast.success('Coleção excluída');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setShowDelete(null);
    },
    onError: () => toast.error('Erro ao excluir coleção'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setType('MANUAL');
    setSelectedProductIds([]);
    setProductSearch('');
  };

  const openEdit = (col: Collection) => {
    setEditingId(col.id);
    setName(col.name);
    setDescription(col.description || '');
    setType(col.type);
    setSelectedProductIds(col.productIds || []);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const req: CollectionRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      productIds: selectedProductIds,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, req });
    } else {
      createMutation.mutate(req);
    }
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      !selectedProductIds.includes(p.id) &&
      (productSearch === '' ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Coleções</h1>
          <p className="text-sm text-muted-foreground">
            Agrupe produtos em coleções manuais ou automáticas.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Coleção
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma coleção criada ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{col.name}</span>
                  <Badge variant={col.type === 'AUTOMATIC' ? 'default' : 'secondary'}>
                    {col.type === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                  </Badge>
                  {!col.active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inativa
                    </Badge>
                  )}
                </div>
                {col.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {col.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {col.productCount} produto{col.productCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProducts(col.id)}
                  title="Ver produtos"
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(col)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDelete(col.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Coleção' : 'Nova Coleção'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Atualize o nome e os produtos da coleção.'
                : 'Crie uma nova coleção de produtos.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Verão 2025"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Descrição</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'MANUAL' | 'AUTOMATIC')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATIC">Automática</option>
              </select>
            </div>

            {type === 'MANUAL' && (
              <div>
                <label className="mb-1 block text-sm font-medium">Produtos</label>
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar produto por nome ou SKU..."
                  className="mb-2"
                />
                {productSearch && filteredProducts.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-md border">
                    {filteredProducts.slice(0, 10).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setSelectedProductIds((prev) => [...prev, p.id]);
                          setProductSearch('');
                        }}
                      >
                        {p.name}{' '}
                        <span className="text-muted-foreground">({p.sku})</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedProductIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProductIds.map((pid) => {
                      const p = allProducts.find((pp) => pp.id === pid);
                      return (
                        <Badge key={pid} variant="secondary" className="gap-1 pr-1">
                          {p?.name ?? `#${pid}`}
                          <button
                            type="button"
                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                            onClick={() =>
                              setSelectedProductIds((prev) =>
                                prev.filter((id) => id !== pid)
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || isPending}>
              {isPending ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDelete !== null} onOpenChange={(o) => !o && setShowDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir coleção?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Os produtos não serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDelete && deleteMutation.mutate(showDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Preview Dialog */}
      <Dialog open={showProducts !== null} onOpenChange={(o) => !o && setShowProducts(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Produtos da Coleção</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {(() => {
              const col = collections.find((c) => c.id === showProducts);
              if (!col || col.productIds.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground">Nenhum produto nesta coleção.</p>
                );
              }
              return col.productIds.map((pid) => {
                const p = allProducts.find((pp) => pp.id === pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-sm">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    {p?.name ?? `Produto #${pid}`}
                    {p?.sku && (
                      <span className="text-muted-foreground">({p.sku})</span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProducts(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
