"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  User,
  Shield,
  Settings,
  Store,
  CreditCard,
  Trash2,
  Edit,
  LogIn,
  LogOut,
  AlertTriangle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  SaPageHeader,
  SaCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { superAdminService } from "@/services/super-admin";
import type { ActivityLog } from "@/types/super-admin";

const activityIcons: Record<string, React.ElementType> = {
  LOGIN: LogIn, LOGOUT: LogOut, CREATE: Edit, UPDATE: Settings,
  DELETE: Trash2, SECURITY: Shield, BILLING: CreditCard, STORE: Store,
  login: LogIn, logout: LogOut, create: Edit, update: Settings,
  delete: Trash2, security: Shield, billing: CreditCard, store: Store,
};

const activityColors: Record<string, string> = {
  LOGIN: "sa-success", LOGOUT: "sa-text-muted", CREATE: "sa-info", UPDATE: "sa-accent",
  DELETE: "sa-danger", SECURITY: "sa-warning", BILLING: "sa-success", STORE: "sa-info",
  login: "sa-success", logout: "sa-text-muted", create: "sa-info", update: "sa-accent",
  delete: "sa-danger", security: "sa-warning", billing: "sa-success", store: "sa-info",
};

const roleTagMap: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "accent" },
  ADMIN: { label: "Admin", color: "info" },
  STAFF: { label: "Staff", color: "warning" },
  SYSTEM: { label: "Sistema", color: "success" },
  STORE_OWNER: { label: "Lojista", color: "info" },
};

export function SaActivityPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data: logsData } = useQuery({
    queryKey: ["sa-activity", search, filter, page],
    queryFn: () => superAdminService.listActivityLogs({
      search: search || undefined,
      actionType: filter !== "all" ? filter : undefined,
      page,
      size: 20,
    }),
  });

  const activities = logsData?.content ?? [];

  const filters = [
    { key: "all", label: "Todos" },
    { key: "LOGIN", label: "Login" },
    { key: "CREATE", label: "Criação" },
    { key: "UPDATE", label: "Alteração" },
    { key: "DELETE", label: "Remoção" },
    { key: "SECURITY", label: "Segurança" },
    { key: "BILLING", label: "Financeiro" },
  ];

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Registro de Atividades"
        description="Log de todas as ações realizadas na plataforma"
      />

      {/* Filters */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
          <Input
            placeholder="Buscar atividade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] rounded-xl h-10 text-[12px]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.key}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
                filter === f.key
                  ? "bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30"
                  : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]"
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
        {activities.map((activity, i) => {
          const Icon = activityIcons[activity.actionType] || Activity;
          const color = activityColors[activity.actionType] || "sa-text-muted";
          const tag = roleTagMap[activity.userRole || ""];

          return (
            <motion.div
              key={activity.id}
              variants={fadeInUp}
              className="group flex items-start gap-4 p-4 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 hover:bg-[hsl(var(--sa-surface-hover))] transition-all backdrop-blur-sm"
            >
              <div className={`h-10 w-10 shrink-0 rounded-xl bg-[hsl(var(--${color}))]/10 flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-[hsl(var(--${color}))]`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">
                    {activity.userEmail || "Sistema"}
                  </span>
                  {tag && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[hsl(var(--sa-${tag.color}))]/10 text-[hsl(var(--sa-${tag.color}))]`}>
                      {tag.label}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[hsl(var(--sa-text-secondary))] leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(activity.createdAt).toLocaleString("pt-BR")}
                  </span>
                  {activity.ipAddress && (
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))] font-mono">
                      IP: {activity.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {activities.length === 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-16">
          <Activity className="h-12 w-12 text-[hsl(var(--sa-text-muted))] mx-auto mb-4" />
          <p className="text-[14px] text-[hsl(var(--sa-text-muted))]">Nenhuma atividade encontrada</p>
        </motion.div>
      )}

      {/* Pagination */}
      {logsData && logsData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="ghost" size="sm" disabled={logsData.first} onClick={() => setPage(p => p - 1)} className="rounded-lg text-[11px]">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">
            Pág. {logsData.page + 1} de {logsData.totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={logsData.last} onClick={() => setPage(p => p + 1)} className="rounded-lg text-[11px]">
            Próxima <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
