'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, TicketPercent } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { couponService } from '@/services/sales';
import { Coupon, CouponScopeType, CouponType, CouponUpsertRequest } from '@/types/coupon';

type CouponFormState = {
  code: string;
  scopeType: CouponScopeType;
  scopeTargetIds: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  perCustomerLimit: string;
  firstOrderOnly: boolean;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

const EMPTY_FORM: CouponFormState = {
  code: '',
  scopeType: 'ALL_PRODUCTS',
  scopeTargetIds: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  perCustomerLimit: '',
  firstOrderOnly: false,
  startsAt: '',
  expiresAt: '',
  active: true,
};

const parseNumber = (value: string): number | null => {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseIds = (value: string): number[] | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = normalized
    .split(',')
    .map((token) => Number(token.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  return parsed.length ? Array.from(new Set(parsed)) : null;
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

const valueLabel = (coupon: Coupon) =>
  coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}%` : `R$ ${Number(coupon.value).toFixed(2)}`;

export function CouponsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: couponService.listAll,
  });

  const createMutation = useMutation({
    mutationFn: (request: CouponUpsertRequest) => couponService.create(request),
    onSuccess: () => {
      toast.success('Cupom criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao criar cupom')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: CouponUpsertRequest }) => couponService.update(id, request),
    onSuccess: () => {
      toast.success('Cupom atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao atualizar cupom')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => couponService.toggleActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: (error) => toast.error(resolveApiErrorMessage(error, 'Falha ao alterar status do cupom')),
  });

  const filteredCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return coupons;

    return coupons.filter((coupon) => {
      return (
        coupon.code.toLowerCase().includes(term) ||
        coupon.scopeType.toLowerCase().includes(term) ||
        coupon.type.toLowerCase().includes(term)
      );
    });
  }, [coupons, search]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      scopeType: coupon.scopeType,
      scopeTargetIds: coupon.scopeTargetIds?.join(',') || '',
      type: coupon.type,
      value: String(coupon.value ?? ''),
      minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : '',
      maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      perCustomerLimit: coupon.perCustomerLimit != null ? String(coupon.perCustomerLimit) : '',
      firstOrderOnly: coupon.firstOrderOnly,
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
      active: coupon.active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
  };

  const toPayload = (): CouponUpsertRequest | null => {
    const value = parseNumber(form.value);
    if (!form.code.trim() || value === null || value <= 0) {
      toast.error('Informe código e valor de desconto válidos');
      return null;
    }

    const scopeTargetIds = parseIds(form.scopeTargetIds);
    if (form.scopeType !== 'ALL_PRODUCTS' && !scopeTargetIds) {
      toast.error('Para escopo específico, informe ao menos um ID de destino');
      return null;
    }

    return {
      code: form.code.trim().toUpperCase(),
      scopeType: form.scopeType,
      scopeTargetIds,
      type: form.type,
      value,
      minOrderAmount: parseNumber(form.minOrderAmount),
      maxDiscountAmount: parseNumber(form.maxDiscountAmount),
      usageLimit: parseNumber(form.usageLimit),
      perCustomerLimit: parseNumber(form.perCustomerLimit),
      firstOrderOnly: form.firstOrderOnly,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: form.active,
    };
  };

  const handleSubmit = () => {
    const payload = toPayload();
    if (!payload) return;

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, request: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-5 font-semibold text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground">Cupons com desconto percentual ou valor fixo.</p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Novo cupom
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cupom por código, tipo ou escopo"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">{filteredCoupons.length} cupons</div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Código</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Discount</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Uso</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando cupons...
                </td>
              </tr>
            )}

            {!isLoading && filteredCoupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhum cupom encontrado.
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{coupon.code}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{valueLabel(coupon)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {coupon.usageCount}/{coupon.usageLimit ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        coupon.active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(coupon)}>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: coupon.id, active: !coupon.active })}
                      >
                        {coupon.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Editar cupom' : 'Criar cupom'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="Código (ex.: BEMVINDO10)"
            />

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Tipo de desconto</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as CouponType }))}
                >
                  <option value="PERCENTAGE">Percentual</option>
                  <option value="FIXED_AMOUNT">Valor fixo</option>
                </select>
              </label>

              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={form.value}
                onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
                placeholder={form.type === 'PERCENTAGE' ? 'Valor (%)' : 'Valor (R$)'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Escopo</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={form.scopeType}
                  onChange={(event) => setForm((prev) => ({ ...prev, scopeType: event.target.value as CouponScopeType }))}
                >
                  <option value="ALL_PRODUCTS">Todos os produtos</option>
                  <option value="SPECIFIC_PRODUCTS">Produtos específicos</option>
                  <option value="SPECIFIC_CATEGORIES">Categorias específicas</option>
                  <option value="SPECIFIC_COLLECTIONS">Coleções específicas</option>
                </select>
              </label>

              {form.scopeType !== 'ALL_PRODUCTS' ? (
                <Input
                  value={form.scopeTargetIds}
                  onChange={(event) => setForm((prev) => ({ ...prev, scopeTargetIds: event.target.value }))}
                  placeholder="IDs alvo (1,2,3)"
                />
              ) : (
                <Input value="Todos" disabled />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.minOrderAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, minOrderAmount: event.target.value }))}
                placeholder="Pedido mínimo (opcional)"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.maxDiscountAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, maxDiscountAmount: event.target.value }))}
                placeholder="Desconto máximo (opcional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(event) => setForm((prev) => ({ ...prev, usageLimit: event.target.value }))}
                placeholder="Limite de uso (opcional)"
              />
              <Input
                type="number"
                min="1"
                value={form.perCustomerLimit}
                onChange={(event) => setForm((prev) => ({ ...prev, perCustomerLimit: event.target.value }))}
                placeholder="Limite por cliente (opcional)"
              />
            </div>

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
                checked={form.firstOrderOnly}
                onChange={(event) => setForm((prev) => ({ ...prev, firstOrderOnly: event.target.checked }))}
              />
              Apenas primeiro pedido
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Cupom ativo
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {editingCoupon ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary">
        <TicketPercent className="h-3.5 w-3.5" />
        Cupons ligados ao backend em /api/v1/coupons
      </div>
    </div>
  );
}
