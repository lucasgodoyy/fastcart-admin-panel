'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Globe, TrendingUp, TrendingDown, Eye, ShoppingCart, DollarSign, ExternalLink, AlertCircle } from 'lucide-react';
import orderService from '@/services/sales/orderService';
import { TrafficStats, TrafficChannelStat } from '@/types/order';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}
function formatNum(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n);
}
function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

const periods = [
  { key: 'today',      label: t('Hoje', 'Today') },
  { key: 'this_week',  label: t('Esta semana', 'This week') },
  { key: 'this_month', label: t('Mês atual', 'This month') },
  { key: '7d',         label: t('7 dias', '7 days') },
  { key: '30d',        label: t('30 dias', '30 days') },
  { key: '90d',        label: t('90 dias', '90 days') },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded bg-muted animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

// ─── Empty ─────────────────────────────────────────────────────────────────────
function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  );
}

// ─── Horizontal Bar ────────────────────────────────────────────────────────────
function HBar({ label, value, max, sublabel, color }: {
  label: string; value: number; max: number; sublabel?: string; color?: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, 1) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground truncate max-w-[55%]">{label}</span>
        <span className="text-muted-foreground font-mono tabular-nums">{sublabel ?? formatNum(value)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color ?? 'hsl(var(--primary))' }} />
      </div>
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, loading }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-base font-bold text-foreground leading-tight truncate">{value}</p>
          )}
          {!loading && sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Channel dot legend ─────────────────────────────────────────────────────────
function ChannelDot({ color }: { color: string }) {
  return <span className="inline-block shrink-0 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function StatisticsTrafficClient() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading } = useQuery<TrafficStats>({
    queryKey: ['stats-traffic', period],
    queryFn: () => orderService.getTrafficStats(period),
  });

  const maxChannelVisits = stats?.channelBreakdown?.length
    ? Math.max(...stats.channelBreakdown.map(c => c.visits), 1)
    : 1;
  const maxChannelRevenue = stats?.channelBreakdown?.length
    ? Math.max(...stats.channelBreakdown.map(c => c.revenue), 1)
    : 1;
  const maxRefVisits = stats?.topReferrers?.length
    ? Math.max(...stats.topReferrers.map(r => r.visits), 1)
    : 1;
  const maxLpVisits = stats?.topLandingPages?.length
    ? Math.max(...stats.topLandingPages.map(l => l.visits), 1)
    : 1;
  const maxRoiAvg = stats?.channelRoi?.length
    ? Math.max(...stats.channelRoi.map(r => r.avgOrderValue), 1)
    : 1;

  const taggedPct = (stats && stats.totalVisits > 0)
    ? ((stats.taggedVisits / stats.totalVisits) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/statistics"
            className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t('Estatísticas · Fontes de Tráfego', 'Statistics · Traffic Sources')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('De onde vêm suas visitas e vendas', 'Where your visits and sales come from')}
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
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

      {/* ── 1. KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard icon={<Eye className="h-5 w-5 text-violet-500" />}
          label={t('Total de Visitas', 'Total Visits')}
          value={stats ? formatNum(stats.totalVisits) : '—'}
          sub={stats ? `${taggedPct}% rastreadas com UTM` : undefined}
          loading={isLoading} />
        <KpiCard icon={<ShoppingCart className="h-5 w-5 text-blue-500" />}
          label={t('Pedidos no Período', 'Orders in period')}
          value={stats ? formatNum(stats.totalOrders) : '—'}
          sub={stats ? `${formatNum(stats.paidOrders)} pagos` : undefined}
          loading={isLoading} />
        <KpiCard icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label={t('Receita Rastreada', 'Tracked Revenue')}
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          loading={isLoading} />
        <KpiCard icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
          label={t('Taxa de Conversão Geral', 'Overall Conversion')}
          value={stats ? fmtPct(stats.overallConversionRate) : '—'}
          sub={t('visitas → pedidos pagos', 'visits → paid orders')}
          loading={isLoading} />
      </div>

      {/* ── 2. Canal de Tráfego: Gráfico Geral ───────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t('Gráfico Geral de Canais', 'Traffic Channel Overview')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('Volume de acessos por canal de marketing no período', 'Access volume per marketing channel in the period')}
            </p>
          </div>
          {/* Legend */}
          {!isLoading && stats?.channelBreakdown && stats.channelBreakdown.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-3">
              {stats.channelBreakdown.slice(0, 5).map(ch => (
                <div key={ch.channel} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ChannelDot color={ch.color} />
                  {ch.channelLabel}
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoading ? <SectionSkeleton rows={5} /> :
          !stats?.channelBreakdown?.length ? (
            <Empty msg={t(
              'Sem dados de canal ainda. Visitas rastreadas com UTM aparecerão aqui.',
              'No channel data yet. Tagged visits with UTM will appear here.'
            )} />
          ) : (
            <div className="space-y-3">
              {stats.channelBreakdown.map(ch => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <ChannelDot color={ch.color} />
                      {ch.channelLabel}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground tabular-nums">
                      <span>{formatNum(ch.visits)} visitas</span>
                      <span className="font-medium text-foreground">{fmtPct(ch.conversionRate)} conv.</span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((ch.visits / maxChannelVisits) * 100, 1)}%`,
                        backgroundColor: ch.color,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* ── 3. KPIs por Canal: Receita + Conversão ───────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">
          {t('Receita e Vendas por Fonte de Tráfego', 'Revenue & Sales by Traffic Source')}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {t('Entenda quais canais realmente geram retorno financeiro', 'Understand which channels actually generate financial return')}
        </p>

        {isLoading ? <SectionSkeleton rows={4} /> :
          !stats?.channelBreakdown?.length ? (
            <Empty msg={t('Sem dados disponíveis.', 'No data available.')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-2 text-muted-foreground font-medium">
                      {t('Canal', 'Channel')}
                    </th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">
                      {t('Visitas', 'Visits')}
                    </th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">
                      {t('Pedidos', 'Orders')}
                    </th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">
                      {t('Receita', 'Revenue')}
                    </th>
                    <th className="text-right pb-2 text-muted-foreground font-medium">
                      {t('Conversão', 'Conv.')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.channelBreakdown.map(ch => (
                    <tr key={ch.channel} className="border-b border-border/50 last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <ChannelDot color={ch.color} />
                          <span className="font-medium text-foreground">{ch.channelLabel}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-muted-foreground">{formatNum(ch.visits)}</td>
                      <td className="py-2 text-right text-muted-foreground">{formatNum(ch.orders)}</td>
                      <td className="py-2 text-right font-semibold text-foreground">{formatCurrency(ch.revenue)}</td>
                      <td className="py-2 text-right">
                        <span className={`font-semibold ${
                          ch.conversionRate >= 3 ? 'text-green-600' :
                          ch.conversionRate >= 1 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {fmtPct(ch.conversionRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* ── 4. Comportamento de Origem: Referrers + Landing Pages ─────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Top Referrers */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            {t('Top Referrers', 'Top Referrers')}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t('Sites que mais enviaram visitantes para sua loja', 'Sites that most sent visitors to your store')}
          </p>

          {isLoading ? <SectionSkeleton rows={5} /> :
            !stats?.topReferrers?.length ? (
              <Empty msg={t(
                'Sem referrers rastreados ainda. Configure o cabeçalho Referrer-Policy.',
                'No referrers tracked yet. Configure the Referrer-Policy header.'
              )} />
            ) : (
              <div className="space-y-3">
                {stats.topReferrers.map(r => (
                  <div key={r.referrer}>
                    <HBar label={r.referrer} value={r.visits} max={maxRefVisits}
                      sublabel={`${formatNum(r.visits)} visitas`}
                      color="#8B5CF6" />
                    {r.orders > 0 && (
                      <div className="flex gap-3 mt-0.5 text-[11px] text-muted-foreground pl-0">
                        <span>{r.orders} pedidos</span>
                        <span>{formatCurrency(r.revenue)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Top Landing Pages */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            {t('Páginas de Destino', 'Landing Pages')}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t('Por onde os usuários estão entrando na loja', 'Where users are entering your store')}
          </p>

          {isLoading ? <SectionSkeleton rows={5} /> :
            !stats?.topLandingPages?.length ? (
              <Empty msg={t(
                'Sem landing pages rastreadas. Adicione landing_page aos links de campanha.',
                'No landing pages tracked. Add landing_page to campaign links.'
              )} />
            ) : (
              <div className="space-y-3">
                {stats.topLandingPages.map(lp => (
                  <div key={lp.landingPage}>
                    <HBar label={lp.landingPage} value={lp.visits} max={maxLpVisits}
                      sublabel={`${formatNum(lp.visits)} visitas`}
                      color="#3B82F6" />
                    {lp.conversions > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {lp.conversions} {t('conversões', 'conversions')}
                        {' · '}{((lp.conversions / lp.visits) * 100).toFixed(1)}% conv.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* ── 5. Inteligência de Investimento (ROI por Canal) ──────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">
          {t('Inteligência de Investimento por Canal', 'Channel Investment Intelligence')}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {t('Ticket médio e qualidade de tráfego — quem compra mais ao longo do tempo?',
             'Average ticket and traffic quality — who buys more over time?')}
        </p>

        {isLoading ? <SectionSkeleton rows={4} /> :
          !stats?.channelRoi?.length ? (
            <Empty msg={t('Sem pedidos pagos rastreados ainda.', 'No tracked paid orders yet.')} />
          ) : (
            <div className="space-y-4">
              {/* CPA rows */}
              <div className="space-y-3">
                {stats.channelRoi.map(r => {
                  const ch = stats.channelBreakdown.find(c => c.channel === r.channel);
                  return (
                    <div key={r.channel} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-36 shrink-0">
                        <ChannelDot color={ch?.color ?? '#64748B'} />
                        <span className="text-xs font-medium text-foreground truncate">{r.channelLabel}</span>
                      </div>
                      <div className="flex-1">
                        <HBar label="" value={r.avgOrderValue} max={maxRoiAvg}
                          sublabel={formatCurrency(r.avgOrderValue)}
                          color={ch?.color ?? '#64748B'} />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{r.paidOrders} pedidos</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CPA disclaimer / LTV note */}
              <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">
                    {t('Custo por Aquisição (CPA) Estimado:', 'Estimated Cost per Acquisition (CPA):')}
                  </strong>{' '}
                  {t(
                    'O CPA real depende do gasto em anúncios de cada canal. Integre com Google Ads / Meta Ads para ver o CPA preciso. O ticket médio acima é um proxy da qualidade do tráfego — canais com ticket alto trazem clientes de maior valor.',
                    'Real CPA depends on ad spend per channel. Integrate with Google Ads / Meta Ads to see accurate CPA. The average ticket above is a proxy for traffic quality — high-ticket channels bring higher-value customers.'
                  )}
                </p>
              </div>
            </div>
          )
        }
      </div>

      {/* ── 6. UTM Setup Guide (shown when data is scarce) ───────────────────── */}
      {!isLoading && stats && stats.taggedVisits === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {t('Nenhum link rastreado com UTM ainda', 'No UTM-tagged links yet')}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t(
                  'Para aprender de onde vêm suas vendas, adicione parâmetros UTM nos links das suas campanhas.',
                  'To learn where your sales come from, add UTM parameters to your campaign links.'
                )}
              </p>
              <div className="mt-2 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-3">
                <p className="text-[11px] font-mono text-amber-800 dark:text-amber-300 break-all">
                  https://sujaloja.com/?<strong>utm_source=instagram</strong>&amp;<strong>utm_medium=social</strong>&amp;<strong>utm_campaign=promo-verao</strong>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">utm_source</p>
                  <p>google, instagram, facebook, email</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">utm_medium</p>
                  <p>organic, social, email, cpc, affiliate</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">utm_campaign</p>
                  <p>promo-verao, lancamento-produto</p>
                </div>
              </div>
              <Link href="/admin/marketing/affiliates"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 mt-1">
                {t('Usar links de afiliado com UTM automático', 'Use affiliate links with automatic UTM')}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Legenda de Cores ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {t('Legenda dos Canais', 'Channel Color Legend')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'BUSCA_ORGANICA',   label: t('Busca Orgânica', 'Organic Search'),    color: '#3B82F6', example: 'google + organic' },
            { key: 'REDES_SOCIAIS',    label: t('Redes Sociais', 'Social Media'),       color: '#EC4899', example: 'instagram, facebook' },
            { key: 'EMAIL_MARKETING',  label: t('E-mail Marketing', 'Email Marketing'), color: '#8B5CF6', example: 'utm_medium=email' },
            { key: 'ANUNCIOS_PAGOS',   label: t('Anúncios Pagos', 'Paid Ads'),          color: '#F59E0B', example: 'utm_medium=cpc' },
            { key: 'AFILIADO',         label: t('Afiliados', 'Affiliates'),             color: '#10B981', example: 'utm_medium=affiliate' },
            { key: 'DIRETO',           label: t('Tráfego Direto', 'Direct Traffic'),    color: '#6366F1', example: 'sem UTM' },
          ].map(c => (
            <div key={c.key} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
              <span className="inline-block shrink-0 h-3 w-3 rounded-full mt-0.5" style={{ backgroundColor: c.color }} />
              <div>
                <p className="text-xs font-medium text-foreground leading-tight">{c.label}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{c.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
