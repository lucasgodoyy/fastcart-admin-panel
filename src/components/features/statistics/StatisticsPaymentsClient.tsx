'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
  Percent,
  ShieldCheck,
  RefreshCw,
  Wallet,
  BarChart3,
  Layers,
} from 'lucide-react';
import orderService from '@/services/sales/orderService';
import { DashboardStats, PaymentStats, PaymentMethodStat, PaymentProviderStat, InstallmentStat } from '@/types/order';
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

function KpiCard({
  icon, label, value, sub, trend, loading,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; trend?: number; loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? <div className="mt-0.5 h-6 w-20 animate-pulse rounded bg-muted" /> : <p className="text-lg font-bold text-foreground truncate">{value}</p>}
          {!loading && trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-0.5 text-[11px] font-medium mt-0.5 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
          {!loading && sub && (trend === undefined || trend === 0) && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FunnelRow({ icon, label, count, total, color }: { icon: React.ReactNode; label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground flex-1">{label}</span>
        <span className="text-sm font-bold text-foreground">{count}</span>
        <span className="text-[11px] text-muted-foreground w-12 text-right">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HBar({ label, value, sub, pct, color = 'bg-primary' }: { label: string; value: string; sub?: string; pct: number; color?: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground truncate font-medium">{label}</span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
          <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>;
}

function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => <div key={i} className="h-9 rounded bg-muted animate-pulse" />)}
    </div>
  );
}

function methodIcon(method: string) {
  switch (method.toUpperCase()) {
    case 'PIX': return 'âš¡';
    case 'CARTAO_CREDITO': return 'ðŸ’³';
    case 'CARTAO_DEBITO': return 'ðŸ’³';
    case 'BOLETO': return 'ðŸ“„';
    case 'TRANSFERENCIA': return 'ðŸ¦';
    case 'CARTEIRA': return 'ðŸ‘œ';
    default: return 'ðŸ’°';
  }
}

function providerLabel(provider: string) {
  const p = provider.toLowerCase();
  if (p === 'mercadopago') return 'Mercado Pago';
  if (p === 'stripe') return 'Stripe';
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function StatisticsPaymentsClient() {
  const [period, setPeriod] = useState('30d');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats-payments-dashboard', period],
    queryFn: () => orderService.getDashboardStats(period),
  });

  const { data: payStats, isLoading: payLoading } = useQuery<PaymentStats>({
    queryKey: ['stats-payments', period],
    queryFn: () => orderService.getPaymentStats(period),
  });

  const maxDailyRevenue = stats?.dailyRevenue?.length ? Math.max(...stats.dailyRevenue.map(d => d.revenue), 1) : 1;
  const paymentRate = stats && stats.totalOrders > 0
    ? (((stats.paidOrders + stats.deliveredOrders + stats.shippedOrders) / stats.totalOrders) * 100).toFixed(1)
    : '0';

  const maxMethodRevenue = payStats?.methodBreakdown?.length ? Math.max(...payStats.methodBreakdown.map(m => m.totalRevenue), 1) : 1;
  const maxProviderRevenue = payStats?.providerBreakdown?.length ? Math.max(...payStats.providerBreakdown.map(p => p.totalRevenue), 1) : 1;
  const maxInstallmentOrders = payStats?.installmentBreakdown?.length ? Math.max(...payStats.installmentBreakdown.map(i => i.orderCount), 1) : 1;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header + period */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{t('EstatÃ­sticas Â· Pagamentos', 'Statistics Â· Payments')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('SaÃºde financeira, formas de pagamento e comportamento de parcelamento.', 'Financial health, payment methods and instalment behaviour.')}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {periods.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === p.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ 1. VisÃ£o Geral de Recebimentos â”€â”€ */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        <KpiCard icon={<DollarSign className="h-5 w-5 text-green-600" />} label={t('Receita Bruta', 'Gross Revenue')} value={payStats ? formatCurrency(payStats.totalGrossRevenue) : 'â€”'} sub={payStats ? `${t('Devolvido:', 'Refunded:')} ${formatCurrency(payStats.totalRefunds)}` : undefined} loading={payLoading} />
        <KpiCard icon={<TrendingUp className="h-5 w-5 text-purple-600" />} label={t('Ticket MÃ©dio', 'Avg Order')} value={stats ? formatCurrency(stats.averageOrderValue) : 'â€”'} trend={stats?.revenueTrend} loading={isLoading} />
        <KpiCard icon={<CreditCard className="h-5 w-5 text-blue-600" />} label={t('Pedidos Pagos', 'Paid Orders')} value={stats?.paidOrders.toString() ?? 'â€”'} loading={isLoading} />
        <KpiCard icon={<Percent className="h-5 w-5 text-cyan-600" />} label={t('Taxa de Pagamento', 'Payment Rate')} value={`${paymentRate}%`} loading={isLoading} />
      </div>

      {/* Daily revenue chart */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('Seus pagamentos: visÃ£o geral', 'Your payments: overview')}</h2>
        </div>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">{t('Carregando...', 'Loading...')}</div>
        ) : stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
          <div className="flex items-end gap-1 h-48">
            {stats.dailyRevenue.map((d, i) => {
              const height = Math.max((d.revenue / maxDailyRevenue) * 100, 2);
              return (
                <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                  <div className="w-full rounded-t bg-green-500/80 hover:bg-green-500 transition-colors min-w-1" style={{ height: `${height}%` }} />
                  <div className="absolute -top-10 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    {formatCurrency(d.revenue)}<br />{d.date}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">{t('Sem dados.', 'No data.')}</div>
        )}
      </div>

      {/* â”€â”€ 2. AnÃ¡lise por Forma de Pagamento â”€â”€ */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('AnÃ¡lise por Forma de Pagamento', 'Payment Method Analysis')}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t('Identifique a preferÃªncia do cliente no checkout. Considere oferecer desconto em PIX para aumentar liquidez.', 'Identify checkout preferences. Consider PIX discounts to boost liquidity.')}</p>
        {payLoading ? <SectionSkeleton /> : !payStats?.methodBreakdown?.length ? (
          <Empty text={t('Sem dados de forma de pagamento ainda.', 'No payment method data yet.')} />
        ) : (
          <div className="space-y-3">
            {payStats.methodBreakdown.map((m: PaymentMethodStat) => (
              <div key={m.method} className="flex items-center gap-3">
                <span className="text-lg w-6 shrink-0 text-center">{methodIcon(m.method)}</span>
                <HBar label={m.methodLabel} value={formatCurrency(m.totalRevenue)} sub={`${m.orderCount} ${t('pedidos', 'orders')}`} pct={(m.totalRevenue / maxMethodRevenue) * 100} color="bg-violet-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ 3. AnÃ¡lise por Gateway â”€â”€ */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('AnÃ¡lise por Gateway / Integrador', 'Gateway / Provider Analysis')}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t('Compare receita processada e taxa de aprovaÃ§Ã£o por provedor para decidir qual performa melhor.', 'Compare processed revenue and approval rate by provider to decide which performs best.')}</p>
        {payLoading ? <SectionSkeleton rows={2} /> : !payStats?.providerBreakdown?.length ? (
          <Empty text={t('Sem dados de gateway.', 'No gateway data.')} />
        ) : (
          <div className="space-y-3">
            {payStats.providerBreakdown.map((p: PaymentProviderStat) => (
              <div key={p.provider} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{providerLabel(p.provider)}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{p.orderCount} {t('ped.', 'ord.')}</span>
                    <span className={`font-semibold ${p.approvalRate >= 90 ? 'text-green-600' : p.approvalRate >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {p.approvalRate.toFixed(1)}% {t('aprovaÃ§Ã£o', 'approval')}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.max((p.totalRevenue / maxProviderRevenue) * 100, 2)}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-muted-foreground">{t('Receita:', 'Revenue:')} {formatCurrency(p.totalRevenue)}</span>
                  <span className={`text-[11px] font-medium ${p.approvalRate >= 90 ? 'text-green-600' : 'text-orange-500'}`}>
                    {p.approvalRate >= 90 ? t('âœ“ Alta performance', 'âœ“ High performance') : t('âš  Revisar aprovaÃ§Ã£o', 'âš  Review approval')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ 4. Comportamento de Parcelamento â”€â”€ */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('Comportamento de Parcelamento', 'Instalment Distribution')}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t('FrequÃªncia de cada faixa de parcelamento â€” essencial para calcular o custo de antecipaÃ§Ã£o e entender se o pÃºblico precisa de prazos longos.', 'Frequency of each instalment tier â€” essential to calculate anticipation costs and understand if customers need long terms.')}</p>
        {payLoading ? <SectionSkeleton /> : !payStats?.installmentBreakdown?.length ? (
          <Empty text={t('Sem dados de parcelamento.', 'No instalment data.')} />
        ) : (
          <div className="space-y-3">
            {payStats.installmentBreakdown.map((inst: InstallmentStat) => (
              <div key={inst.installments} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-muted-foreground w-7 shrink-0 text-right tabular-nums">{inst.installments}x</span>
                <HBar
                  label={inst.installments === 1 ? t('Ã€ vista', 'Single payment') : `${inst.installments}x ${t('parcelas', 'instalments')}`}
                  value={`${inst.orderCount} ${t('ped.', 'ord.')}`}
                  sub={formatCurrency(inst.totalRevenue)}
                  pct={(inst.orderCount / maxInstallmentOrders) * 100}
                  color="bg-indigo-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ 5. Indicadores de AprovaÃ§Ã£o e Chargeback â”€â”€ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-foreground">{t('Taxa de AprovaÃ§Ã£o', 'Approval Rate')}</span>
          </div>
          {payLoading ? <div className="h-8 w-20 animate-pulse rounded bg-muted" /> : <>
            <p className="text-2xl font-bold text-foreground">{payStats ? `${payStats.approvalRate.toFixed(1)}%` : 'â€”'}</p>
            <p className="text-xs text-muted-foreground">{t('Pedidos aprovados / total de tentativas', 'Paid orders / total attempts')}</p>
            {payStats && (
              <div className={`text-xs font-medium mt-1 ${payStats.approvalRate >= 90 ? 'text-green-600' : payStats.approvalRate >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                {payStats.approvalRate >= 90 ? t('âœ“ Excelente', 'âœ“ Excellent') : payStats.approvalRate >= 70 ? t('âš  AtenÃ§Ã£o necessÃ¡ria', 'âš  Needs attention') : t('âœ— Investigar rejeiÃ§Ãµes', 'âœ— Investigate rejections')}
              </div>
            )}
          </>}
        </div>

        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-semibold text-foreground">{t('Ãndice de Reembolso', 'Refund / Chargeback Rate')}</span>
          </div>
          {payLoading ? <div className="h-8 w-20 animate-pulse rounded bg-muted" /> : <>
            <p className="text-2xl font-bold text-foreground">{payStats ? `${payStats.refundRate.toFixed(1)}%` : 'â€”'}</p>
            <p className="text-xs text-muted-foreground">{payStats ? `${t('Devolvido:', 'Refunded:')} ${formatCurrency(payStats.totalRefunds)}` : t('% de pedidos com contestaÃ§Ã£o', '% orders with refund/chargeback')}</p>
            {payStats && (
              <div className={`text-xs font-medium mt-1 ${payStats.refundRate < 1 ? 'text-green-600' : payStats.refundRate < 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                {payStats.refundRate < 1 ? t('âœ“ Dentro do normal', 'âœ“ Within normal range') : payStats.refundRate < 3 ? t('âš  Monitorar', 'âš  Monitor closely') : t('âœ— Risco de sanÃ§Ãµes', 'âœ— Risk of sanctions')}
              </div>
            )}
          </>}
        </div>

        <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-foreground">{t('Tempo MÃ©dio de LiberaÃ§Ã£o', 'Est. Release Time')}</span>
          </div>
          {payLoading ? <div className="h-8 w-20 animate-pulse rounded bg-muted" /> : <>
            <p className="text-2xl font-bold text-foreground">{payStats && payStats.avgReleaseTimeDays > 0 ? `${payStats.avgReleaseTimeDays.toFixed(1)}d` : 'â€”'}</p>
            <p className="text-xs text-muted-foreground">{t('Prazo mÃ©dio ponderado para disponibilidade do saldo', 'Weighted avg days until balance available')}</p>
            <div className="text-[11px] text-muted-foreground mt-1 space-y-0.5">
              <p>PIX / TED â†’ 1d Â· Boleto â†’ 3d</p>
              <p>{t('DÃ©bito â†’ 2d Â· CrÃ©dito â†’ ~30d', 'Debit â†’ 2d Â· Credit â†’ ~30d')}</p>
            </div>
          </>}
        </div>
      </div>

      {/* â”€â”€ Funil â”€â”€ */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('Funil de Pagamento', 'Payment Funnel')}</h2>
        </div>
        {isLoading ? <SectionSkeleton rows={4} /> : stats ? (
          <div className="space-y-3">
            <FunnelRow icon={<Clock className="h-4 w-4 text-yellow-500" />} label={t('Pendentes', 'Pending')} count={stats.pendingOrders} total={stats.totalOrders} color="bg-yellow-500" />
            <FunnelRow icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label={t('Pagos', 'Paid')} count={stats.paidOrders} total={stats.totalOrders} color="bg-green-500" />
            <FunnelRow icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} label={t('Entregues', 'Delivered')} count={stats.deliveredOrders} total={stats.totalOrders} color="bg-emerald-500" />
            <FunnelRow icon={<XCircle className="h-4 w-4 text-red-500" />} label={t('Cancelados', 'Cancelled')} count={stats.cancelledOrders} total={stats.totalOrders} color="bg-red-500" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
