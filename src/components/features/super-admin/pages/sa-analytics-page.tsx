"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function BigChart({ data, label, color }: { data: number[]; label: string; color: string }) {
  const max = Math.max(...data);
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
  const change = ((current - previous) / previous * 100);
  const isUp = change > 0;
  return (
    <motion.div variants={fadeInUp} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{prefix}{current.toLocaleString("pt-BR")}</span>
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${isUp ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-danger))]"}`}>
          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    </motion.div>
  );
}

export function SaAnalyticsPage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Analytics" description="Métricas detalhadas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Pageviews" value="248K" icon={Eye} color="accent" trend={{ value: 18, label: "" }} />
        <SaStatCard title="Visitantes Únicos" value="67K" icon={Users} color="info" trend={{ value: 12, label: "" }} />
        <SaStatCard title="Taxa de Conversão" value="3.4%" icon={ShoppingCart} color="success" trend={{ value: 5, label: "" }} />
        <SaStatCard title="Receita/Visitante" value="R$ 12,60" icon={DollarSign} color="warning" trend={{ value: -2, label: "" }} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Receita Mensal</h3>
          <BigChart
            data={[32, 38, 42, 45, 52, 58, 54, 62, 68, 74, 78, 85]}
            label="Receita (R$ mil)"
            color="bg-[hsl(var(--sa-accent))]"
          />
        </SaCard>

        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Novos Usuários</h3>
          <BigChart
            data={[120, 145, 180, 210, 195, 240, 280, 310, 290, 340, 380, 420]}
            label="Cadastros"
            color="bg-[hsl(var(--sa-info))]"
          />
        </SaCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Métricas de Negócio</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <MetricRow label="GMV Total" current={847000} previous={689000} prefix="R$ " />
            <MetricRow label="Pedidos" current={3245} previous={2890} />
            <MetricRow label="Ticket Médio" current={261} previous={238} prefix="R$ " />
            <MetricRow label="Novas Lojas" current={23} previous={18} />
            <MetricRow label="Churn" current={4} previous={7} />
          </motion.div>
        </SaCard>

        <SaCard>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Top Países / Regiões</h3>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {[
              { country: "Brasil", flag: "🇧🇷", visits: 156000, pct: 92.4 },
              { country: "Portugal", flag: "🇵🇹", visits: 5400, pct: 3.2 },
              { country: "Estados Unidos", flag: "🇺🇸", visits: 3200, pct: 1.9 },
              { country: "Argentina", flag: "🇦🇷", visits: 2100, pct: 1.2 },
              { country: "Outros", flag: "🌍", visits: 2300, pct: 1.3 },
            ].map(item => (
              <motion.div key={item.country} variants={fadeInUp} className="flex items-center gap-3 py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                <span className="text-lg">{item.flag}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{item.country}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                    <motion.div
                      className="h-full rounded-full bg-[hsl(var(--sa-accent))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{item.visits.toLocaleString("pt-BR")}</p>
                  <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{item.pct}%</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </SaCard>
      </div>
    </div>
  );
}
