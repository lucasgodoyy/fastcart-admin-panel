'use client';

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, History, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { product as productService } from '@/services/catalog';
import { Product } from '@/types/product';

const QUERY_KEY = ['products'];

type ActionIconButtonProps = {
  label: string;
  onClick?: () => void;
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
      <span className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-95 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
        {label}
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-foreground" />
      </span>
    </div>
  );
}

export function InventoryClient() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [infiniteStock, setInfiniteStock] = useState(true);
  const [stock, setStock] = useState(0);
  const [reason, setReason] = useState('');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: QUERY_KEY,
    queryFn: () => productService.listAll(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { productId: number; infiniteStock: boolean; stock: number; reason?: string }) =>
      productService.updateInventory(payload.productId, {
        infiniteStock: payload.infiniteStock,
        stock: payload.stock,
        reason: payload.reason,
      }),
    onSuccess: () => {
      toast.success('Estoque atualizado');
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSelectedProduct(null);
      setReason('');
    },
    onError: () => toast.error('Não foi possível atualizar o estoque'),
  });

  const openEditStock = (product: Product) => {
    setSelectedProduct(product);
    setInfiniteStock(Boolean(product.infiniteStock));
    setStock(Number(product.stock || 0));
    setReason('');
  };

  const confirmEditStock = () => {
    if (!selectedProduct) return;

    updateMutation.mutate({
      productId: selectedProduct.id,
      infiniteStock,
      stock: infiniteStock ? 0 : Math.max(0, Math.trunc(stock)),
      reason: reason.trim() || undefined,
    });
  };

  const rows = useMemo(() => products, [products]);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-4xl font-semibold text-foreground">Inventário</h1>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Produto</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Estoque</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Variações</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">SKU</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Histórico</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando inventário...
                </td>
              </tr>
            )}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((product) => (
                <tr key={product.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-16 rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground">
                        {product.infiniteStock ? '∞' : product.stock}
                      </div>
                      <ActionIconButton label="Editar estoque" onClick={() => openEditStock(product)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </ActionIconButton>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">-</td>
                  <td className="px-4 py-3 text-sm text-foreground">{product.sku || 'Sem SKU'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <ActionIconButton label="Ver histórico" disabled>
                      <History className="h-4 w-4" />
                    </ActionIconButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Mostrando 1-{rows.length} produtos de {rows.length}
      </div>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estoque</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="inventory-mode"
                  checked={infiniteStock}
                  onChange={() => setInfiniteStock(true)}
                />
                Infinito
              </label>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="inventory-mode"
                  checked={!infiniteStock}
                  onChange={() => setInfiniteStock(false)}
                />
                Limitado
              </label>
            </div>

            {!infiniteStock && (
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Quantidade em estoque</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) => setStock(Number(event.target.value))}
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Motivo (opcional)</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 40))}
                rows={3}
                placeholder="Indique por que foi feita a alteração."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <div className="mt-1 text-xs text-muted-foreground">{reason.length}/40 caracteres</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmEditStock} disabled={updateMutation.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
