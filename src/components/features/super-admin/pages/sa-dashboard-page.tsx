"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";

/* ── fake sparkline (pure CSS) ── */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
          className={`w-[3px] rounded-full ${color} opacity-80`}
        />
      ))}
    </div>
  );
}

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

  const val = (n?: number) => (isLoading ? "—" : (n ?? 0).toLocaleString("pt-BR"));

  /* mock sparkline data */
  const spark1 = [4, 5, 8, 6, 9, 12, 10, 14, 11, 16, 13, 18];
  const spark2 = [2, 3, 5, 4, 7, 6, 9, 8, 10, 12, 11, 14];

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
                  <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Receita da Plataforma</h3>
                  <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">Resumo dos últimos 30 dias</p>
                </div>
                <motion.div className="flex items-center gap-1 text-[hsl(var(--sa-success))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[13px] font-bold">+23%</span>
                </motion.div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] mb-1">GMV Total</p>
                  <p className="text-[24px] font-bold sa-gradient-text">R$ 847K</p>
                  <MiniSparkline data={spark1} color="bg-[hsl(var(--sa-accent))]" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] mb-1">Taxa Plataforma</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--sa-success))]">R$ 42K</p>
                  <MiniSparkline data={spark2} color="bg-[hsl(var(--sa-success))]" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] mb-1">Pedidos</p>
                  <p className="text-[24px] font-bold text-[hsl(var(--sa-info))]">3.2K</p>
                  <MiniSparkline data={[6, 8, 5, 10, 7, 12, 9, 14, 11, 15, 13, 17]} color="bg-[hsl(var(--sa-info))]" />
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
              <ActivityItem icon={Building2} title="Nova loja cadastrada: Fashion Store" time="Há 12 minutos" color="bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]" />
              <ActivityItem icon={Users} title="Novo usuário registrado: maria@email.com" time="Há 28 minutos" color="bg-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-info))]" />
              <ActivityItem icon={CreditCard} title="Assinatura upgrade: Plano Pro" time="Há 1 hora" color="bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]" />
              <ActivityItem icon={ShoppingCart} title="1.247 pedidos processados hoje" time="Há 2 horas" color="bg-[hsl(var(--sa-warning-subtle))] text-[hsl(var(--sa-warning))]" />
              <ActivityItem icon={Mail} title="Campanha de e-mail enviada: 5K destinatários" time="Há 3 horas" color="bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]" />
              <ActivityItem icon={Zap} title="Deploy v2.14.0 realizado com sucesso" time="Há 5 horas" color="bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]" />
            </motion.div>
          </SaCard>
        </motion.div>
      </div>

      {/* ── Top Stores + Platform Health ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <SaCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Top Lojas por Receita</h3>
              <motion.a href="/super-admin/stores/performance" className="text-[11px] font-medium text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] flex items-center gap-1" whileHover={{ x: 2 }}>
                Ver ranking <ArrowUpRight className="h-3 w-3" />
              </motion.a>
            </div>
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <TopStoreRow rank={1} name="Fashion Store Oficial" revenue="R$ 124.580" orders={892} status="ACTIVE" />
              <TopStoreRow rank={2} name="TechGadgets Pro" revenue="R$ 98.450" orders={654} status="ACTIVE" />
              <TopStoreRow rank={3} name="Casa & Decor Market" revenue="R$ 76.320" orders={523} status="ACTIVE" />
              <TopStoreRow rank={4} name="SportLife Brasil" revenue="R$ 54.100" orders={412} status="TRIAL" />
              <TopStoreRow rank={5} name="Beleza Natural" revenue="R$ 43.890" orders={367} status="ACTIVE" />
            </motion.div>
          </SaCard>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <SaCard>
            <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Saúde da Plataforma</h3>
            <div className="space-y-4">
              <HealthBar label="API Uptime" value={99.97} color="success" />
              <HealthBar label="Tempo Médio de Resposta" value={94} suffix="ms" color="success" />
              <HealthBar label="Entrega de E-mails" value={98.2} color="success" />
              <HealthBar label="Uso de CPU" value={34} color="info" />
              <HealthBar label="Uso de Memória" value={62} color="warning" />
              <HealthBar label="Armazenamento" value={48} color="info" />
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
