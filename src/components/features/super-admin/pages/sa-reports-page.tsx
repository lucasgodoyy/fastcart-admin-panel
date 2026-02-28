"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Download,
  CalendarRange,
  TrendingUp,
  BarChart3,
  Building2,
  Users,
  CreditCard,
  ArrowDownToLine,
} from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, staggerContainer, fadeInUp } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabFromPath } from "../hooks/use-tab-from-path";

const reportTabRoutes: Record<string, string> = {
  revenue: "",
  growth: "growth",
  export: "export",
};

export function SaReportsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/reports", reportTabRoutes, "revenue");

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Relatórios"
        description="Exportações e relatórios executivos da plataforma"
        actions={
          <Button className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2 text-[12px]">
            <Download className="h-4 w-4" /> Exportar Tudo
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SaStatCard title="Relatórios Gerados" value="184" icon={FileText} color="accent" />
        <SaStatCard title="Exportações (CSV)" value="96" icon={Download} color="info" />
        <SaStatCard title="Período Atual" value="30 dias" icon={CalendarRange} color="success" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="revenue" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Receita
          </TabsTrigger>
          <TabsTrigger value="growth" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Crescimento
          </TabsTrigger>
          <TabsTrigger value="export" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Exportar
          </TabsTrigger>
        </TabsList>

        {/* Revenue */}
        <TabsContent value="revenue" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "Receita por período", icon: BarChart3, desc: "Análise detalhada de receita mensal e trimestral" },
                { name: "Churn de assinaturas", icon: CreditCard, desc: "Taxa de cancelamento e retenção por plano" },
                { name: "Receita por loja", icon: Building2, desc: "Top lojas e distribuição de receita" },
                { name: "Performance de afiliados", icon: Users, desc: "ROI e conversões por canal de afiliado" },
              ].map((report) => (
                <motion.div key={report.name} variants={fadeInUp}>
                  <SaCard className="hover:border-[hsl(var(--sa-accent))]/30 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sa-accent-subtle))]">
                        <report.icon className="h-5 w-5 text-[hsl(var(--sa-accent))]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{report.name}</span>
                          <Button size="sm" className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface))]">
                            <Download className="h-3 w-3 mr-1" /> CSV
                          </Button>
                        </div>
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{report.desc}</p>
                      </div>
                    </div>
                  </SaCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Growth */}
        <TabsContent value="growth" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div variants={fadeInUp}>
                <SaStatCard title="Novas Lojas (mês)" value="34" icon={Building2} color="accent" trend={{ value: 18, label: "vs mês anterior" }} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <SaStatCard title="Novos Usuários (mês)" value="1.2K" icon={Users} color="info" trend={{ value: 12, label: "vs mês anterior" }} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <SaStatCard title="Taxa de Conversão" value="4.2%" icon={TrendingUp} color="success" trend={{ value: 0.8, label: "vs mês anterior" }} />
              </motion.div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "Crescimento de lojas", desc: "Cadastros, ativações e churn de lojas mês a mês" },
                { name: "Crescimento de usuários", desc: "Registros, ativações e retenção de usuários" },
                { name: "GMV mensal", desc: "Volume bruto de mercadorias processado" },
                { name: "Conversão de trial → pago", desc: "Funil de conversão de planos gratuitos" },
              ].map((report) => (
                <motion.div key={report.name} variants={fadeInUp}>
                  <SaCard>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{report.name}</span>
                      <Button size="sm" className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface))]">
                        <Download className="h-3 w-3 mr-1" /> CSV
                      </Button>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{report.desc}</p>
                  </SaCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            <SaCard>
              <h4 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Exportar Dados</h4>
              <div className="space-y-3">
                {[
                  { name: "Lojas", desc: "Lista completa de lojas com status, plano e métricas" },
                  { name: "Usuários", desc: "Todos os usuários da plataforma com roles e atividade" },
                  { name: "Transações", desc: "Histórico completo de transações financeiras" },
                  { name: "Assinaturas", desc: "Detalhes de todos os assinantes e faturamento" },
                  { name: "E-mails", desc: "Log de todos os e-mails enviados com status de entrega" },
                  { name: "Atividades", desc: "Registro completo de atividades da plataforma" },
                ].map((item) => (
                  <motion.div key={item.name} variants={fadeInUp} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div>
                      <p className="text-[13px] font-medium text-[hsl(var(--sa-text))]">{item.name}</p>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{item.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))] hover:text-white">
                        <ArrowDownToLine className="h-3 w-3 mr-1" /> CSV
                      </Button>
                      <Button size="sm" className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface))]">
                        JSON
                      </Button>
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
