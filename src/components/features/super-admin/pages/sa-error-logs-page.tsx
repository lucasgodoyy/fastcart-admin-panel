"use client";

import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { superAdminService } from "@/services/super-admin";
import type { PlatformErrorLog, ErrorLogStats } from "@/types/super-admin";

const SEVERITY_MAP: Record<string, { label: string; color: string }> = {
  ERROR: { label: "ERROR", color: "danger" },
  WARN: { label: "WARN", color: "warning" },
};

export function SaErrorLogsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");
  const [resolved, setResolved] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: stats } = useQuery<ErrorLogStats>({
    queryKey: ["sa-error-log-stats"],
    queryFn: () => superAdminService.getErrorLogStats(),
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ["sa-error-logs", page, severity, resolved, search],
    queryFn: () =>
      superAdminService.listErrorLogs({
        severity: severity !== "all" ? severity : undefined,
        resolved: resolved !== "all" ? resolved === "true" : undefined,
        search: search || undefined,
        page,
        size: 20,
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => superAdminService.resolveErrorLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-error-logs"] });
      queryClient.invalidateQueries({ queryKey: ["sa-error-log-stats"] });
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <SaPageHeader
        title="Logs de Erro"
        description="Monitoramento de erros da plataforma em tempo real"
      />

      {/* Stats cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeInUp}>
          <SaStatCard
            title="Total de Erros"
            value={stats?.totalErrors ?? 0}
            icon={Bug}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <SaStatCard
            title="Não Resolvidos"
            value={stats?.unresolvedErrors ?? 0}
            icon={AlertTriangle}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <SaStatCard
            title="Últimas 24h"
            value={stats?.errorsLast24h ?? 0}
            icon={Clock}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <SaStatCard
            title="Críticos (24h)"
            value={stats?.criticalUnresolved ?? 0}
            icon={ShieldAlert}
          />
        </motion.div>
      </motion.div>

      {/* Filters */}
      <SaCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
            <Input
              placeholder="Buscar por mensagem, tipo ou path..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9 border-[hsl(var(--sa-border))] bg-[hsl(var(--sa-bg))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
            />
          </div>
          <Select
            value={severity}
            onValueChange={(v) => {
              setSeverity(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
              <SelectItem value="WARN">WARN</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={resolved}
            onValueChange={(v) => {
              setResolved(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="false">Não resolvidos</SelectItem>
              <SelectItem value="true">Resolvidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SaCard>

      {/* Error logs list */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        {isLoading ? (
          <SaCard className="p-8 text-center text-[hsl(var(--sa-text-muted))]">
            Carregando...
          </SaCard>
        ) : !logs?.content?.length ? (
          <SaEmptyState
            icon={CheckCircle2}
            title="Nenhum erro encontrado"
            description="A plataforma está funcionando sem erros registrados."
          />
        ) : (
          logs.content.map((log: PlatformErrorLog) => (
            <motion.div key={log.id} variants={fadeInUp}>
              <SaCard className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SaStatusBadge
                        status={log.severity}
                        map={SEVERITY_MAP}
                      />
                      <span className="text-xs font-mono text-[hsl(var(--sa-text-muted))]">
                        {log.errorType}
                      </span>
                      {log.resolved && (
                        <span className="text-xs text-[hsl(var(--sa-success))] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Resolvido
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate text-[hsl(var(--sa-text))]">{log.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[hsl(var(--sa-text-muted))]">
                      {log.requestMethod && (
                        <span className="font-mono">
                          {log.requestMethod} {log.requestPath}
                        </span>
                      )}
                      <span>{formatDate(log.createdAt)}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!log.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveMutation.mutate(log.id)}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId(expandedId === log.id ? null : log.id)
                      }
                    >
                      {expandedId === log.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {expandedId === log.id && log.stackTrace && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--sa-border-subtle))]">
                    <pre className="text-xs font-mono bg-[hsl(var(--sa-bg-secondary))] text-[hsl(var(--sa-text-secondary))] p-3 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                      {log.stackTrace}
                    </pre>
                    {log.notes && (
                      <p className="mt-2 text-sm text-[hsl(var(--sa-text-muted))]">
                        <strong>Notas:</strong> {log.notes}
                      </p>
                    )}
                  </div>
                )}
              </SaCard>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {logs && logs.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[hsl(var(--sa-text-muted))]">
            Página {page + 1} de {logs.totalPages} ({logs.totalElements} erros)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={logs.first}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={logs.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
