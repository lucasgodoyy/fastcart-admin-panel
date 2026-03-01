'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowRight,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

import orderService from '@/services/sales/orderService';
import { DashboardStats, AdminOrder } from '@/types/order';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

const periods = [
  { key: 'today', label: t('Hoje', 'Today') },
  { key: '7d', label: t('7 dias', '7 days') },
  { key: '30d', label: t('30 dias', '30 days') },
  { key: '90d', label: t('90 dias', '90 days') },
  { key: 'all', label: t('Tudo', 'All time') },
];

export function FinanceClient() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['finance-stats', period],
    queryFn: () => orderService.getDashboardStats(period),
  });

  const { data: orders = [] } = useQuery<AdminOrder[]>({
    queryKey: ['store-orders-finance'],
    queryFn: () => orderService.listStoreOrders(),
  });

  // Filter only paid/completed orders for the transaction list
  const paidOrders = orders.filter(o => ['DELIVERED', 'SHIPPED', 'PROCESSING'].includes(o.status)).slice(0, 15);

  const maxDailyRevenue = stats?.dailyRevenue?.length
    ? Math.max(...stats.dailyRevenue.map(d => d.revenue), 1)
    : 1;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Financeiro', 'Finances')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Acompanhe receita, pagamentos e performance financeira.', 'Track revenue, payments and financial performance.')}
          </p>
        </div>
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

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <FinanceCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label={t('Receita Total', 'Total Revenue')}
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          loading={isLoading}
        />
        <FinanceCard
          icon={<BarChart3 className="h-5 w-5 text-emerald-600" />}
          label={t('Receita (período)', 'Period Revenue')}
          value={stats ? formatCurrency(stats.periodRevenue) : '—'}
          trend={stats?.revenueTrend}
          loading={isLoading}
        />
        <FinanceCard
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          label={t('Ticket Médio', 'Avg Order Value')}
          value={stats ? formatCurrency(stats.averageOrderValue) : '—'}
          loading={isLoading}
        />
        <FinanceCard
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          label={t('Pedidos Pagos', 'Paid Orders')}
          value={stats?.paidOrders.toString() || '—'}
          loading={isLoading}
        />
      </div>

      {/* Payment Status + Revenue Chart */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('Receita Diária', 'Daily Revenue')}
          </h2>
          {isLoading ? (
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
              {t('Carregando...', 'Loading...')}
            </div>
          ) : stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
            <div className="flex items-end gap-1 h-44">
              {stats.dailyRevenue.map((d, i) => {
                const height = Math.max((d.revenue / maxDailyRevenue) * 100, 2);
                return (
                  <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-green-500/80 hover:bg-green-500 transition-colors min-w-1"
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
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
              {t('Nenhum dado de receita no período.', 'No revenue data for this period.')}
            </div>
          )}
        </div>

        {/* Payment Status Summary */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('Status Pagamentos', 'Payment Status')}
          </h2>
          {stats ? (
            <div className="space-y-3">
              <StatusRow
                icon={<Clock className="h-4 w-4 text-yellow-500" />}
                label={t('Pendentes', 'Pending')}
                count={stats.pendingOrders}
              />
              <StatusRow
                icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                label={t('Pagos', 'Paid')}
                count={stats.paidOrders}
              />
              <StatusRow
                icon={<CreditCard className="h-4 w-4 text-indigo-500" />}
                label={t('Enviados', 'Shipped')}
                count={stats.shippedOrders}
              />
              <StatusRow
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                label={t('Entregues', 'Delivered')}
                count={stats.deliveredOrders}
              />
              <StatusRow
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                label={t('Cancelados', 'Cancelled')}
                count={stats.cancelledOrders}
              />
              <div className="pt-3 mt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t('Total Pedidos', 'Total Orders')}</span>
                  <span className="text-sm font-bold text-foreground">{stats.totalOrders}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">—</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t('Transações Recentes', 'Recent Transactions')}
          </h2>
          <Link href="/admin/sales" className="flex items-center gap-1 text-xs text-primary hover:underline">
            {t('Ver todos', 'View all')}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {paidOrders.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            {t('Nenhuma transação encontrada.', 'No transactions found.')}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Pedido', 'Order')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Cliente', 'Customer')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Valor', 'Amount')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
                <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {paidOrders.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-2.5 text-sm font-medium text-foreground">#{order.id}</td>
                  <td className="px-5 py-2.5 text-sm text-foreground">{order.customerName || '—'}</td>
                  <td className="px-5 py-2.5 text-sm font-medium text-green-600">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-2.5 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-2.5">
                    <Link href={`/admin/sales/${order.id}`} className="text-primary hover:underline">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FinanceCard({ icon, label, value, trend, loading }: { icon: React.ReactNode; label: string; value: string; trend?: number; loading: boolean }) {
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

function StatusRow({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-bold text-foreground">{count}</span>
    </div>
  );
}
