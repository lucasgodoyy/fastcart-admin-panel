'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Eye,
  Tag,
  Loader2,
  Download,
  ShoppingBag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer, PageHeader, StatCard, EmptyState } from '@/components/admin/page-header';
import apiClient from '@/lib/api';
import orderService from '@/services/sales/orderService';
import shippingLabelsService from '@/services/shippingLabelsService';
import { AdminOrder, OrderStats, OrderStatus } from '@/types/order';
import { t } from '@/lib/admin-language';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  PENDING: { label: t('Pendente', 'Pending'), variant: 'outline', icon: <Clock className="h-3.5 w-3.5" /> },
  PROCESSING: { label: t('Processando', 'Processing'), variant: 'secondary', icon: <Package className="h-3.5 w-3.5" /> },
  SHIPPED: { label: t('Enviado', 'Shipped'), variant: 'default', icon: <Truck className="h-3.5 w-3.5" /> },
  DELIVERED: { label: t('Entregue', 'Delivered'), variant: 'default', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  CANCELLED: { label: t('Cancelado', 'Cancelled'), variant: 'destructive', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const paymentStatusLabel = (ps: string) => {
  const map: Record<string, string> = {
    paid: t('Pago', 'Paid'),
    pending: t('Pendente', 'Pending'),
    failed: t('Falhou', 'Failed'),
    refunded: t('Reembolsado', 'Refunded'),
  };
  return map[ps.toLowerCase()] || ps;
};

function formatCurrency(amount: number, currency?: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

type FilterTab = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export function OrderListClient() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [generatingLabelId, setGeneratingLabelId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get('/orders/store/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t('CSV exportado com sucesso!', 'CSV exported successfully!'));
    } catch {
      toast.error(t('Erro ao exportar CSV.', 'Error exporting CSV.'));
    } finally {
      setExporting(false);
    }
  };

  const { data: orders = [], isLoading } = useQuery<AdminOrder[]>({
    queryKey: ['store-orders'],
    queryFn: () => orderService.listStoreOrders(),
  });

  const generateLabelMutation = useMutation({
    mutationFn: (orderId: number) => shippingLabelsService.generate([String(orderId)]),
    onSuccess: () => {
      toast.success(t('Etiqueta gerada! Acesse Logística para imprimir.', 'Label generated! Go to Logistics to print.'));
      qc.invalidateQueries({ queryKey: ['store-orders'] });
      setGeneratingLabelId(null);
    },
    onError: () => {
      toast.error(t('Erro ao gerar etiqueta. Verifique se o Melhor Envio está conectado em Logística.', 'Error generating label. Check if Melhor Envio is connected in Logistics.'));
      setGeneratingLabelId(null);
    },
  });

  const { data: stats } = useQuery<OrderStats>({
    queryKey: ['store-order-stats'],
    queryFn: () => orderService.getStats(),
  });

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab !== 'all') {
      const tabMap: Record<string, (o: AdminOrder) => boolean> = {
        pending: (o) => o.status === 'PENDING',
        paid: (o) => o.paymentStatus.toLowerCase() === 'paid',
        shipped: (o) => o.status === 'SHIPPED',
        delivered: (o) => o.status === 'DELIVERED',
        cancelled: (o) => o.status === 'CANCELLED',
      };
      result = result.filter(tabMap[activeTab]);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((o) => {
        const values = [`#${o.id}`, o.customerName, o.customerEmail, o.paymentStatus, o.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return values.includes(term);
      });
    }

    return result;
  }, [orders, activeTab, search]);

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: t('Todos', 'All'), count: stats?.totalOrders },
    { key: 'pending', label: t('Pendentes', 'Pending'), count: stats?.pendingOrders },
    { key: 'paid', label: t('Pagos', 'Paid'), count: stats?.paidOrders },
    { key: 'shipped', label: t('Enviados', 'Shipped'), count: stats?.shippedOrders },
    { key: 'delivered', label: t('Entregues', 'Delivered'), count: stats?.deliveredOrders },
    { key: 'cancelled', label: t('Cancelados', 'Cancelled'), count: stats?.cancelledOrders },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('Pedidos', 'Orders')}
        description={t('Gerencie todos os pedidos da sua loja.', 'Manage all orders for your store.')}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" disabled={exporting} onClick={handleExportCsv}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t('Exportar CSV', 'Export CSV')}
          </Button>
        }
      />

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<Package className="h-5 w-5 text-blue-600" />}
            label={t('Total Pedidos', 'Total Orders')}
            value={stats.totalOrders.toString()}
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5 text-green-600" />}
            label={t('Receita Total', 'Total Revenue')}
            value={formatCurrency(stats.totalRevenue)}
          />
          <StatCard
            icon={<Truck className="h-5 w-5 text-orange-500" />}
            label={t('Ticket Médio', 'Avg Order Value')}
            value={formatCurrency(stats.averageOrderValue)}
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            label={t('Aguardando Envio', 'Awaiting Shipment')}
            value={stats.paidOrders.toString()}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Buscar por #pedido, cliente ou email...', 'Search by #order, customer or email...')}
          className="pl-9"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredOrders.length} {t('pedidos', 'orders')}
      </p>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-5 w-20 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredOrders.length === 0 && (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" />}
          title={t('Nenhum pedido encontrado', 'No orders found')}
          description={t('Os pedidos da sua loja aparecerão aqui.', 'Your store orders will appear here.')}
        />
      )}

      {/* Order card list */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-2">
          {filteredOrders.map((order) => {
            const sc = statusConfig[order.status] || statusConfig.PENDING;
            return (
              <div
                key={order.id}
                className="group rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:border-border/80"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {/* Order ID + origin */}
                  <div className="flex items-center gap-2 sm:w-24 shrink-0">
                    <span className="text-sm font-semibold text-foreground">#{order.id}</span>
                    {order.orderOrigin === 'POS' && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">PDV</Badge>
                    )}
                  </div>

                  {/* Customer info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {order.customerName || '—'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customerEmail || ''}
                    </p>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={sc.variant} className="gap-1 text-xs">
                      {sc.icon}
                      {sc.label}
                    </Badge>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.paymentStatus.toLowerCase() === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {paymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="text-right sm:w-28 shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {order.paymentStatus?.toLowerCase() === 'paid' &&
                      !order.shippingLabelId &&
                      order.status !== 'CANCELLED' &&
                      order.status !== 'DELIVERED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs h-7 px-2"
                        title={t('Gerar Etiqueta', 'Generate Label')}
                        disabled={generatingLabelId === order.id}
                        onClick={() => {
                          setGeneratingLabelId(order.id);
                          generateLabelMutation.mutate(order.id);
                        }}
                      >
                        {generatingLabelId === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Tag className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                    <Link href={`/admin/sales/${order.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        {t('Ver', 'View')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
