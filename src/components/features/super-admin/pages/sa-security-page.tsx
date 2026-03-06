"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, KeyRound, Lock, AlertTriangle, UserCheck, Loader2, LogOut, RefreshCw } from "lucide-react";
import { SaPageHeader, SaStatCard, SaCard, SaSkeleton, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import superAdminService from "@/services/super-admin/superAdminService";
import { toast } from "sonner";

export function SaSecurityPage() {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sa-sessions", { activeOnly: true }],
    queryFn: () => superAdminService.listUserSessions({ activeOnly: true, size: 100 }),
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["sa-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: settings } = useQuery({
    queryKey: ["sa-general-settings"],
    queryFn: superAdminService.getGeneralSettings,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: number) => superAdminService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-sessions"] });
      toast.success("Sessão revogada com sucesso.");
    },
    onError: () => toast.error("Erro ao revogar sessão."),
  });

  const revokeAllMutation = useMutation({
    mutationFn: (userId: number) => superAdminService.revokeAllUserSessions(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-sessions"] });
      toast.success("Todas as sessões do usuário foram revogadas.");
    },
    onError: () => toast.error("Erro ao revogar sessões."),
  });

  const isLoading = sessionsLoading || overviewLoading;
  const activeSessions = sessions?.content ?? [];
  const totalSessions = sessions?.totalElements ?? 0;
  const openTickets = overview?.openSupportTickets ?? 0;

  // Count unique users with active sessions
  const uniqueUsers = new Set(activeSessions.map(s => s.userId)).size;
  // Count admin sessions
  const adminSessions = activeSessions.filter(s => s.userRole === "ROLE_SUPER_ADMIN" || s.userRole === "ROLE_ADMIN").length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="Segurança" description="Controles de acesso, autenticação e proteção da plataforma" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SaSkeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SaPageHeader title="Segurança" description="Controles de acesso, autenticação e proteção da plataforma — dados em tempo real" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Sessões Ativas" value={totalSessions.toLocaleString("pt-BR")} icon={UserCheck} color="info" subtitle={`${uniqueUsers} usuários únicos`} />
        <SaStatCard title="Admins Ativos" value={String(adminSessions)} icon={Shield} color="success" />
        <SaStatCard title="Tickets Abertos" value={String(openTickets)} icon={AlertTriangle} color={openTickets > 10 ? "danger" : "warning"} />
        <SaStatCard title="Modo Manutenção" value={settings?.maintenanceMode ? "Ativo" : "Desligado"} icon={Lock} color={settings?.maintenanceMode ? "danger" : "success"} />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Sessões Ativas ({totalSessions})</h3>
            <Button
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["sa-sessions"] })}
              className="h-7 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface))]"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Atualizar
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-[12px] text-[hsl(var(--sa-text-muted))]">Nenhuma sessão ativa.</div>
            ) : (
              activeSessions.slice(0, 20).map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-medium text-[hsl(var(--sa-text))] truncate">{session.userEmail}</p>
                      <span className="text-[10px] rounded-full bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))] px-2 py-0.5 font-semibold">
                        {session.userRole?.replace("ROLE_", "") || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">IP: {session.ipAddress}</span>
                      <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">•</span>
                      <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">
                        Último acesso: {new Date(session.lastAccessedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => revokeSessionMutation.mutate(session.id)}
                      disabled={revokeSessionMutation.isPending}
                      className="h-7 text-[11px] text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))]"
                    >
                      <LogOut className="h-3 w-3 mr-1" /> Revogar
                    </Button>
                  </div>
                </div>
              ))
            )}
            {activeSessions.length > 20 && (
              <p className="text-center text-[11px] text-[hsl(var(--sa-text-muted))] pt-2">
                Mostrando 20 de {activeSessions.length} sessões
              </p>
            )}
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Configurações da Plataforma</h3>
          <div className="space-y-4">
            {[
              { label: "Nome da Plataforma", value: settings?.platformName || "—" },
              { label: "E-mail de Suporte", value: settings?.supportEmail || "—" },
              { label: "Fuso Horário", value: settings?.defaultTimezone || "—" },
              { label: "Idioma Padrão", value: settings?.defaultLanguage || "—" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-[hsl(var(--sa-border-subtle))] pb-3 last:border-0 last:pb-0">
                <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{item.label}</span>
                <span className="text-[12px] font-medium text-[hsl(var(--sa-text))]">{item.value}</span>
              </div>
            ))}
          </div>
        </SaCard>
      </motion.div>
    </div>
  );
}
