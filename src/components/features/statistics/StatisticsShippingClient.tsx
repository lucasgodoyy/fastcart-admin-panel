'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Truck,
  Clock,
  Package,
  DollarSign,
  MapPin,
  TrendingDown,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import orderService from '@/services/sales/orderService';
import { ShippingStats, ShippingMethodStat, ShippingStateStat } from '@/types/order';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

function formatDays(days: number) {
  if (!days || days === 0) return '—';
  return `${days.toFixed(1)}d`;
}

const periods = [
  { key: 'today', label: t('Hoje', 'Today') },
  { key: '7d', label: t('7 dias', '7 days') },
  { key: '30d', label: t('30 dias', '30 days') },
  { key: '90d', label: t('90 dias', '90 days') },
  { key: 'all', label: t('Tudo', 'All time') },
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <div className="mt-0.5 h-6 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-bold text-foreground truncate">{value}</p>
          )}
          {!loading && sub && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Horizontal bar row ────────────────────────────────────────────────────────

function HBar({
  label,
  value,
  sub,
  pct,
  color = 'bg-primary',
  rank,
}: {
  label: string;
  value: string;
  sub?: string;
  pct: number;
  color?: string;
  rank?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      {rank !== undefined && (
        <span className="text-xs font-bold text-muted-foreground w-4 text-right shrink-0">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-foreground truncate font-medium">{label}</span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
            <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ text }: { text: string }) {
  return (
    <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function StatisticsShippingClient() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading } = useQuery<ShippingStats>({
    queryKey: ['stats-shipping', period],
    queryFn: () => orderService.getShippingStats(period),
  });

  // ── Carrier chart max values ──────────────────────────────────────────────
  const maxMethodOrders = stats?.methodBreakdown?.length
    ? Math.max(...stats.methodBreakdown.map((m) => m.orderCount), 1)
    : 1;

  // ── Helper: top-5 bar pct ─────────────────────────────────────────────────
  function pct<T>(list: T[], value: (item: T) => number, item: T) {
    const max = list.length ? Math.max(...list.map(value), 1) : 1;
    return (value(item) / max) * 100;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header + period selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Estatísticas · Envios', 'Statistics · Shipping')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              'Eficiência logística, custos e distribuição geográfica.',
              'Logistics efficiency, costs and geographic distribution.',
            )}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map((p) => (
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

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <KpiCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label={t('Custo Médio de Envio', 'Avg Shipping Cost')}
          value={stats ? formatCurrency(stats.avgShippingCost) : '—'}
          sub={stats ? `Total: ${formatCurrency(stats.totalShippingCost)}` : undefined}
          loading={isLoading}
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label={t('Prazo Médio de Entrega', 'Avg Delivery Time')}
          value={stats ? formatDays(stats.avgDeliveryDays) : '—'}
          sub={t('dias após envio', 'days after dispatch')}
          loading={isLoading}
        />
        <KpiCard
          icon={<Truck className="h-5 w-5 text-indigo-600" />}
          label={t('Em Trânsito', 'In Transit')}
          value={stats?.ordersInTransit.toString() ?? '—'}
          sub={t('pedidos com transportadora', 'orders with carrier')}
          loading={isLoading}
        />
        <KpiCard
          icon={<Package className="h-5 w-5 text-purple-600" />}
          label={t('Total Enviados', 'Total Shipped')}
          value={stats?.totalShippedOrders.toString() ?? '—'}
          sub={t('no período', 'in period')}
          loading={isLoading}
        />
      </div>

      {/* ── Carrier / method comparison ── */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            {t('Eficiência por Transportadora / Meio de Envio', 'Carrier / Shipping Method Efficiency')}
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : !stats?.methodBreakdown?.length ? (
          <Empty text={t('Sem dados de método de envio.', 'No shipping method data.')} />
        ) : (
          <>
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-4 gap-3 mb-2 px-1">
              <span className="text-[11px] font-medium text-muted-foreground col-span-2">
                {t('Método', 'Method')}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground text-right">
                {t('Pedidos', 'Orders')}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground text-right">
                {t('Custo Médio', 'Avg Cost')}
              </span>
            </div>
            <div className="space-y-2">
              {stats.methodBreakdown.map((m: ShippingMethodStat) => (
                <div
                  key={m.method}
                  className="rounded-md border border-border/50 bg-muted/20 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-foreground truncate">{m.method}</span>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.orderCount} {t('pedidos', 'orders')}</span>
                      <span>{formatCurrency(m.avgCost)} avg</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.max((m.orderCount / maxMethodOrders) * 100, 2)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {t('Receita gerada:', 'Revenue:')} {formatCurrency(m.totalRevenue)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {((m.orderCount / maxMethodOrders) * 100).toFixed(0)}% {t('do volume', 'of volume')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Geographic section ── */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Top 5 by Revenue */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Top 5 · Receita por Estado', 'Top 5 · Revenue by State')}
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !stats?.topStatesByRevenue?.length ? (
            <Empty text={t('Sem dados geográficos.', 'No geographic data.')} />
          ) : (
            <div className="space-y-3">
              {stats.topStatesByRevenue.map((s: ShippingStateStat, i) => (
                <HBar
                  key={s.state}
                  rank={i + 1}
                  label={s.state}
                  value={formatCurrency(s.totalRevenue)}
                  sub={`${s.orderCount} ${t('ped.', 'ord.')}`}
                  pct={pct(stats.topStatesByRevenue, (x) => x.totalRevenue, s)}
                  color="bg-green-500"
                />
              ))}
            </div>
          )}
        </div>

        {/* Top 5 by Orders */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Top 5 · Volume por Estado', 'Top 5 · Volume by State')}
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !stats?.topStatesByOrders?.length ? (
            <Empty text={t('Sem dados geográficos.', 'No geographic data.')} />
          ) : (
            <div className="space-y-3">
              {stats.topStatesByOrders.map((s: ShippingStateStat, i) => (
                <HBar
                  key={s.state}
                  rank={i + 1}
                  label={s.state}
                  value={`${s.orderCount} ${t('pedidos', 'orders')}`}
                  sub={formatCurrency(s.avgShippingCost) + ' avg'}
                  pct={pct(stats.topStatesByOrders, (x) => x.orderCount, s)}
                  color="bg-blue-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cost & Delivery Time analysis ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top 5 by Cost */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Top 5 · Frete Mais Caro por Estado', 'Top 5 · Highest Shipping Cost by State')}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {t(
              'Estados com custo médio de frete mais alto — candidatos a novos parceiros logísticos.',
              'States with highest avg shipping cost — candidates for new logistics partners.',
            )}
          </p>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !stats?.topStatesByCost?.length ? (
            <Empty text={t('Sem dados suficientes.', 'Insufficient data.')} />
          ) : (
            <div className="space-y-3">
              {stats.topStatesByCost.map((s: ShippingStateStat, i) => (
                <HBar
                  key={s.state}
                  rank={i + 1}
                  label={s.state}
                  value={formatCurrency(s.avgShippingCost)}
                  sub={`${s.orderCount} ${t('ped.', 'ord.')}`}
                  pct={pct(stats.topStatesByCost, (x) => x.avgShippingCost, s)}
                  color="bg-orange-500"
                />
              ))}
            </div>
          )}
        </div>

        {/* Top 5 by Delivery Days */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Top 5 · Entrega Mais Lenta por Estado', 'Top 5 · Slowest Delivery by State')}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {t(
              'Estados com maior prazo real de entrega — ajuste expectativas no checkout.',
              'States with longest actual delivery time — adjust checkout estimates.',
            )}
          </p>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !stats?.topStatesByDeliveryDays?.length ? (
            <Empty text={t('Sem dados de entrega registrados.', 'No delivery data recorded.')} />
          ) : (
            <div className="space-y-3">
              {stats.topStatesByDeliveryDays.map((s: ShippingStateStat, i) => (
                <HBar
                  key={s.state}
                  rank={i + 1}
                  label={s.state}
                  value={formatDays(s.avgDeliveryDays)}
                  sub={`${s.orderCount} ${t('ped.', 'ord.')}`}
                  pct={pct(stats.topStatesByDeliveryDays, (x) => x.avgDeliveryDays, s)}
                  color="bg-red-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── State heatmap (visual) ── */}
      {stats && (stats.topStatesByOrders?.length ?? 0) > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('Concentração de Entregas por Estado', 'Delivery Concentration by State')}
            </h2>
          </div>
          <BrazilHeatmap stats={stats} />
        </div>
      )}
    </div>
  );
}

// ── Brazil state heatmap (SVG-based, no external deps) ────────────────────────

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

function BrazilHeatmap({ stats }: { stats: ShippingStats }) {
  const ordersByState: Record<string, number> = {};
  for (const s of stats.topStatesByOrders ?? []) {
    ordersByState[s.state.toUpperCase()] = s.orderCount;
  }
  // include states from other lists too
  for (const s of stats.topStatesByRevenue ?? []) {
    if (!ordersByState[s.state.toUpperCase()]) {
      ordersByState[s.state.toUpperCase()] = s.orderCount;
    }
  }

  const maxOrders = Math.max(...Object.values(ordersByState), 1);

  function intensity(state: string): number {
    return (ordersByState[state] ?? 0) / maxOrders;
  }

  function barColor(v: number): string {
    if (v === 0) return 'bg-muted/40';
    if (v < 0.25) return 'bg-indigo-200 dark:bg-indigo-900';
    if (v < 0.5) return 'bg-indigo-400 dark:bg-indigo-700';
    if (v < 0.75) return 'bg-indigo-600 dark:bg-indigo-500';
    return 'bg-indigo-800 dark:bg-indigo-400';
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
        {BR_STATES.map((uf) => {
          const v = intensity(uf);
          const count = ordersByState[uf] ?? 0;
          return (
            <div
              key={uf}
              title={count > 0 ? `${uf}: ${count} pedidos` : uf}
              className={`relative group rounded-md h-10 flex items-center justify-center cursor-default transition-colors ${barColor(v)}`}
            >
              <span className="text-[11px] font-bold text-foreground/70">{uf}</span>
              {count > 0 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  {count} {count === 1 ? 'pedido' : 'pedidos'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">{t('Menos', 'Less')}</span>
        {['bg-muted/40', 'bg-indigo-200 dark:bg-indigo-900', 'bg-indigo-400 dark:bg-indigo-700', 'bg-indigo-600 dark:bg-indigo-500', 'bg-indigo-800 dark:bg-indigo-400'].map((c, i) => (
          <div key={i} className={`h-4 w-6 rounded-sm ${c}`} />
        ))}
        <span className="text-[11px] text-muted-foreground">{t('Mais', 'More')}</span>
      </div>
    </div>
  );
}
