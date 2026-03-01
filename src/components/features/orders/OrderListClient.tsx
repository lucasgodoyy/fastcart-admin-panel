'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import orderService from '@/services/sales/orderService';
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
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const { data: orders = [], isLoading } = useQuery<AdminOrder[]>({
    queryKey: ['store-orders'],
    queryFn: () => orderService.listStoreOrders(),
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
        const values = [
          `#${o.id}`,
          o.customerName,
          o.customerEmail,
          o.paymentStatus,
          o.status,
        ]
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Pedidos', 'Orders')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Gerencie todos os pedidos da sua loja.', 'Manage all orders for your store.')}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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
      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-border">
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
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Buscar por #pedido, cliente ou email...', 'Search by #order, customer or email...')}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-2 text-sm text-muted-foreground">
        {filteredOrders.length} {t('pedidos', 'orders')}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">#</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Cliente', 'Customer')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Pagamento', 'Payment')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Total', 'Total')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {t('Carregando pedidos...', 'Loading orders...')}
                </td>
              </tr>
            )}
            {!isLoading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {t('Nenhum pedido encontrado.', 'No orders found.')}
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.PENDING;
              return (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">#{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{order.customerName || '—'}</div>
                    <div className="text-xs text-muted-foreground">{order.customerEmail || ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sc.variant} className="gap-1 text-xs">
                      {sc.icon}
                      {sc.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.paymentStatus.toLowerCase() === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {paymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/sales/${order.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        {t('Ver', 'View')}
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
