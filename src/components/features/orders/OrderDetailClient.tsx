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
  AlertTriangle,
  CreditCard,
  Pencil,
  Save,
  X,
  ExternalLink,
  Copy,
  Printer,
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
import { AdminOrder, MercadoPagoDiagnosis, OrderStatus } from '@/types/order';
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
  const [editingTracking, setEditingTracking] = useState(false);
  const [editTrackingCode, setEditTrackingCode] = useState('');
  const [editLabelId, setEditLabelId] = useState('');

  const { data: order, isLoading } = useQuery<AdminOrder>({
    queryKey: ['store-order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !isNaN(orderId),
  });

  const { data: mpDiagnosis, isLoading: isLoadingDiagnosis } = useQuery<MercadoPagoDiagnosis>({
    queryKey: ['mp-diagnosis', orderId],
    queryFn: () => orderService.getMercadoPagoDiagnosis(orderId),
    enabled: !isNaN(orderId) && !!order && order.paymentProvider === 'mercadopago',
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

  const retryCheckoutMutation = useMutation({
    mutationFn: () => orderService.retryMercadoPagoCheckout(orderId),
    onSuccess: (data) => {
      toast.success(t('Link de pagamento gerado!', 'Payment link generated!'));
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['mp-diagnosis', orderId] });
      window.open(data.checkoutUrl, '_blank');
    },
    onError: () => {
      toast.error(t('Erro ao gerar link de pagamento.', 'Error generating payment link.'));
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: ({ trackingCode, shippingLabelId }: { trackingCode?: string; shippingLabelId?: string }) =>
      orderService.updateTracking(orderId, trackingCode, shippingLabelId),
    onSuccess: () => {
      toast.success(t('Rastreio atualizado!', 'Tracking updated!'));
      setEditingTracking(false);
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
    },
    onError: () => toast.error(t('Erro ao atualizar rastreio.', 'Error updating tracking.')),
  });

  const createLabelMutation = useMutation({
    mutationFn: () => orderService.createShippingLabel(orderId),
    onSuccess: () => {
      toast.success(t('Etiqueta sendo gerada! Aguarde alguns segundos e recarregue.', 'Label being generated! Wait a few seconds and reload.'));
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      }, 5000);
    },
    onError: () => toast.error(t('Erro ao gerar etiqueta.', 'Error generating label.')),
  });

  const printLabelMutation = useMutation({
    mutationFn: () => orderService.printLabel(orderId),
    onSuccess: (data) => {
      const url = data?.url;
      if (url) {
        window.open(url, '_blank');
      }
      toast.success(t('Etiqueta enviada para impressão!', 'Label sent to print!'));
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
    },
    onError: () => toast.error(t('Erro ao imprimir etiqueta.', 'Error printing label.')),
  });

  const syncPaymentMutation = useMutation({
    mutationFn: () => orderService.syncMercadoPagoPayment(orderId),
    onSuccess: (data) => {
      if (data.status === 'synced') {
        toast.success(t('Pagamento sincronizado! Pedido marcado como PAGO.', 'Payment synced! Order marked as PAID.'));
      } else if (data.status === 'already_paid') {
        toast.info(t('Pedido já está pago.', 'Order is already paid.'));
      } else {
        toast.info(data.message || t('Nenhum pagamento aprovado encontrado.', 'No approved payment found.'));
      }
      queryClient.invalidateQueries({ queryKey: ['store-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['mp-diagnosis', orderId] });
    },
    onError: () => {
      toast.error(t('Erro ao sincronizar pagamento.', 'Error syncing payment.'));
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
  const isMercadoPagoOrder = order.paymentProvider === 'mercadopago' || order.paymentDebugInfo || order.paymentLastWebhookAt;
  const canDispatch = isPaid && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const canDeliver = order.status === 'SHIPPED';
  const canCancel = order.status !== 'CANCELLED' && order.status !== 'DELIVERED';
  const canRefund = (isPaid || isPartiallyRefunded) && order.status !== 'CANCELLED';
  const canRetryPayment = !isPaid && order.paymentProvider === 'mercadopago' && order.status !== 'CANCELLED';

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
            {canRetryPayment && (
              <>
                <Button
                  onClick={() => syncPaymentMutation.mutate()}
                  disabled={syncPaymentMutation.isPending}
                  variant="outline"
                  className="gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <RotateCcw className="h-4 w-4" />
                  {syncPaymentMutation.isPending ? t('Sincronizando...', 'Syncing...') : t('Sincronizar Pagamento', 'Sync Payment')}
                </Button>
                <Button
                  onClick={() => retryCheckoutMutation.mutate()}
                  disabled={retryCheckoutMutation.isPending}
                  variant="outline"
                  className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <CreditCard className="h-4 w-4" />
                  {retryCheckoutMutation.isPending ? t('Gerando...', 'Generating...') : t('Tentar Pagamento', 'Retry Payment')}
                </Button>
              </>
            )}
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
              {order.paymentLastWebhookAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t('Último webhook MP', 'Last MP webhook')}</span>
                  <span className="text-right text-foreground">{formatDate(order.paymentLastWebhookAt)}</span>
                </div>
              )}
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

          {isMercadoPagoOrder && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                {t('Diagnóstico Mercado Pago', 'Mercado Pago Diagnostics')}
              </h2>
              {mpDiagnosis && (
                <div className="mb-3 rounded-md border border-amber-300/70 bg-background/70 p-3 text-xs text-foreground">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t('ID da aplicação', 'App owner ID')}</span>
                      <span className="font-mono">{mpDiagnosis.platformUserId || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t('ID do seller da loja', 'Store seller ID')}</span>
                      <span className="font-mono">{mpDiagnosis.mpUserId || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t('Token da loja', 'Store token')}</span>
                      <span>{mpDiagnosis.sellerTokenType}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t('Token da aplicação', 'Platform token')}</span>
                      <span>{mpDiagnosis.platformTokenType}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t('Checkout abre em', 'Checkout opens on')}</span>
                      <span>{mpDiagnosis.checkoutEnvironment === 'sandbox' ? 'sandbox.mercadopago.com.br' : 'www.mercadopago.com.br'}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t('Modo de teste', 'Test mode')}</span>
                      <span>{mpDiagnosis.testMode ? t('Sim', 'Yes') : t('Não', 'No')}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-amber-800 dark:text-amber-200">
                    {mpDiagnosis.checkoutExplanation}
                  </p>
                  <p className="mt-2 font-medium text-amber-900 dark:text-amber-100">
                    {mpDiagnosis.buyerRequirement}
                  </p>
                </div>
              )}
              {isLoadingDiagnosis && (
                <p className="mb-3 text-xs text-muted-foreground">
                  {t('Carregando diagnóstico do Mercado Pago...', 'Loading Mercado Pago diagnosis...')}
                </p>
              )}
              {!order.paymentLastWebhookAt && (
                <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">
                  {t(
                    'Nenhum webhook do Mercado Pago foi registrado para este pedido até agora.',
                    'No Mercado Pago webhook has been recorded for this order yet.'
                  )}
                </p>
              )}
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-background/80 p-3 text-xs leading-5 text-foreground">
                {order.paymentDebugInfo || t('Sem logs persistidos para este pedido.', 'No persisted logs for this order.')}
              </pre>
            </div>
          )}

          {/* Shipping */}
          {(order.shippingMethod || order.shippingCarrier || order.trackingCode || order.shippingAddressJson || isPaid) && (
            <div className="rounded-lg border border-border bg-card px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('Envio e Rastreio', 'Shipping & Tracking')}
                </h2>
                {(order.status === 'SHIPPED' || order.status === 'DELIVERED' || isPaid) && !editingTracking && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => {
                      setEditTrackingCode(order.trackingCode || '');
                      setEditLabelId(order.shippingLabelId || '');
                      setEditingTracking(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    {t('Editar', 'Edit')}
                  </Button>
                )}
              </div>
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

                {/* Tracking code - editable */}
                {editingTracking ? (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div>
                      <Label htmlFor="edit-tracking" className="text-xs">{t('Código de rastreio', 'Tracking code')}</Label>
                      <Input
                        id="edit-tracking"
                        placeholder="BR123456789XX"
                        value={editTrackingCode}
                        onChange={(e) => setEditTrackingCode(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-label" className="text-xs">{t('ID da etiqueta (Melhor Envio)', 'Label ID (Melhor Envio)')}</Label>
                      <Input
                        id="edit-label"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={editLabelId}
                        onChange={(e) => setEditLabelId(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={updateTrackingMutation.isPending}
                        onClick={() => updateTrackingMutation.mutate({
                          trackingCode: editTrackingCode,
                          shippingLabelId: editLabelId,
                        })}
                      >
                        <Save className="h-3 w-3" />
                        {updateTrackingMutation.isPending ? t('Salvando...', 'Saving...') : t('Salvar', 'Save')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => setEditingTracking(false)}
                      >
                        <X className="h-3 w-3" />
                        {t('Cancelar', 'Cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {order.trackingCode ? (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('Rastreio', 'Tracking')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground">{order.trackingCode}</span>
                          <button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(order.trackingCode || '');
                              toast.success(t('Código copiado!', 'Code copied!'));
                            }}
                            title={t('Copiar', 'Copy')}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : isPaid && order.status !== 'CANCELLED' ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                        <Navigation className="h-3.5 w-3.5" />
                        {t('Nenhum código de rastreio informado', 'No tracking code set')}
                      </div>
                    ) : null}

                    {order.shippingLabelId && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('Etiqueta', 'Label')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground">{order.shippingLabelId.substring(0, 12)}...</span>
                          <button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(order.shippingLabelId || '');
                              toast.success(t('ID da etiqueta copiado!', 'Label ID copied!'));
                            }}
                            title={t('Copiar ID', 'Copy ID')}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Label action buttons */}
                    {isPaid && order.status !== 'CANCELLED' && order.shippingMethod !== 'PICKUP' && (
                      <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                        {!order.shippingLabelId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs"
                            disabled={createLabelMutation.isPending}
                            onClick={() => createLabelMutation.mutate()}
                          >
                            <Tag className="h-3 w-3" />
                            {createLabelMutation.isPending
                              ? t('Gerando...', 'Generating...')
                              : t('Gerar Etiqueta', 'Generate Label')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs"
                            disabled={printLabelMutation.isPending}
                            onClick={() => printLabelMutation.mutate()}
                          >
                            <Printer className="h-3 w-3" />
                            {printLabelMutation.isPending
                              ? t('Imprimindo...', 'Printing...')
                              : t('Imprimir Etiqueta', 'Print Label')}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
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
