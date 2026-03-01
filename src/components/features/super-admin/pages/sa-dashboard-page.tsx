"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building2,
  Users,
  CreditCard,
  Mail,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  Activity,
  Globe,
  Zap,
  DollarSign,
  Eye,
} from "lucide-react";
import { superAdminService } from "@/services/super-admin";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaSkeleton,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";

/* ── Quick-action button ── */
function QuickAction({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
  return (
    <motion.a
      href={href}
      variants={fadeInUp}
      className="flex flex-col items-center gap-2 rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-4 hover:border-[hsl(var(--sa-accent))/0.3] hover:bg-[hsl(var(--sa-surface-hover))] transition-all group cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--sa-accent-subtle))] group-hover:bg-[hsl(var(--sa-accent))] transition-colors">
        <Icon className="h-5 w-5 text-[hsl(var(--sa-accent))] group-hover:text-white transition-colors" />
      </div>
      <span className="text-[11px] font-medium text-[hsl(var(--sa-text-secondary))] group-hover:text-[hsl(var(--sa-text))] transition-colors">{label}</span>
    </motion.a>
  );
}

/* ── Recent activity item ── */
function ActivityItem({ icon: Icon, title, time, color }: {
  icon: React.ComponentType<{ className?: string }>; title: string; time: string; color: string;
}) {
  return (
    <motion.div variants={fadeInUp} className="flex items-center gap-3 py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[hsl(var(--sa-text))] truncate">{title}</p>
        <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{time}</p>
      </div>
    </motion.div>
  );
}

/* ── Top stores row ── */
function TopStoreRow({ rank, name, revenue, orders, status }: {
  rank: number; name: string; revenue: string; orders: number; status: string;
}) {
  return (
    <motion.div variants={fadeInUp} className="flex items-center gap-4 py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <span className="text-[12px] font-bold text-[hsl(var(--sa-text-muted))] w-5 text-center">#{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))] truncate">{name}</p>
        <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{orders} pedidos</p>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-bold text-[hsl(var(--sa-success))]">{revenue}</p>
        <SaStatusBadge status={status} />
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════ */
export function SaDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: subStats } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const { data: activityData } = useQuery({
    queryKey: ["sa-dashboard-activity"],
    queryFn: () => superAdminService.listActivityLogs({ page: 0, size: 6 }),
  });

  const { data: topStoresData } = useQuery({
    queryKey: ["sa-dashboard-top-stores"],
    queryFn: () => superAdminService.listStores({ page: 0, size: 5 }),
  });

  const val = (n?: number) => (isLoading ? "—" : (n ?? 0).toLocaleString("pt-BR"));
  const fmtMoney = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const recentActivity = activityData?.content ?? [];
  const topStores = topStoresData?.content ?? [];
  const mrr = subStats?.mrr ?? 0;
  const arr = mrr * 12;

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Dashboard"
        description="Visão geral da plataforma em tempo real"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] px-3 py-2 text-[12px] text-[hsl(var(--sa-text-muted))]">
              <Activity className="h-3.5 w-3.5 text-[hsl(var(--sa-success))]" />
              Atualizado agora
            </div>
          </div>
        }
      />

      {/* ── KPI Grid ── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SaStatCard title="Lojas Ativas" value={val(data?.activeStores)} subtitle={`${val(data?.totalStores)} total`} icon={Building2} color="accent" trend={{ value: 12, label: "vs mês anterior" }} />
        <SaStatCard title="Usuários" value={val(data?.totalUsers)} subtitle={`${val(data?.activeUsers)} ativos`} icon={Users} color="info" trend={{ value: 8, label: "vs mês anterior" }} />
        <SaStatCard title="Tickets Abertos" value={val(data?.openSupportTickets)} subtitle={`${val(data?.totalSupportTickets)} total`} icon={Mail} color="warning" trend={{ value: -5, label: "vs mês anterior" }} />
        <SaStatCard title="E-mails Enviados" value={val(data?.totalEmailLogs)} subtitle={`${val(data?.failedEmailLogs)} falhas`} icon={Mail} color="success" trend={{ value: 15, label: "vs mês anterior" }} />
      </motion.div>

      {/* ── Revenue + Chart row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="lg:col-span-2 space-y-4">
          <SaCard className="!p-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Receita de Assinaturas</h3>
                  <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">Dados em tempo real do backend</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] mb-1">MRR</p>
                  <p className="text-[24px] font-bold sa-gradient-text">{fmtMoney(mrr)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] mb-1">ARR Projetado</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--sa-success))]">{fmtMoney(arr)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] mb-1">Assinaturas Ativas</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--sa-info))]">{subStats?.activeSubscriptions ?? 0}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-[hsl(var(--sa-accent))] via-[hsl(var(--sa-info))] to-[hsl(var(--sa-success))]" />
          </SaCard>

          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction icon={Building2} label="Nova Loja" href="/super-admin/stores" />
            <QuickAction icon={Users} label="Usuários" href="/super-admin/users" />
            <QuickAction icon={CreditCard} label="Assinaturas" href="/super-admin/subscriptions" />
            <QuickAction icon={Mail} label="E-mails" href="/super-admin/emails" />
          </motion.div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <SaCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Atividade Recente</h3>
              <motion.a href="/super-admin/activity" className="text-[11px] font-medium text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] flex items-center gap-1" whileHover={{ x: 2 }}>
                Ver tudo <ArrowUpRight className="h-3 w-3" />
              </motion.a>
            </div>
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {recentActivity.length === 0 ? (
                <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-4 text-center">Nenhuma atividade recente</p>
              ) : (
                recentActivity.map((log) => {
                  const iconMap: Record<string, { icon: typeof Building2; color: string }> = {
                    CREATE: { icon: Building2, color: "bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]" },
                    UPDATE: { icon: Zap, color: "bg-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-info))]" },
                    DELETE: { icon: ShoppingCart, color: "bg-[hsl(var(--sa-danger-subtle))] text-[hsl(var(--sa-danger))]" },
                    LOGIN: { icon: Users, color: "bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]" },
                  };
                  const { icon: Icon, color } = iconMap[log.actionType] ?? iconMap.UPDATE;
                  return (
                    <ActivityItem
                      key={log.id}
                      icon={Icon}
                      title={log.description}
                      time={formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ptBR })}
                      color={color}
                    />
                  );
                })
              )}
            </motion.div>
          </SaCard>
        </motion.div>
      </div>

      {/* ── Top Stores + Subscription Health ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <SaCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Top Lojas por Receita</h3>
              <motion.a href="/super-admin/stores" className="text-[11px] font-medium text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] flex items-center gap-1" whileHover={{ x: 2 }}>
                Ver todas <ArrowUpRight className="h-3 w-3" />
              </motion.a>
            </div>
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {topStores.length === 0 ? (
                <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-4 text-center">Nenhuma loja cadastrada</p>
              ) : (
                topStores.map((store, i) => (
                  <TopStoreRow
                    key={store.id}
                    rank={i + 1}
                    name={store.name}
                    revenue={`R$ ${(store.paidRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    orders={store.ordersCount}
                    status={store.status}
                  />
                ))
              )}
            </motion.div>
          </SaCard>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <SaCard>
            <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Saúde das Assinaturas</h3>
            <div className="space-y-4">
              <HealthBar label="Assinaturas Ativas" value={subStats?.activeSubscriptions ?? 0} suffix="" color="success" />
              <HealthBar label="Em Trial" value={subStats?.trialSubscriptions ?? 0} suffix="" color="info" />
              <HealthBar label="Canceladas" value={subStats?.cancelledSubscriptions ?? 0} suffix="" color="danger" />
              <HealthBar label="Churn Rate" value={Number((subStats?.churnRate ?? 0).toFixed(1))} suffix="%" color={subStats && subStats.churnRate < 5 ? "success" : "warning"} />
              <HealthBar label="LTV Médio" value={subStats?.avgLifetimeValue ?? 0} suffix="" color="info" />
            </div>
          </SaCard>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Health bar mini-component ── */
function HealthBar({ label, value, suffix = "%", color }: { label: string; value: number; suffix?: string; color: string }) {
  const barColor: Record<string, string> = {
    success: "bg-[hsl(var(--sa-success))]",
    warning: "bg-[hsl(var(--sa-warning))]",
    danger: "bg-[hsl(var(--sa-danger))]",
    info: "bg-[hsl(var(--sa-info))]",
  };
  const pct = suffix === "ms" ? Math.min(value / 500 * 100, 100) : value;

  return (
    <motion.div variants={fadeInUp} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[hsl(var(--sa-text-secondary))]">{label}</span>
        <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{value}{suffix}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
        <motion.div
          className={`h-full rounded-full ${barColor[color] ?? barColor.info}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
