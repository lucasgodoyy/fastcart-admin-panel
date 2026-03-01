'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Package,
  DollarSign,
  Users,
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3,
  Percent,
} from 'lucide-react';

import orderService from '@/services/sales/orderService';
import { AdminOrder, DashboardStats, OrderStatus } from '@/types/order';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: t('Pendente', 'Pending'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3 w-3" /> },
  PROCESSING: { label: t('Processando', 'Processing'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Package className="h-3 w-3" /> },
  SHIPPED: { label: t('Enviado', 'Shipped'), color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <Truck className="h-3 w-3" /> },
  DELIVERED: { label: t('Entregue', 'Delivered'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELLED: { label: t('Cancelado', 'Cancelled'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
};

const periods = [
  { key: 'today', label: t('Hoje', 'Today') },
  { key: '7d', label: t('7 dias', '7 days') },
  { key: '30d', label: t('30 dias', '30 days') },
  { key: '90d', label: t('90 dias', '90 days') },
  { key: 'all', label: t('Tudo', 'All time') },
];

export function DashboardClient() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['store-dashboard-stats', period],
    queryFn: () => orderService.getDashboardStats(period),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<AdminOrder[]>({
    queryKey: ['store-orders'],
    queryFn: () => orderService.listStoreOrders(),
  });

  const recentOrders = orders.slice(0, 8);
  const isLoading = statsLoading || ordersLoading;

  // Calculate max revenue for chart bar heights
  const maxDailyRevenue = stats?.dailyRevenue?.length
    ? Math.max(...stats.dailyRevenue.map(d => d.revenue), 1)
    : 1;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Painel', 'Dashboard')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Visão geral da sua loja.', 'Overview of your store.')}
          </p>
        </div>
        {/* Period Selector */}
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <KpiCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label={t('Receita Total', 'Total Revenue')}
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          trend={stats?.revenueTrend}
          loading={isLoading}
        />
        <KpiCard
          icon={<BarChart3 className="h-5 w-5 text-emerald-600" />}
          label={t('Receita (período)', 'Period Revenue')}
          value={stats ? formatCurrency(stats.periodRevenue) : '—'}
          loading={isLoading}
        />
        <KpiCard
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          label={t('Total Pedidos', 'Total Orders')}
          value={stats?.totalOrders.toString() || '—'}
          trend={stats?.ordersTrend}
          loading={isLoading}
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          label={t('Ticket Médio', 'Avg Order')}
          value={stats ? formatCurrency(stats.averageOrderValue) : '—'}
          loading={isLoading}
        />
        <KpiCard
          icon={<Users className="h-5 w-5 text-orange-500" />}
          label={t('Clientes', 'Customers')}
          value={stats?.totalCustomers.toString() || '—'}
          loading={isLoading}
        />
        <KpiCard
          icon={<Percent className="h-5 w-5 text-cyan-600" />}
          label={t('Conversão', 'Conversion')}
          value={stats ? `${stats.conversionRate}%` : '—'}
          loading={isLoading}
        />
      </div>

      {/* Revenue Chart + Order Status */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('Receita Diária', 'Daily Revenue')}
          </h2>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              {t('Carregando...', 'Loading...')}
            </div>
          ) : stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {stats.dailyRevenue.map((d, i) => {
                const height = Math.max((d.revenue / maxDailyRevenue) * 100, 2);
                return (
                  <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors min-w-1"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-10 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {formatCurrency(d.revenue)}
                      <br />
                      {d.date}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              {t('Nenhum dado de receita no período.', 'No revenue data for this period.')}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('Status dos Pedidos', 'Order Status')}
          </h2>
          {stats ? (
            <div className="space-y-3">
              <StatusBadgeCard label={t('Pendentes', 'Pending')} count={stats.pendingOrders} color="bg-yellow-500" />
              <StatusBadgeCard label={t('Pagos', 'Paid')} count={stats.paidOrders} color="bg-green-500" />
              <StatusBadgeCard label={t('Enviados', 'Shipped')} count={stats.shippedOrders} color="bg-indigo-500" />
              <StatusBadgeCard label={t('Entregues', 'Delivered')} count={stats.deliveredOrders} color="bg-emerald-600" />
              <StatusBadgeCard label={t('Cancelados', 'Cancelled')} count={stats.cancelledOrders} color="bg-red-500" />
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">—</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t('Pedidos Recentes', 'Recent Orders')}
          </h2>
          <Link href="/admin/sales" className="flex items-center gap-1 text-xs text-primary hover:underline">
            {t('Ver todos', 'View all')}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            {t('Carregando...', 'Loading...')}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            {t('Nenhum pedido encontrado ainda.', 'No orders yet.')}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">#</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Cliente', 'Customer')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Total', 'Total')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.PENDING;
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-2.5 text-sm font-medium text-foreground">#{order.id}</td>
                    <td className="px-5 py-2.5 text-sm text-foreground">{order.customerName || '—'}</td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.color}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-sm font-medium text-foreground">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-2.5 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-2.5">
                      <Link href={`/admin/sales/${order.id}`} className="text-primary hover:underline">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, trend, loading }: { icon: React.ReactNode; label: string; value: string; trend?: number; loading: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <div className="mt-0.5 h-6 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-bold text-foreground truncate">{value}</p>
          )}
          {!loading && trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-0.5 text-[11px] font-medium mt-0.5 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadgeCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-bold text-foreground">{count}</span>
    </div>
  );
}
