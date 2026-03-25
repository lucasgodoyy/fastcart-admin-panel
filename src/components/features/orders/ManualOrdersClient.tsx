'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingBag, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import orderService from '@/services/sales/orderService';
import { AdminOrder } from '@/types/order';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

function PaymentBadge({ status }: { status: string }) {
  if (status === 'PAID') {
    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        <CheckCircle className="h-3 w-3" />
        {t('Pago', 'Paid')}
      </Badge>
    );
  }
  if (status === 'PENDING') {
    return (
      <Badge className="gap-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        <Clock className="h-3 w-3" />
        {t('Pendente', 'Pending')}
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-slate-100 text-slate-600 hover:bg-slate-100">
      <XCircle className="h-3 w-3" />
      {t('Não pago', 'Unpaid')}
    </Badge>
  );
}

export function ManualOrdersClient() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<AdminOrder[]>({
    queryKey: ['manual-orders'],
    queryFn: () => orderService.listManualOrders(),
  });

  const markPaidMutation = useMutation({
    mutationFn: (orderId: number) => orderService.markManualOrderPaid(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-orders'] });
      toast.success(t('Pedido marcado como pago!', 'Order marked as paid!'));
    },
    onError: () => toast.error(t('Erro ao marcar pedido como pago.', 'Failed to mark order as paid.')),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('Pedidos Manuais', 'Manual Orders')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t(
              'Pedidos criados manualmente via WhatsApp, Instagram, presencial, etc.',
              'Orders created manually via WhatsApp, Instagram, in-person, etc.'
            )}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/sales/manual/new">
            <Plus className="h-4 w-4" />
            {t('Novo Pedido Manual', 'New Manual Order')}
          </Link>
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">
            {t('Nenhum pedido manual ainda', 'No manual orders yet')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            {t(
              'Crie pedidos manualmente para vendas feitas fora da loja online.',
              'Create manual orders for sales made outside your online store.'
            )}
          </p>
          <Button asChild className="mt-5 gap-2" variant="outline">
            <Link href="/admin/sales/manual/new">
              <Plus className="h-4 w-4" />
              {t('Criar primeiro pedido', 'Create first order')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm"
            >
              {/* Order ID + origin */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-primary">#{order.id}</span>
                  {order.manualOrderOrigin && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {order.manualOrderOrigin}
                    </span>
                  )}
                  <PaymentBadge status={order.paymentStatus} />
                </div>
                <p className="mt-1 text-sm text-foreground font-medium truncate">
                  {order.customerName || t('Cliente não informado', 'Customer not provided')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} {t('item(s)', 'item(s)')} · {formatDate(order.createdAt)}
                </p>
              </div>

              {/* Total */}
              <div className="text-right shrink-0">
                <p className="text-base font-semibold text-foreground">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {order.paymentStatus !== 'PAID' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markPaidMutation.mutate(order.id)}
                    disabled={markPaidMutation.isPending}
                    className="text-xs"
                  >
                    {t('Marcar como pago', 'Mark as paid')}
                  </Button>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
