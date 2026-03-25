'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  CreditCard,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  UserPlus,
  UserCheck,
  Package,
  Globe,
} from 'lucide-react';
import orderService from '@/services/sales/orderService';
import storeService, { StoreInfo } from '@/services/storeService';
import apiClient from '@/lib/api';
import { DashboardStats } from '@/types/order';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

function formatNum(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n);
}

function formatLastUpdated(iso: string | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

const periods = [
  { key: 'today',      label: t('Hoje', 'Today') },
  { key: 'this_week',  label: t('Esta semana', 'This week') },
  { key: 'this_month', label: t('Mês atual', 'This month') },
  { key: '7d',         label: t('7 dias', '7 days') },
  { key: '30d',        label: t('30 dias', '30 days') },
  { key: '90d',        label: t('90 dias', '90 days') },
];

export function StatisticsOverviewClient() {
  const [period, setPeriod] = useState('this_month');

  const { data: topProducts = [] } = useQuery<Array<{ productId: number; productName: string | null; viewCount: number }>>({
    queryKey: ['top-products-analytics'],
    queryFn: async () => {
      const r = await apiClient.get('/admin/analytics/top-products?limit=10');
      return r.data;
    },
  });

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['statistics-overview', period],
    queryFn: () => orderService.getDashboardStats(period),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: store } = useQuery<StoreInfo>({
    queryKey: ['my-store-ga-status'],
    queryFn: storeService.getMyStore,
  });

  const gaConnected = !!store?.googleAnalyticsId;

  const funnelSteps = stats ? [
    { label: t('Visualizações de produtos', 'Product views'), count: stats.periodProductViews, icon: <Eye className="h-4 w-4" />, color: 'bg-violet-500' },
    { label: t('Carrinhos criados', 'Cart additions'), count: stats.cartAdditions, icon: <ShoppingCart className="h-4 w-4" />, color: 'bg-blue-500' },
    { label: t('Checkouts iniciados', 'Checkouts started'), count: stats.checkoutsStarted, icon: <CreditCard className="h-4 w-4" />, color: 'bg-indigo-500' },
    { label: t('Pagamentos confirmados', 'Confirmed payments'), count: stats.periodPaidOrders, icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
  ] : [];

  const funnelMax = funnelSteps.length > 0 ? Math.max(...funnelSteps.map(s => s.count), 1) : 1;
  const customerMax = stats ? Math.max(stats.newCustomers, stats.returningCustomers, 1) : 1;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Visão Geral', 'Overview')}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>{t('Última atualização', 'Last updated')}:</span>
            <span className="font-medium text-foreground">{formatLastUpdated(stats?.lastUpdated)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard icon={<Eye className="h-5 w-5 text-violet-500" />} label={t('Visitas Únicas', 'Unique Visits')} value={stats ? formatNum(stats.uniqueVisits) : '—'} trend={stats?.visitsTrend} loading={isLoading} />
        <KpiCard icon={<ShoppingBag className="h-5 w-5 text-blue-500" />} label={t('Vendas', 'Sales')} value={stats ? formatNum(stats.periodOrders) : '—'} trend={stats?.ordersTrend} loading={isLoading} />
        <KpiCard icon={<DollarSign className="h-5 w-5 text-green-600" />} label={t('Receita Total', 'Total Revenue')} value={stats ? formatCurrency(stats.periodRevenue) : '—'} trend={stats?.revenueTrend} loading={isLoading} />
        <KpiCard icon={<TrendingUp className="h-5 w-5 text-orange-500" />} label={t('Ticket Médio', 'Avg Ticket')} value={stats ? formatCurrency(stats.periodAvgOrder) : '—'} loading={isLoading} />
        <KpiCard icon={<ShoppingCart className="h-5 w-5 text-cyan-500" />} label={t('Conversão do Carrinho', 'Cart Conversion')} value={stats ? `${stats.cartConversionRate.toFixed(1)}%` : '—'} trend={stats?.cartConversionTrend} loading={isLoading} />
      </div>

      {/* Funnel + Customer Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funil */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold text-foreground">{t('Funil de Conversão de Vendas', 'Sales Conversion Funnel')}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{t('Jornada do cliente no período selecionado', 'Customer journey in selected period')}</p>
          {isLoading || !stats ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">{t('Carregando...', 'Loading...')}</div>
          ) : (
            <div className="space-y-4">
              {funnelSteps.map((step, i) => {
                const pct = funnelMax > 0 ? Math.round((step.count / funnelMax) * 100) : 0;
                const prev = funnelSteps[i - 1];
                const dropOff = prev && prev.count > 0 ? Math.round(((prev.count - step.count) / prev.count) * 100) : null;
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-muted-foreground shrink-0">{step.icon}</span>
                        <span className="text-xs text-muted-foreground truncate">{step.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">
                        {formatNum(step.count)}
                        {dropOff !== null && dropOff > 0 && <span className="ml-1.5 text-red-500 font-normal">-{dropOff}%</span>}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-muted/50 overflow-hidden">
                      <div className={`h-full rounded-full ${step.color} transition-all duration-500`} style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                  </div>
                );
              })}
              {stats.periodProductViews > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('Conversão views → vendas', 'Views → sales rate')}</span>
                  <span className="font-semibold text-foreground">
                    {((stats.periodPaidOrders / Math.max(stats.periodProductViews, 1)) * 100).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clientes */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold text-foreground">{t('Comportamento de Clientes', 'Customer Behaviour')}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{t('Novos vs recorrentes no período', 'New vs returning in selected period')}</p>
          {isLoading || !stats ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">{t('Carregando...', 'Loading...')}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-6 h-36 px-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-foreground tabular-nums">{formatNum(stats.newCustomers)}</span>
                  <div className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
                    style={{ height: `${Math.max((stats.newCustomers / customerMax) * 96, 4)}px` }} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserPlus className="h-3 w-3 text-blue-500" />
                    {t('Novos', 'New')}
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-foreground tabular-nums">{formatNum(stats.returningCustomers)}</span>
                  <div className="w-full rounded-t-md bg-green-500 transition-all duration-500"
                    style={{ height: `${Math.max((stats.returningCustomers / customerMax) * 96, 4)}px` }} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserCheck className="h-3 w-3 text-green-500" />
                    {t('Recorrentes', 'Returning')}
                  </div>
                </div>
              </div>
              {(stats.newCustomers + stats.returningCustomers) > 0 && (
                <div className="pt-3 border-t border-border grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('Taxa de fidelização', 'Retention rate')}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {((stats.returningCustomers / (stats.newCustomers + stats.returningCustomers)) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('Total de compradores', 'Total buyers')}</p>
                    <p className="text-sm font-semibold text-foreground">{formatNum(stats.newCustomers + stats.returningCustomers)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart + GA card */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('Receita Diária', 'Daily Revenue')}</h2>
          {isLoading ? (
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">{t('Carregando...', 'Loading...')}</div>
          ) : stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (() => {
            const maxDailyRevenue = Math.max(...stats.dailyRevenue.map(d => d.revenue), 1);
            return (
              <div className="flex items-end gap-0.5 h-44">
                {stats.dailyRevenue.map((d, i) => {
                  const height = Math.max((d.revenue / maxDailyRevenue) * 100, 1);
                  return (
                    <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                      <div className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors" style={{ height: `${height}%` }} />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border border-border text-foreground text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-sm">
                        {formatCurrency(d.revenue)}<br />{d.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">{t('Sem dados.', 'No data.')}</div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-2">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Google Analytics</h2>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${gaConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
              {gaConnected
                ? <><CheckCircle2 className="h-3.5 w-3.5" />{t('Rastreamento ativo', 'Tracking active')}</>
                : <><AlertCircle className="h-3.5 w-3.5" />{t('Não configurado', 'Not configured')}</>
              }
            </div>
            {gaConnected && store?.googleAnalyticsId && (
              <p className="mt-1 text-xs text-muted-foreground font-mono">{store.googleAnalyticsId}</p>
            )}
          </div>
          <div className="space-y-2">
            {!gaConnected && (
              <p className="text-xs text-muted-foreground">{t('Configure o GA para acompanhar visitas e fontes de tráfego.', 'Set up GA to track visits and traffic sources.')}</p>
            )}
            <Link href="/admin/integrations/google-analytics" className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              {gaConnected ? t('Gerenciar configuração', 'Manage settings') : t('Configurar agora', 'Set up now')}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{t('Produtos Mais Visualizados', 'Most Viewed Products')}</h2>
          </div>
          <div className="space-y-2">
            {topProducts.map((p, i) => {
              const maxViews = topProducts[0]?.viewCount || 1;
              const pct = Math.round((p.viewCount / maxViews) * 100);
              return (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                  <Link href={`/admin/products/${p.productId}`} className="flex-1 text-xs text-foreground hover:text-primary transition-colors truncate min-w-0">
                    {p.productName || `Produto #${p.productId}`}
                  </Link>
                  <div className="w-28 h-2 rounded-full bg-muted/60 overflow-hidden shrink-0">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right tabular-nums shrink-0">
                    {p.viewCount.toLocaleString('pt-BR')} views
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/statistics/payments" className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors group flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{t('Pagamentos', 'Payments')}</p>
            <p className="text-xs text-muted-foreground">{t('Receita, funil de pagamento e conversão', 'Revenue, payment funnel & conversion')}</p>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
        <Link href="/admin/statistics/products" className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors group flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{t('Produtos', 'Products')}</p>
            <p className="text-xs text-muted-foreground">{t('Rankings de vendas, estoque e visualizações', 'Sales rankings, stock & views')}</p>
          </div>
          <Package className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
        <Link href="/admin/payments" className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors group flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{t('Financeiro', 'Finance')}</p>
            <p className="text-xs text-muted-foreground">{t('Receita total, transações e repasses', 'Total revenue, transactions & payouts')}</p>
          </div>
          <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
        <Link href="/admin/statistics/traffic" className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors group flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{t('Tráfego', 'Traffic')}</p>
            <p className="text-xs text-muted-foreground">{t('Canais, referrers e conversão por fonte', 'Channels, referrers & source conversion')}</p>
          </div>
          <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, trend, loading }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-base font-bold text-foreground truncate leading-tight">{value}</p>
          )}
          {!loading && trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-0.5 text-[11px] font-medium mt-0.5 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}% {t('vs anterior', 'vs prev')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

