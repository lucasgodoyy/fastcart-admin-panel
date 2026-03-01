"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Mail, AlertTriangle, Info, CheckCircle2, FileText } from "lucide-react";
import { SaPageHeader, SaStatCard, SaCard, SaEmptyState, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin";

const typeIcon: Record<string, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  ALERT: <AlertTriangle className="h-4 w-4" />,
  INFO: <Info className="h-4 w-4" />,
  SYSTEM: <CheckCircle2 className="h-4 w-4" />,
};

const typeColor: Record<string, string> = {
  EMAIL: "bg-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-info))]",
  ALERT: "bg-[hsl(var(--sa-warning-subtle))] text-[hsl(var(--sa-warning))]",
  INFO: "bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]",
  SYSTEM: "bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]",
};

export function SaNotificationsPage() {
  const [page, setPage] = useState(0);

  const { data: stats } = useQuery({
    queryKey: ["sa-notification-stats"],
    queryFn: superAdminService.getNotificationStats,
  });

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["sa-notifications", page],
    queryFn: () => superAdminService.listNotifications({ page, size: 20 }),
  });

  const notifications = notificationsData?.content ?? [];

  return (
    <div className="space-y-8">
      <SaPageHeader title="Notificações" description="Notificações e alertas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total" value={String(stats?.totalNotifications ?? 0)} icon={Bell} color="info" />
        <SaStatCard title="Não Lidas" value={String(stats?.unreadNotifications ?? 0)} icon={Mail} color="warning" />
        <SaStatCard
          title="Taxa de Leitura"
          value={stats && stats.totalNotifications > 0
            ? `${(((stats.totalNotifications - stats.unreadNotifications) / stats.totalNotifications) * 100).toFixed(0)}%`
            : "—"
          }
          icon={CheckCircle2}
          color="success"
        />
        <SaStatCard title="Resultados" value={String(notificationsData?.totalElements ?? 0)} icon={FileText} color="accent" />
      </motion.div>

      {isLoading ? (
        <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando notificações...</div>
      ) : notifications.length === 0 ? (
        <SaEmptyState icon={Bell} title="Nenhuma notificação" description="Não há notificações no momento" />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={fadeInUp}
              className={`rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 backdrop-blur-sm p-4 hover:bg-[hsl(var(--sa-surface-hover))] transition-all ${
                !notif.read ? "border-l-2 border-l-[hsl(var(--sa-accent))]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColor[notif.type] ?? typeColor.INFO}`}>
                  {typeIcon[notif.type] ?? typeIcon.INFO}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{notif.title}</h4>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-[hsl(var(--sa-accent))]" />
                    )}
                  </div>
                  <p className="text-[12px] text-[hsl(var(--sa-text-secondary))] mb-1">{notif.message}</p>
                  <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {notificationsData && notificationsData.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                Página {notificationsData.page + 1} de {notificationsData.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={notificationsData.first}
                  className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={notificationsData.last}
                  className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
