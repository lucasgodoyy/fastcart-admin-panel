"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Download,
  Calendar,
  Building2,
  AlertTriangle,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { superAdminService } from "@/services/super-admin";
import type { SubscriptionStats } from "@/types/super-admin";

const fmtMoney = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

// NOTE: Transaction and payout data requires Stripe integration.
// These tables will be wired once STRIPE_SECRET_KEY is configured.

const txnStatusMap: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: "Concluído", color: "success" },
  PENDING: { label: "Pendente", color: "warning" },
  REFUNDED: { label: "Reembolsado", color: "danger" },
  PAID: { label: "Pago", color: "success" },
  PROCESSING: { label: "Processando", color: "info" },
  SCHEDULED: { label: "Agendado", color: "accent" },
};

export function SaFinancePage() {
  const [tab, setTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const mrr = stats?.mrr ?? 0;
  const arr = mrr * 12;

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Financeiro"
        description="Gestão financeira da plataforma: transações, repasses e taxas"
        actions={
          <Button className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] rounded-xl gap-2 text-[12px]">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="MRR (Assinaturas)" value={fmtMoney(mrr)} icon={DollarSign} color="success" trend={{ value: 0, label: "" }} subtitle="Recorrente" />
        <SaStatCard title="ARR Projetado" value={fmtMoney(arr)} icon={Receipt} color="accent" />
        <SaStatCard title="Assinaturas Ativas" value={String(stats?.activeSubscriptions ?? 0)} icon={Banknote} color="warning" />
        <SaStatCard title="Cancelamentos" value={String(stats?.cancelledSubscriptions ?? 0)} icon={CreditCard} color="danger" subtitle={`Churn ${(stats?.churnRate ?? 0).toFixed(1)}%`} />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Transações
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Repasses
          </TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Taxas
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Fluxo de Caixa (Assinaturas)</h3>
              <div className="space-y-4">
                {[
                  { label: "MRR (Recorrente)", value: fmtMoney(mrr), color: "sa-success" },
                  { label: "ARR Projetado", value: fmtMoney(arr), color: "sa-accent" },
                  { label: "Assinaturas Ativas", value: String(stats?.activeSubscriptions ?? 0), color: "sa-info" },
                  { label: "Em Trial", value: String(stats?.trialSubscriptions ?? 0), color: "sa-warning" },
                  { label: "Canceladas", value: String(stats?.cancelledSubscriptions ?? 0), color: "sa-danger" },
                ].map(item => (
                  <motion.div key={item.label} variants={fadeInUp} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{item.label}</span>
                    <span className={`text-[14px] font-bold text-[hsl(var(--${item.color}))]`}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Transações de Vendas (Stripe)</h3>
              <div className="flex items-center gap-3 py-8 justify-center text-center">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--sa-warning))]" />
                <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">Integração Stripe não configurada. Configure STRIPE_SECRET_KEY para ver dados de GMV e transações.</p>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard>
              <div className="flex items-center gap-3 py-12 justify-center text-center flex-col">
                <AlertTriangle className="h-8 w-8 text-[hsl(var(--sa-warning))]" />
                <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Integração Stripe Necessária</h3>
                <p className="text-[12px] text-[hsl(var(--sa-text-muted))] max-w-md">As transações de vendas e pagamentos serão exibidas aqui após configurar a integração com Stripe Connect.</p>
                <Button className="mt-2 bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl">Configurar Stripe</Button>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* Payouts */}
        <TabsContent value="payouts" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard>
              <div className="flex items-center gap-3 py-12 justify-center text-center flex-col">
                <AlertTriangle className="h-8 w-8 text-[hsl(var(--sa-warning))]" />
                <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Repasses Stripe Connect</h3>
                <p className="text-[12px] text-[hsl(var(--sa-text-muted))] max-w-md">O histórico de repasses às lojas será exibido aqui após configurar o Stripe Connect para split payments.</p>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* Fees */}
        <TabsContent value="fees" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Estrutura de Taxas</h3>
              <div className="space-y-3">
                {[
                  { label: "Taxa por Transação", value: "5.0%", desc: "Sobre o valor bruto de cada venda" },
                  { label: "Taxa de Processamento", value: "2.49% + R$ 0,39", desc: "Gateway de pagamento (Stripe)" },
                  { label: "Taxa de Saque", value: "R$ 3,67", desc: "Por transferência bancária" },
                  { label: "Taxa de Marketplace", value: "3.5%", desc: "Comissão adicional para marketplace" },
                ].map(fee => (
                  <motion.div key={fee.label} variants={fadeInUp} className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{fee.label}</span>
                      <span className="text-[13px] font-bold text-[hsl(var(--sa-accent))]">{fee.value}</span>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{fee.desc}</p>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Receita de Assinaturas (Mês)</h3>
              <div className="space-y-3">
                {[
                  { label: "MRR (Recorrente)", value: fmtMoney(mrr), pct: 100 },
                  { label: "ARR Projetado", value: fmtMoney(arr), pct: 100 },
                  { label: "Assinaturas Ativas", value: String(stats?.activeSubscriptions ?? 0), pct: stats ? (stats.activeSubscriptions / Math.max(stats.totalSubscriptions, 1)) * 100 : 0 },
                ].map((item, i) => (
                  <motion.div key={item.label} variants={fadeInUp}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{item.label}</span>
                      <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))]"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
