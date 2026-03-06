'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Mail,
  Tag,
  Ban,
  MapPin,
  Navigation,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import orderService from '@/services/sales/orderService';
import { AdminOrder, OrderStatus } from '@/types/order';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: t('Pendente', 'Pending'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-4 w-4" /> },
  PROCESSING: { label: t('Processando', 'Processing'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Package className="h-4 w-4" /> },
  SHIPPED: { label: t('Enviado', 'Shipped'), color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <Truck className="h-4 w-4" /> },
  DELIVERED: { label: t('Entregue', 'Delivered'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-4 w-4" /> },
  CANCELLED: { label: t('Cancelado', 'Cancelled'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-4 w-4" /> },
};

function formatCurrency(amount: number, currency?: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function OrderDetailClient() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = Number(params.id);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: order, isLoading } = useQuery<AdminOrder>({
    queryKey: ['store-order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !isNaN(orderId),
  });

  const dispatchMutation = useMutation({
    mutationFn: (code?: string) => orderService.dispatch(orderId, code || undefined),
    onSuccess: () => {
      toast.success(t('Pedido marcado como enviado!', 'Order marked as shipped!'));
      setDispatchDialogOpen(false);
      setTrackingCode('');
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-order-stats'] });
    },
    onError: () => toast.error(t('Erro ao despachar pedido.', 'Error dispatching order.')),
  });

  const deliverMutation = useMutation({
    mutationFn: () => orderService.deliver(orderId),
    onSuccess: () => {
      toast.success(t('Pedido marcado como entregue!', 'Order marked as delivered!'));
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-order-stats'] });
    },
    onError: () => toast.error(t('Erro ao marcar como entregue.', 'Error marking as delivered.')),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => orderService.cancel(orderId, reason || undefined),
    onSuccess: () => {
      toast.success(t('Pedido cancelado com sucesso!', 'Order cancelled successfully!'));
      setCancelDialogOpen(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-order-stats'] });
    },
    onError: () => {
      toast.error(t('Erro ao cancelar pedido.', 'Error cancelling order.'));
      setCancelDialogOpen(false);
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ amountCents, reason }: { amountCents?: number; reason?: string }) =>
      orderService.refund(orderId, amountCents, reason),
    onSuccess: () => {
      toast.success(t('Reembolso processado com sucesso!', 'Refund processed successfully!'));
      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-order-stats'] });
    },
    onError: () => {
      toast.error(t('Erro ao processar reembolso.', 'Error processing refund.'));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-muted-foreground">{t('Carregando pedido...', 'Loading order...')}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <p className="text-sm text-muted-foreground">{t('Pedido não encontrado.', 'Order not found.')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/sales')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('Voltar', 'Back')}
        </Button>
      </div>
    );
  }

  const sc = statusConfig[order.status] || statusConfig.PENDING;
  const isPaid = order.paymentStatus.toLowerCase() === 'paid';
  const isPartiallyRefunded = order.paymentStatus.toLowerCase() === 'partially_refunded';
  const canDispatch = isPaid && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const canDeliver = order.status === 'SHIPPED';
  const canCancel = order.status !== 'CANCELLED' && order.status !== 'DELIVERED';
  const canRefund = (isPaid || isPartiallyRefunded) && order.status !== 'CANCELLED';

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back button + header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-3 gap-1.5 text-muted-foreground" onClick={() => router.push('/admin/sales')}>
          <ArrowLeft className="h-4 w-4" />
          {t('Voltar para pedidos', 'Back to orders')}
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              {t('Pedido', 'Order')} #{order.id}
            </h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${sc.color}`}>
              {sc.icon}
              {sc.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canDispatch && (
              <Button
                onClick={() => setDispatchDialogOpen(true)}
                className="gap-2"
              >
                <Truck className="h-4 w-4" />
                {t('Marcar como Enviado', 'Mark as Shipped')}
              </Button>
            )}
            {canDeliver && (
              <Button
                onClick={() => deliverMutation.mutate()}
                disabled={deliverMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {deliverMutation.isPending ? t('Processando...', 'Processing...') : t('Marcar como Entregue', 'Mark as Delivered')}
              </Button>
            )}
            {canRefund && (
              <Button
                onClick={() => {
                  setRefundAmount(String(order.totalAmount));
                  setRefundDialogOpen(true);
                }}
                variant="outline"
                className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <RotateCcw className="h-4 w-4" />
                {t('Reembolsar', 'Refund')}
              </Button>
            )}
            {canCancel && (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                variant="destructive"
                className="gap-2"
              >
                <Ban className="h-4 w-4" />
                {t('Cancelar Pedido', 'Cancel Order')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch dialog with tracking code */}
      <AlertDialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Despachar Pedido', 'Dispatch Order')} #{order.id}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'O pedido será marcado como enviado. Opcionalmente, informe o código de rastreio.',
                'The order will be marked as shipped. Optionally provide a tracking code.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="tracking-code">{t('Código de rastreio (opcional)', 'Tracking code (optional)')}</Label>
              <Input
                id="tracking-code"
                placeholder="BR123456789XX"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dispatchMutation.isPending}>
              {t('Voltar', 'Go Back')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                dispatchMutation.mutate(trackingCode || undefined);
              }}
              disabled={dispatchMutation.isPending}
            >
              {dispatchMutation.isPending
                ? t('Enviando...', 'Dispatching...')
                : t('Confirmar Envio', 'Confirm Dispatch')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirmation dialog with reason */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Cancelar Pedido', 'Cancel Order')} #{order.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              {isPaid
                ? t(
                    'O pedido será cancelado e o reembolso total será processado via Stripe. O estoque dos produtos será restaurado. Esta ação não pode ser desfeita.',
                    'The order will be cancelled and a full refund will be issued via Stripe. Product stock will be restored. This action cannot be undone.'
                  )
                : t(
                    'O pedido será cancelado e o estoque dos produtos será restaurado. Esta ação não pode ser desfeita.',
                    'The order will be cancelled and product stock will be restored. This action cannot be undone.'
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="cancel-reason">{t('Motivo (opcional)', 'Reason (optional)')}</Label>
              <Textarea
                id="cancel-reason"
                placeholder={t('Ex: Cliente solicitou cancelamento', 'E.g.: Customer requested cancellation')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              {t('Voltar', 'Go Back')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                cancelMutation.mutate(cancelReason || undefined);
              }}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending
                ? t('Cancelando...', 'Cancelling...')
                : isPaid
                  ? t('Cancelar e Reembolsar', 'Cancel & Refund')
                  : t('Cancelar Pedido', 'Cancel Order')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Reembolsar Pedido', 'Refund Order')} #{order.id}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'Informe o valor a ser reembolsado. O total do pedido é ',
                'Enter the refund amount. The order total is '
              )}
              {formatCurrency(order.totalAmount, order.currency)}.
              {isPartiallyRefunded && (
                <span className="block mt-1 text-amber-600 font-medium">
                  {t('Este pedido já possui reembolso parcial.', 'This order already has a partial refund.')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="refund-amount">{t('Valor (R$)', 'Amount (R$)')}</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={order.totalAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="refund-reason">{t('Motivo (opcional)', 'Reason (optional)')}</Label>
              <Textarea
                id="refund-reason"
                placeholder={t('Ex: Produto com defeito', 'E.g.: Defective product')}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={refundMutation.isPending}>
              {t('Voltar', 'Go Back')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                const amount = parseFloat(refundAmount);
                if (isNaN(amount) || amount <= 0) {
                  toast.error(t('Informe um valor válido.', 'Enter a valid amount.'));
                  return;
                }
                const amountCents = Math.round(amount * 100);
                refundMutation.mutate({ amountCents, reason: refundReason || undefined });
              }}
              disabled={refundMutation.isPending}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {refundMutation.isPending
                ? t('Processando...', 'Processing...')
                : t('Confirmar Reembolso', 'Confirm Refund')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: items + totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">{t('Itens do pedido', 'Order Items')}</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('Qtd:', 'Qty:')} {item.quantity} × {formatCurrency(item.price, order.currency)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(item.price * item.quantity, order.currency)}
                  </p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="border-t border-border bg-muted/20 px-5 py-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('Subtotal', 'Subtotal')}</span>
                <span className="text-foreground">{formatCurrency(order.subtotalAmount, order.currency)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('Desconto', 'Discount')}
                    {order.couponCode && <span className="ml-1 text-xs">({order.couponCode})</span>}
                  </span>
                  <span className="text-green-600">-{formatCurrency(order.discountAmount, order.currency)}</span>
                </div>
              )}
              {order.shippingCost != null && order.shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('Frete', 'Shipping')}
                    {order.shippingCarrier && <span className="ml-1 text-xs">({order.shippingCarrier})</span>}
                  </span>
                  <span className="text-foreground">{formatCurrency(order.shippingCost, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                <span className="text-foreground">{t('Total', 'Total')}</span>
                <span className="text-foreground">{formatCurrency(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t('Linha do tempo', 'Timeline')}</h2>
            <div className="space-y-3">
              <TimelineItem
                icon={<Clock className="h-3.5 w-3.5" />}
                label={t('Pedido criado', 'Order created')}
                date={order.createdAt}
                active
              />
              {order.paidAt && (
                <TimelineItem
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                  label={t('Pagamento confirmado', 'Payment confirmed')}
                  date={order.paidAt}
                  active
                />
              )}
              {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                <TimelineItem
                  icon={<Truck className="h-3.5 w-3.5 text-indigo-600" />}
                  label={t('Pedido enviado', 'Order shipped')}
                  date={order.shippedAt || order.updatedAt || order.createdAt}
                  active
                />
              )}
              {order.status === 'DELIVERED' && (
                <TimelineItem
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                  label={t('Pedido entregue', 'Order delivered')}
                  date={order.deliveredAt || order.updatedAt || order.createdAt}
                  active
                />
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t('Cliente', 'Customer')}</h2>
            {order.customerName ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {order.customerName}
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {order.customerEmail}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>

          {/* Payment */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t('Pagamento', 'Payment')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('Status', 'Status')}</span>
                <Badge variant={isPaid ? 'default' : 'secondary'}>
                  {isPaid ? t('Pago', 'Paid') : order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('Moeda', 'Currency')}</span>
                <span className="text-foreground uppercase">{order.currency}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('Cupom', 'Coupon')}</span>
                  <span className="flex items-center gap-1 text-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    {order.couponCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          {(order.shippingMethod || order.shippingCarrier || order.trackingCode || order.shippingAddressJson) && (
            <div className="rounded-lg border border-border bg-card px-5 py-4">
              <h2 className="mb-3 text-sm font-semibold text-foreground">{t('Envio', 'Shipping')}</h2>
              <div className="space-y-2 text-sm">
                {order.shippingCarrier && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('Transportadora', 'Carrier')}</span>
                    <span className="flex items-center gap-1 text-foreground">
                      <Truck className="h-3.5 w-3.5" />
                      {order.shippingCarrier}
                    </span>
                  </div>
                )}
                {order.shippingMethod && order.shippingMethod !== 'PICKUP' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('Método', 'Method')}</span>
                    <span className="text-foreground">{order.shippingMethod}</span>
                  </div>
                )}
                {order.shippingMethod === 'PICKUP' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('Método', 'Method')}</span>
                    <Badge variant="secondary">{t('Retirada', 'Pickup')}</Badge>
                  </div>
                )}
                {order.trackingCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('Rastreio', 'Tracking')}</span>
                    <span className="flex items-center gap-1 text-foreground font-mono text-xs">
                      <Navigation className="h-3.5 w-3.5" />
                      {order.trackingCode}
                    </span>
                  </div>
                )}
                {order.shippingAddressJson && (() => {
                  try {
                    const addr = JSON.parse(order.shippingAddressJson);
                    return (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {addr.address1 && <div>{addr.address1}</div>}
                            {addr.address2 && <div>{addr.address2}</div>}
                            <div>
                              {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}
                            </div>
                            {addr.country && <div>{addr.country}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
            </div>
          )}

          {/* Customer Note */}
          {order.customerNote && (
            <div className="rounded-lg border border-border bg-card px-5 py-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('Nota do cliente', 'Customer Note')}
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.customerNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon, label, date, active }: { icon: React.ReactNode; label: string; date: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className={`text-sm ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
        <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
      </div>
    </div>
  );
}
