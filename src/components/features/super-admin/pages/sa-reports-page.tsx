"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  Loader2,
  Store,
  Mail,
  Activity,
  DollarSign,
} from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, SaSkeleton, staggerContainer, fadeInUp } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import superAdminService from "@/services/super-admin/superAdminService";
import { toast } from "sonner";

const reportTabRoutes: Record<string, string> = {
  revenue: "",
  growth: "growth",
  export: "export",
};

// Helper to export data as CSV
function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    toast.error("Nenhum dado para exportar.");
    return;
  }
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename}.csv exportado com sucesso!`);
}

function downloadJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename}.json exportado com sucesso!`);
}

export function SaReportsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/reports", reportTabRoutes, "revenue");
  const [exportingKey, setExportingKey] = useState<string | null>(null);

  const { data: overview } = useQuery({
    queryKey: ["sa-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: subStats } = useQuery({
    queryKey: ["sa-subscription-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const { data: affStats } = useQuery({
    queryKey: ["sa-affiliate-stats"],
    queryFn: superAdminService.getAffiliateStats,
  });

  // Export functions that fetch real data
  const exportStores = async (format: "csv" | "json") => {
    setExportingKey("stores");
    try {
      const result = await superAdminService.listStores({ size: 9999 });
      if (format === "csv") downloadCSV(result.content as any[], "lojas");
      else downloadJSON(result.content, "lojas");
    } catch { toast.error("Erro ao exportar lojas."); }
    setExportingKey(null);
  };

  const exportUsers = async (format: "csv" | "json") => {
    setExportingKey("users");
    try {
      const result = await superAdminService.listUsers({ size: 9999 });
      if (format === "csv") downloadCSV(result.content as any[], "usuarios");
      else downloadJSON(result.content, "usuarios");
    } catch { toast.error("Erro ao exportar usuários."); }
    setExportingKey(null);
  };

  const exportSubscriptions = async (format: "csv" | "json") => {
    setExportingKey("subs");
    try {
      const result = await superAdminService.listSubscriptions({ size: 9999 });
      if (format === "csv") downloadCSV(result.content as any[], "assinaturas");
      else downloadJSON(result.content, "assinaturas");
    } catch { toast.error("Erro ao exportar assinaturas."); }
    setExportingKey(null);
  };

  const exportEmails = async (format: "csv" | "json") => {
    setExportingKey("emails");
    try {
      const result = await superAdminService.listEmailLogs({ size: 9999 });
      if (format === "csv") downloadCSV(result.content as any[], "emails");
      else downloadJSON(result.content, "emails");
    } catch { toast.error("Erro ao exportar e-mails."); }
    setExportingKey(null);
  };

  const exportActivity = async (format: "csv" | "json") => {
    setExportingKey("activity");
    try {
      const result = await superAdminService.listActivityLogs({ size: 9999 });
      if (format === "csv") downloadCSV(result.content as any[], "atividades");
      else downloadJSON(result.content, "atividades");
    } catch { toast.error("Erro ao exportar atividades."); }
    setExportingKey(null);
  };

  const exportAffiliates = async (format: "csv" | "json") => {
    setExportingKey("affiliates");
    try {
      const result = await superAdminService.listAffiliates({ size: 9999 });
      if (format === "csv") downloadCSV(result.content as any[], "afiliados");
      else downloadJSON(result.content, "afiliados");
    } catch { toast.error("Erro ao exportar afiliados."); }
    setExportingKey(null);
  };

  const exportAll = async () => {
    setExportingKey("all");
    try {
      await Promise.all([
        exportStores("csv"),
        exportUsers("csv"),
        exportSubscriptions("csv"),
        exportEmails("csv"),
        exportActivity("csv"),
      ]);
    } catch { /* individual errors already handled */ }
    setExportingKey(null);
  };

  const totalStores = overview?.totalStores ?? 0;
  const activeSubs = subStats?.activeSubscriptions ?? 0;
  const mrr = subStats?.mrrCents ?? 0;
  const churnRate = subStats?.churnRate ?? 0;

  const exportItems = [
    { key: "stores", name: "Lojas", desc: `${totalStores} lojas — status, plano e métricas`, icon: Building2, csvFn: () => exportStores("csv"), jsonFn: () => exportStores("json") },
    { key: "users", name: "Usuários", desc: `${overview?.totalUsers ?? 0} usuários — roles e atividade`, icon: Users, csvFn: () => exportUsers("csv"), jsonFn: () => exportUsers("json") },
    { key: "subs", name: "Assinaturas", desc: `${activeSubs} ativas — faturamento e planos`, icon: CreditCard, csvFn: () => exportSubscriptions("csv"), jsonFn: () => exportSubscriptions("json") },
    { key: "emails", name: "E-mails", desc: `${overview?.totalEmailLogs ?? 0} enviados — status de entrega`, icon: Mail, csvFn: () => exportEmails("csv"), jsonFn: () => exportEmails("json") },
    { key: "activity", name: "Atividades", desc: "Registro completo de atividades", icon: Activity, csvFn: () => exportActivity("csv"), jsonFn: () => exportActivity("json") },
    { key: "affiliates", name: "Afiliados", desc: `${affStats?.totalAffiliates ?? 0} afiliados — comissões e conversões`, icon: Users, csvFn: () => exportAffiliates("csv"), jsonFn: () => exportAffiliates("json") },
  ];

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Relatórios"
        description="Exportações e relatórios executivos da plataforma"
        actions={
          <Button
            onClick={exportAll}
            disabled={exportingKey === "all"}
            className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2 text-[12px]"
          >
            {exportingKey === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar Tudo
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Lojas" value={totalStores.toLocaleString("pt-BR")} icon={Store} color="accent" />
        <SaStatCard title="MRR" value={`R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon={DollarSign} color="info" />
        <SaStatCard title="Assinaturas Ativas" value={activeSubs.toLocaleString("pt-BR")} icon={CreditCard} color="success" />
        <SaStatCard title="Churn" value={`${churnRate.toFixed(1)}%`} icon={TrendingUp} color="warning" />
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
                { name: "Receita por loja", icon: Building2, desc: "Top lojas classificadas por receita total", exportFn: () => exportStores("csv") },
                { name: "Churn de assinaturas", icon: CreditCard, desc: `Taxa atual: ${churnRate.toFixed(1)}% — retenção por plano`, exportFn: () => exportSubscriptions("csv") },
                { name: "Performance de afiliados", icon: Users, desc: `${affStats?.totalAffiliates ?? 0} afiliados — ROI e conversões`, exportFn: () => exportAffiliates("csv") },
                { name: "Emails e entregas", icon: Mail, desc: `${overview?.totalEmailLogs ?? 0} enviados — ${overview?.failedEmailLogs ?? 0} falhas`, exportFn: () => exportEmails("csv") },
              ].map((report) => (
                <motion.div key={report.name} variants={fadeInUp}>
                  <SaCard className="hover:border-[hsl(var(--sa-accent))]/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sa-accent-subtle))]">
                        <report.icon className="h-5 w-5 text-[hsl(var(--sa-accent))]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{report.name}</span>
                          <Button
                            size="sm"
                            onClick={report.exportFn}
                            className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-accent))] hover:text-white"
                          >
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
                <SaStatCard title="Lojas Ativas" value={String(overview?.activeStores ?? 0)} icon={Building2} color="accent" subtitle={`de ${totalStores} total`} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <SaStatCard title="Usuários Ativos" value={String(overview?.activeUsers ?? 0)} icon={Users} color="info" subtitle={`de ${overview?.totalUsers ?? 0} total`} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <SaStatCard title="Assinaturas Trial" value={String(subStats?.trialSubscriptions ?? 0)} icon={TrendingUp} color="success" subtitle={`de ${subStats?.totalSubscriptions ?? 0} total`} />
              </motion.div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "Crescimento de lojas", desc: `${overview?.activeStores ?? 0} ativas de ${totalStores} cadastradas`, exportFn: () => exportStores("csv") },
                { name: "Crescimento de usuários", desc: `${overview?.activeUsers ?? 0} ativos de ${overview?.totalUsers ?? 0} registrados`, exportFn: () => exportUsers("csv") },
                { name: "Assinaturas", desc: `MRR: R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, exportFn: () => exportSubscriptions("csv") },
                { name: "Conversão trial → pago", desc: `${subStats?.trialSubscriptions ?? 0} em trial | ${subStats?.canceledSubscriptions ?? 0} cancelados`, exportFn: () => exportSubscriptions("csv") },
              ].map((report) => (
                <motion.div key={report.name} variants={fadeInUp}>
                  <SaCard>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{report.name}</span>
                      <Button
                        size="sm"
                        onClick={report.exportFn}
                        className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-accent))] hover:text-white"
                      >
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
                {exportItems.map((item) => (
                  <motion.div key={item.key} variants={fadeInUp} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
                      <div>
                        <p className="text-[13px] font-medium text-[hsl(var(--sa-text))]">{item.name}</p>
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={item.csvFn}
                        disabled={exportingKey === item.key}
                        className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))] hover:text-white"
                      >
                        {exportingKey === item.key ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ArrowDownToLine className="h-3 w-3 mr-1" />}
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        onClick={item.jsonFn}
                        disabled={exportingKey === item.key}
                        className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface))]"
                      >
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
