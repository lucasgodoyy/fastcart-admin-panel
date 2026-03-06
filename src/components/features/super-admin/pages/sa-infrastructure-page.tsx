"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Server, Database, Cpu, HardDrive, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, SaSkeleton, staggerContainer, fadeInUp } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import superAdminService from "@/services/super-admin/superAdminService";
import apiClient from "@/lib/api";

interface HealthCheck {
  service: string;
  status: "operational" | "degraded" | "down";
  latency: number | null;
  lastChecked: Date;
}

async function checkEndpoint(name: string, url: string): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await apiClient.get(url, { timeout: 5000 });
    return { service: name, status: "operational", latency: Date.now() - start, lastChecked: new Date() };
  } catch (err: any) {
    if (err?.response) {
      // Got a response (even if error), so service is reachable
      return { service: name, status: "operational", latency: Date.now() - start, lastChecked: new Date() };
    }
    return { service: name, status: "down", latency: null, lastChecked: new Date() };
  }
}

export function SaInfrastructurePage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [checking, setChecking] = useState(false);

  const { data: overview, isLoading } = useQuery({
    queryKey: ["sa-overview"],
    queryFn: superAdminService.getOverview,
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const runHealthChecks = async () => {
    setChecking(true);
    const checks = await Promise.all([
      checkEndpoint("Backend API", "/super-admin/overview"),
      checkEndpoint("Auth Service", "/auth/me"),
      checkEndpoint("Store Service", "/super-admin/stores?size=1"),
      checkEndpoint("Email Service", "/super-admin/emails/logs?size=1"),
      checkEndpoint("Support Service", "/super-admin/support/tickets?size=1"),
      checkEndpoint("Subscription Service", "/super-admin/subscriptions/stats"),
    ]);
    setHealthChecks(checks);
    setChecking(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const operationalCount = healthChecks.filter(h => h.status === "operational").length;
  const totalChecks = healthChecks.length;
  const avgLatency = healthChecks.filter(h => h.latency !== null).reduce((sum, h) => sum + (h.latency || 0), 0) / Math.max(1, healthChecks.filter(h => h.latency !== null).length);
  const uptimePercent = totalChecks > 0 ? ((operationalCount / totalChecks) * 100).toFixed(1) : "—";

  const statusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle2 className="h-4 w-4 text-[hsl(var(--sa-success))]" />;
      case "degraded": return <Clock className="h-4 w-4 text-[hsl(var(--sa-warning))]" />;
      case "down": return <XCircle className="h-4 w-4 text-[hsl(var(--sa-danger))]" />;
      default: return null;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "operational": return "Operacional";
      case "degraded": return "Degradado";
      case "down": return "Indisponível";
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-[hsl(var(--sa-success))]";
      case "degraded": return "text-[hsl(var(--sa-warning))]";
      case "down": return "text-[hsl(var(--sa-danger))]";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="Infraestrutura" description="Saúde dos serviços e capacidade operacional" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SaSkeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Infraestrutura"
        description="Saúde dos serviços e capacidade operacional — dados em tempo real"
        actions={
          <Button
            onClick={runHealthChecks}
            disabled={checking}
            className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2 text-[12px]"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Verificar
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Uptime" value={`${uptimePercent}%`} icon={Server} color={operationalCount === totalChecks ? "success" : "warning"} />
        <SaStatCard title="Latência Média" value={`${Math.round(avgLatency)}ms`} icon={Database} color={avgLatency < 500 ? "info" : "warning"} />
        <SaStatCard title="Serviços" value={`${operationalCount}/${totalChecks}`} icon={Cpu} color={operationalCount === totalChecks ? "success" : "danger"} subtitle="operacionais" />
        <SaStatCard title="E-mails" value={`${overview?.totalEmailLogs ?? 0}`} icon={HardDrive} color="accent" subtitle={`${overview?.failedEmailLogs ?? 0} falhas`} />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Status dos Serviços</h3>
            {checking && <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--sa-text-muted))]" />}
          </div>
          <div className="space-y-3">
            {healthChecks.length === 0 ? (
              <div className="text-center py-8 text-[12px] text-[hsl(var(--sa-text-muted))]">
                Executando verificações...
              </div>
            ) : (
              healthChecks.map((check) => (
                <div key={check.service} className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {statusIcon(check.status)}
                    <span className="text-[12px] font-medium text-[hsl(var(--sa-text-secondary))]">{check.service}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {check.latency !== null && (
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{check.latency}ms</span>
                    )}
                    <span className={`text-[11px] font-semibold ${statusColor(check.status)}`}>
                      {statusLabel(check.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Métricas da Plataforma</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Lojas Total", value: overview?.totalStores ?? 0 },
              { label: "Lojas Ativas", value: overview?.activeStores ?? 0 },
              { label: "Usuários Total", value: overview?.totalUsers ?? 0 },
              { label: "Usuários Ativos", value: overview?.activeUsers ?? 0 },
              { label: "Tickets Suporte", value: overview?.totalSupportTickets ?? 0 },
              { label: "Tickets Abertos", value: overview?.openSupportTickets ?? 0 },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-[hsl(var(--sa-border-subtle))] p-3 text-center">
                <p className="text-[20px] font-bold text-[hsl(var(--sa-text))]">{metric.value.toLocaleString("pt-BR")}</p>
                <p className="text-[10px] text-[hsl(var(--sa-text-muted))] mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </SaCard>
      </motion.div>
    </div>
  );
}
