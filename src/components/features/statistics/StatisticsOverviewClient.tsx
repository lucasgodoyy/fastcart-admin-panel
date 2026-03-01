'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowRight,
} from 'lucide-react';
import orderService from '@/services/sales/orderService';
import { DashboardStats } from '@/types/order';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

const periods = [
  { key: 'today', label: t('Hoje', 'Today') },
  { key: '7d', label: t('7 dias', '7 days') },
  { key: '30d', label: t('30 dias', '30 days') },
  { key: '90d', label: t('90 dias', '90 days') },
  { key: 'all', label: t('Tudo', 'All time') },
];

export function StatisticsOverviewClient() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['statistics-overview', period],
    queryFn: () => orderService.getDashboardStats(period),
  });

  const maxDailyRevenue = stats?.dailyRevenue?.length
    ? Math.max(...stats.dailyRevenue.map(d => d.revenue), 1) : 1;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Estatísticas', 'Statistics')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Indicadores de performance da loja.', 'Store performance indicators.')}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <StatCard icon={<DollarSign className="h-5 w-5 text-green-600" />} label={t('Receita (período)', 'Period Revenue')} value={stats ? formatCurrency(stats.periodRevenue) : '—'} trend={stats?.revenueTrend} loading={isLoading} />
        <StatCard icon={<ShoppingBag className="h-5 w-5 text-blue-600" />} label={t('Pedidos (período)', 'Period Orders')} value={stats?.periodOrders.toString() || '—'} trend={stats?.ordersTrend} loading={isLoading} />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-purple-600" />} label={t('Ticket Médio', 'Avg Order')} value={stats ? formatCurrency(stats.averageOrderValue) : '—'} loading={isLoading} />
        <StatCard icon={<Percent className="h-5 w-5 text-cyan-600" />} label={t('Conversão', 'Conversion')} value={stats ? `${stats.conversionRate}%` : '—'} loading={isLoading} />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t('Receita Diária', 'Daily Revenue')}</h2>
        {isLoading ? (
          <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">{t('Carregando...', 'Loading...')}</div>
        ) : stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
          <div className="flex items-end gap-1 h-44">
            {stats.dailyRevenue.map((d, i) => {
              const height = Math.max((d.revenue / maxDailyRevenue) * 100, 2);
              return (
                <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                  <div className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors min-w-1" style={{ height: `${height}%` }} />
                  <div className="absolute -top-10 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    {formatCurrency(d.revenue)}<br />{d.date}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">{t('Sem dados.', 'No data.')}</div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t('Pagamentos', 'Payments'), href: '/admin/statistics/payments', desc: t('Receita e conversão', 'Revenue & conversion') },
          { label: t('Envio', 'Shipping'), href: '/admin/statistics/shipping', desc: t('SLA e performance', 'SLA & performance') },
          { label: t('Produtos', 'Products'), href: '/admin/statistics/products', desc: t('Mais vendidos', 'Top sellers') },
          { label: t('Tráfego', 'Traffic'), href: '/admin/statistics/traffic', desc: t('Fontes de aquisição', 'Acquisition sources') },
        ].map(link => (
          <Link key={link.href} href={link.href} className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">{link.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, loading }: { icon: React.ReactNode; label: string; value: string; trend?: number; loading: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? <div className="mt-0.5 h-6 w-16 animate-pulse rounded bg-muted" /> : <p className="text-lg font-bold text-foreground truncate">{value}</p>}
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
