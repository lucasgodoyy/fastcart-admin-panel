"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Monitor,
  Search,
  Shield,
  Ban,
  Power,
  Users,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { superAdminService } from "@/services/super-admin";

const sessionStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativa", color: "success" },
  REVOKED: { label: "Revogada", color: "danger" },
  EXPIRED: { label: "Expirada", color: "warning" },
};

function getSessionStatus(active: boolean, revoked: boolean) {
  if (revoked) {
    return "REVOKED";
  }

  if (active) {
    return "ACTIVE";
  }

  return "EXPIRED";
}

export function SaSessionsPage() {
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState("ALL");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-sessions", search, activeOnly],
    queryFn: () =>
      superAdminService.listSessions({
        activeOnly: activeOnly === "ACTIVE" ? true : undefined,
        search: search || undefined,
        page: 0,
        size: 100,
      }),
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: number) => superAdminService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-sessions"] });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: (userId: number) => superAdminService.revokeAllUserSessions(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-sessions"] });
    },
  });

  const sessions = useMemo(() => data?.content ?? [], [data]);

  const stats = useMemo(() => {
    const active = sessions.filter((session) => session.active && !session.revoked).length;
    const revoked = sessions.filter((session) => session.revoked).length;
    const expired = sessions.filter((session) => !session.active && !session.revoked).length;
    const users = new Set(sessions.map((session) => session.userId)).size;

    return { active, revoked, expired, users };
  }, [sessions]);

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Sessões de Usuário"
        description="Monitore sessões ativas e revogue acessos quando necessário"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Sessões Ativas" value={String(stats.active)} icon={Power} color="success" />
        <SaStatCard title="Sessões Revogadas" value={String(stats.revoked)} icon={Ban} color="danger" />
        <SaStatCard title="Sessões Expiradas" value={String(stats.expired)} icon={Clock} color="warning" />
        <SaStatCard title="Usuários com Sessão" value={String(stats.users)} icon={Users} color="info" />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por e-mail, role ou IP..."
                className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
              />
            </div>
            <Select value={activeOnly} onValueChange={setActiveOnly}>
              <SelectTrigger className="w-full sm:w-44 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="ACTIVE">Apenas ativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaTableCard title="Sessões" subtitle={`${sessions.length} resultado(s)`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Usuário</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">IP</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Criada</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Expira</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session, index) => {
                const status = getSessionStatus(session.active, session.revoked);
                return (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{session.userEmail}</p>
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{session.userRole ?? "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-text-secondary))]">{session.ipAddress ?? "—"}</TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{new Date(session.createdAt).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{new Date(session.expiresAt).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <SaStatusBadge status={status} map={sessionStatusMap} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                          <DropdownMenuItem
                            onClick={() => revokeSessionMutation.mutate(session.id)}
                            disabled={session.revoked || !session.active}
                            className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer gap-2"
                          >
                            <Ban className="h-3.5 w-3.5" /> Revogar sessão
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => revokeAllMutation.mutate(session.userId)}
                            className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"
                          >
                            <Shield className="h-3.5 w-3.5" /> Revogar todas do usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          {!isLoading && sessions.length === 0 && (
            <SaEmptyState
              icon={Monitor}
              title="Nenhuma sessão encontrada"
              description="Tente ajustar os filtros de busca"
            />
          )}
        </SaTableCard>
      </motion.div>
    </div>
  );
}
