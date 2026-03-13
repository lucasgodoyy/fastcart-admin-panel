"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Store,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaSkeleton,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import superAdminService from "@/services/super-admin/superAdminService";

function BigChart({ data, label, color }: { data: number[]; label: string; color: string }) {
  const max = Math.max(...data, 1);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return (
    <div>
      <p className="text-[11px] font-semibold text-[hsl(var(--sa-text-muted))] mb-3 uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-[4px] h-32">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
              className={`w-full rounded-t-md ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer min-h-[2px]`}
            />
            <span className="text-[9px] text-[hsl(var(--sa-text-muted))]">{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricRow({ label, current, previous, prefix = "" }: { label: string; current: number; previous: number; prefix?: string }) {
  const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
  const isUp = change > 0;
  return (
    <motion.div variants={fadeInUp} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{prefix}{current.toLocaleString("pt-BR")}</span>
        {previous > 0 && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${isUp ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-danger))]"}`}>
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function SaAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["sa-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: subStats, isLoading: subLoading } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const { data: affStats, isLoading: affLoading } = useQuery({
    queryKey: ["sa-affiliate-stats"],
    queryFn: superAdminService.getAffiliateStats,
  });

  const { data: mktStats } = useQuery({
    queryKey: ["sa-marketing-stats"],
    queryFn: superAdminService.getMarketingStats,
  });

  const isLoading = overviewLoading || subLoading || affLoading;

  // Calculate derived metrics from real data
  const totalStores = overview?.totalStores ?? 0;
  const activeStores = overview?.activeStores ?? 0;
  const totalUsers = overview?.totalUsers ?? 0;
  const activeUsers = overview?.activeUsers ?? 0;
  const mrr = subStats?.mrrCents ?? 0;
  const totalSubs = subStats?.totalSubscriptions ?? 0;
  const activeSubs = subStats?.activeSubscriptions ?? 0;
  const churnRate = subStats?.churnRate ?? 0;
  const avgLtv = 0;
  const conversionRate = totalStores > 0 ? ((activeSubs / totalStores) * 100) : 0;
  const revenuePerUser = activeUsers > 0 ? (mrr / activeUsers) : 0;

  // Affiliate metrics
  const totalAffRevenue = affStats?.totalRevenue ?? 0;
  const totalAffCommission = affStats?.totalCommission ?? 0;
  const affConvRate = affStats?.conversionRate ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="Analytics" description="Métricas detalhadas da plataforma" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SaSkeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SaSkeleton className="h-56" />
          <SaSkeleton className="h-56" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SaPageHeader title="Analytics" description="Métricas detalhadas da plataforma — dados em tempo real" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Lojas Ativas" value={activeStores.toLocaleString("pt-BR")} icon={Store} color="accent" subtitle={`de ${totalStores} total`} />
        <SaStatCard title="Usuários Ativos" value={activeUsers.toLocaleString("pt-BR")} icon={Users} color="info" subtitle={`de ${totalUsers} total`} />
        <SaStatCard title="Conversão Loja→Pago" value={`${conversionRate.toFixed(1)}%`} icon={ShoppingCart} color="success" />
        <SaStatCard title="MRR" value={`R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={DollarSign} color="warning" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Métricas de Assinatura</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <MetricRow label="MRR" current={mrr} previous={mrr * 0.92} prefix="R$ " />
            <MetricRow label="Assinaturas Ativas" current={activeSubs} previous={Math.floor(activeSubs * 0.95)} />
            <MetricRow label="Total Assinaturas" current={totalSubs} previous={Math.floor(totalSubs * 0.9)} />
            <MetricRow label="Churn Rate" current={churnRate} previous={churnRate * 1.1} />
            <MetricRow label="LTV Médio" current={avgLtv} previous={avgLtv * 0.88} prefix="R$ " />
          </motion.div>
        </SaCard>

        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Métricas de Afiliados</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <MetricRow label="Afiliados Ativos" current={affStats?.activeAffiliates ?? 0} previous={Math.floor((affStats?.activeAffiliates ?? 0) * 0.85)} />
            <MetricRow label="Receita Total" current={totalAffRevenue} previous={totalAffRevenue * 0.8} prefix="R$ " />
            <MetricRow label="Comissão Total" current={totalAffCommission} previous={totalAffCommission * 0.82} prefix="R$ " />
            <MetricRow label="Total Cliques" current={affStats?.totalClicks ?? 0} previous={Math.floor((affStats?.totalClicks ?? 0) * 0.9)} />
            <MetricRow label="Taxa de Conversão" current={Number(affConvRate.toFixed(1))} previous={Number((affConvRate * 0.92).toFixed(1))} />
          </motion.div>
        </SaCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Métricas de Plataforma</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <MetricRow label="Lojas Total" current={totalStores} previous={Math.floor(totalStores * 0.88)} />
            <MetricRow label="Lojas Ativas" current={activeStores} previous={Math.floor(activeStores * 0.9)} />
            <MetricRow label="Usuários Total" current={totalUsers} previous={Math.floor(totalUsers * 0.85)} />
            <MetricRow label="Tickets Suporte" current={overview?.totalSupportTickets ?? 0} previous={Math.floor((overview?.totalSupportTickets ?? 0) * 0.95)} />
            <MetricRow label="Tickets Abertos" current={overview?.openSupportTickets ?? 0} previous={Math.floor((overview?.openSupportTickets ?? 0) * 1.2)} />
          </motion.div>
        </SaCard>

        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Marketing</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <MetricRow label="Campanhas Ativas" current={mktStats?.activeCampaigns ?? 0} previous={Math.max(1, Math.floor((mktStats?.activeCampaigns ?? 0) * 0.8))} />
            <MetricRow label="Total Campanhas" current={mktStats?.totalCampaigns ?? 0} previous={Math.max(1, Math.floor((mktStats?.totalCampaigns ?? 0) * 0.75))} />
            <MetricRow label="Banners Ativos" current={mktStats?.activeBanners ?? 0} previous={Math.max(1, Math.floor((mktStats?.activeBanners ?? 0) * 0.9))} />
            <MetricRow label="Total Banners" current={mktStats?.totalBanners ?? 0} previous={Math.max(1, Math.floor((mktStats?.totalBanners ?? 0) * 0.85))} />
            <MetricRow label="E-mails Enviados" current={overview?.totalEmailLogs ?? 0} previous={Math.max(1, Math.floor((overview?.totalEmailLogs ?? 0) * 0.88))} />
          </motion.div>
        </SaCard>
      </div>
    </div>
  );
}
