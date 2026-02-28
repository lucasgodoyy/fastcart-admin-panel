"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Store,
  Search,
  Settings,
  UserCog,
  Key,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "@/services/super-admin";

const actionTypeMap: Record<string, { label: string; color: string }> = {
  STORE_STATUS_TOGGLED: { label: "Loja", color: "info" },
  USER_STATUS_TOGGLED: { label: "Usuário", color: "warning" },
  USER_ROLE_UPDATED: { label: "Role", color: "accent" },
  USER_PASSWORD_RESET: { label: "Senha", color: "danger" },
  SESSION_REVOKED: { label: "Sessão", color: "warning" },
  USER_SESSIONS_REVOKED: { label: "Sessões", color: "warning" },
};

function getActivityIcon(actionType: string) {
  const normalizedType = actionType.toLowerCase();

  if (normalizedType.includes("store")) {
    return Store;
  }

  if (normalizedType.includes("role")) {
    return UserCog;
  }

  if (normalizedType.includes("password")) {
    return Key;
  }

  if (normalizedType.includes("revoke") || normalizedType.includes("session")) {
    return Ban;
  }

  if (normalizedType.includes("toggle") || normalizedType.includes("status")) {
    return Settings;
  }

  return Activity;
}

function getActionFilterValue(filter: string) {
  if (filter === "all") {
    return undefined;
  }

  if (filter === "store") {
    return "STORE_STATUS_TOGGLED";
  }

  if (filter === "user") {
    return "USER_STATUS_TOGGLED";
  }

  if (filter === "role") {
    return "USER_ROLE_UPDATED";
  }

  if (filter === "password") {
    return "USER_PASSWORD_RESET";
  }

  if (filter === "session") {
    return "SESSION_REVOKED";
  }

  return undefined;
}

export function SaActivityPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-activity", filter, search, page],
    queryFn: () =>
      superAdminService.listActivityLogs({
        actionType: getActionFilterValue(filter),
        search: search || undefined,
        page,
        size: 20,
      }),
  });

  const activities = useMemo(() => data?.content ?? [], [data]);

  const filters = [
    { key: "all", label: "Todos" },
    { key: "store", label: "Lojas" },
    { key: "user", label: "Usuários" },
    { key: "role", label: "Roles" },
    { key: "password", label: "Senha" },
    { key: "session", label: "Sessões" },
  ];

  const summary = useMemo(() => {
    const toggles = activities.filter((item) => item.actionType.includes("TOGGLED")).length;
    const roleChanges = activities.filter((item) => item.actionType.includes("ROLE")).length;
    const sessionActions = activities.filter((item) => item.actionType.includes("SESSION")).length;

    return { toggles, roleChanges, sessionActions };
  }, [activities]);

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Registro de Atividades"
        description="Log de ações executadas no painel super-admin"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-4">
          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Eventos da página</p>
          <p className="mt-2 text-[22px] font-bold text-[hsl(var(--sa-text))]">{activities.length}</p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-4">
          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Mudanças de status</p>
          <p className="mt-2 text-[22px] font-bold text-[hsl(var(--sa-info))]">{summary.toggles}</p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-4">
          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Sessões / Roles</p>
          <p className="mt-2 text-[22px] font-bold text-[hsl(var(--sa-accent))]">{summary.sessionActions + summary.roleChanges}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
          <Input
            placeholder="Buscar atividade..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] rounded-xl h-10 text-[12px]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter(item.key);
                setPage(0);
              }}
              className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
                filter === item.key
                  ? "bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30"
                  : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]"
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.actionType);
          const actionTag = actionTypeMap[activity.actionType];

          return (
            <motion.div
              key={activity.id}
              variants={fadeInUp}
              className="group flex items-start gap-4 p-4 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 hover:bg-[hsl(var(--sa-surface-hover))] transition-all backdrop-blur-sm"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-[hsl(var(--sa-accent-subtle))] flex items-center justify-center">
                <Icon className="h-5 w-5 text-[hsl(var(--sa-accent))]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                    {activity.userEmail ?? "Sistema"}
                  </span>
                  {actionTag ? (
                    <SaStatusBadge status={activity.actionType} map={{ [activity.actionType]: actionTag }} />
                  ) : (
                    <SaStatusBadge status={activity.actionType} />
                  )}
                </div>
                <p className="text-[12px] text-[hsl(var(--sa-text-secondary))] leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(activity.createdAt).toLocaleString("pt-BR")}
                  </span>
                  {activity.ipAddress && (
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))] font-mono">
                      IP: {activity.ipAddress}
                    </span>
                  )}
                  {activity.entityType && (
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">
                      {activity.entityType} #{activity.entityId ?? "-"}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {!isLoading && activities.length === 0 && (
        <SaEmptyState
          icon={Activity}
          title="Nenhuma atividade encontrada"
          description="Ajuste os filtros para ver resultados"
        />
      )}

      {data && data.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">
            Página {data.page + 1} de {Math.max(data.totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              disabled={data.first}
              className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={data.last}
              className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]"
            >
              Próxima <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
