'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { promotionService } from '@/services/sales';
import { Promotion, PromotionApplyScopeType, PromotionUpsertRequest } from '@/types/promotion';

type PromotionFormState = {
  name: string;
  buyQuantity: string;
  payQuantity: string;
  buyScopeType: PromotionApplyScopeType;
  payScopeType: PromotionApplyScopeType;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const EMPTY_FORM: PromotionFormState = {
  name: '',
  buyQuantity: '2',
  payQuantity: '1',
  buyScopeType: 'ENTIRE_STORE',
  payScopeType: 'ENTIRE_STORE',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  active: true,
};

const resolveApiErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string; error?: string; details?: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.response?.data?.details ||
    axiosError.message ||
    fallback
  );
};

export function PromotionsClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormState>(EMPTY_FORM);

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: promotionService.listAll,
  });

  const createMutation = useMutation({
    mutationFn: (request: PromotionUpsertRequest) => promotionService.create(request),
    onSuccess: () => {
      toast.success('Promoção criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao criar promoção')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: PromotionUpsertRequest }) => promotionService.update(id, request),
    onSuccess: () => {
      toast.success('Promoção atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao atualizar promoção')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => promotionService.toggleActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao alterar status da promoção')),
  });

  const stats = useMemo(() => {
    const activeCount = promotions.filter((promotion) => promotion.active).length;
    return {
      total: promotions.length,
      active: activeCount,
      inactive: promotions.length - activeCount,
    };
  }, [promotions]);

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setForm({
      name: promotion.name,
      buyQuantity: String(promotion.buyQuantity),
      payQuantity: String(promotion.payQuantity),
      buyScopeType: promotion.buyScopeType,
      payScopeType: promotion.payScopeType,
      usageLimit: promotion.usageLimit != null ? String(promotion.usageLimit) : '',
      startsAt: promotion.startsAt ? promotion.startsAt.slice(0, 16) : '',
      expiresAt: promotion.expiresAt ? promotion.expiresAt.slice(0, 16) : '',
      active: promotion.active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromotion(null);
    setForm(EMPTY_FORM);
  };

  const toPayload = (): PromotionUpsertRequest | null => {
    const buyQuantity = Number(form.buyQuantity);
    const payQuantity = Number(form.payQuantity);

    if (!form.name.trim() || !Number.isInteger(buyQuantity) || !Number.isInteger(payQuantity)) {
      toast.error('Nome, quantidade de compra e de pagamento são obrigatórios');
      return null;
    }

    if (buyQuantity < 1 || payQuantity < 1 || payQuantity > buyQuantity) {
      toast.error('Regra inválida: comprar deve ser >= pagar e ambos >= 1');
      return null;
    }

    return {
      name: form.name.trim(),
      discountType: 'BUY_X_PAY_Y',
      buyQuantity,
      payQuantity,
      buyScopeType: form.buyScopeType,
      buyScopeTargetIds: null,
      payScopeType: form.payScopeType,
      payScopeTargetIds: null,
      combineWithPriceDiscounts: true,
      combineWithFreeShipping: false,
      combineWithCartDiscounts: false,
      combineWithAppDiscounts: false,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    };
  };

  const handleSubmit = () => {
    const payload = toPayload();
    if (!payload) return;

    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, request: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-5 font-semibold text-foreground">Promotions</h1>
          <p className="text-sm text-muted-foreground">Discounts de regra Buy X Pay Y ligados ao backend.</p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nova promoção
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Ativas</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{stats.active}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Inativas</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{stats.inactive}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Nome</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Regra</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Uso</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando promoções...
                </td>
              </tr>
            )}

            {!isLoading && promotions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma promoção encontrada.
                </td>
              </tr>
            )}

            {!isLoading &&
              promotions.map((promotion) => (
                <tr key={promotion.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{promotion.name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    Compre {promotion.buyQuantity}, pague {promotion.payQuantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {promotion.usageCount}/{promotion.usageLimit ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        promotion.active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {promotion.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(promotion)}>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: promotion.id, active: !promotion.active })}
                      >
                        {promotion.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Editar promoção' : 'Criar promoção'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nome interno da promoção"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="1"
                value={form.buyQuantity}
                onChange={(event) => setForm((prev) => ({ ...prev, buyQuantity: event.target.value }))}
                placeholder="Quantidade de compra"
              />
              <Input
                type="number"
                min="1"
                value={form.payQuantity}
                onChange={(event) => setForm((prev) => ({ ...prev, payQuantity: event.target.value }))}
                placeholder="Quantidade de pagamento"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Escopo de compra</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={form.buyScopeType}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, buyScopeType: event.target.value as PromotionApplyScopeType }))
                  }
                >
                  <option value="ENTIRE_STORE">Loja inteira</option>
                  <option value="CATEGORIES">Categorias</option>
                  <option value="PRODUCTS">Produtos</option>
                  <option value="BRANDS">Marcas</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Escopo de pagamento</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={form.payScopeType}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, payScopeType: event.target.value as PromotionApplyScopeType }))
                  }
                >
                  <option value="ENTIRE_STORE">Loja inteira</option>
                  <option value="CATEGORIES">Categorias</option>
                  <option value="PRODUCTS">Produtos</option>
                  <option value="BRANDS">Marcas</option>
                </select>
              </label>
            </div>

            <Input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(event) => setForm((prev) => ({ ...prev, usageLimit: event.target.value }))}
              placeholder="Limite de uso (opcional)"
            />

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Início</span>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Expiração</span>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Promoção ativa
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingPromotion ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary">
        <Tags className="h-3.5 w-3.5" />
        Promotions ligadas ao backend em /api/v1/promotions
      </div>
    </div>
  );
}
