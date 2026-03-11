'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Package,
  CreditCard,
  Truck,
  UserPlus,
  Settings,
  Paintbrush,
  Mail,
  Shield,
  Activity,
} from 'lucide-react';
import activityService, { type ActivityLog } from '@/services/activityService';
import { t } from '@/lib/admin-language';

const iconMap: Record<string, React.ReactNode> = {
  CREATE: <Package className="h-3.5 w-3.5" />,
  UPDATE: <Settings className="h-3.5 w-3.5" />,
  DELETE: <Package className="h-3.5 w-3.5" />,
  LOGIN: <Shield className="h-3.5 w-3.5" />,
  PAYMENT: <CreditCard className="h-3.5 w-3.5" />,
  SHIPPING: <Truck className="h-3.5 w-3.5" />,
  CUSTOMER: <UserPlus className="h-3.5 w-3.5" />,
  EMAIL: <Mail className="h-3.5 w-3.5" />,
  THEME: <Paintbrush className="h-3.5 w-3.5" />,
};

const colorMap: Record<string, string> = {
  CREATE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  UPDATE: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  DELETE: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  LOGIN: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  PAYMENT: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  SHIPPING: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  CUSTOMER: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  EMAIL: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
  THEME: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
};

function parseValidDate(dateValue: string | null | undefined): Date | null {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeTime(isoDate: string | null | undefined): string {
  const date = parseValidDate(isoDate);

  if (!date) {
    return t('Data indisponivel', 'Date unavailable');
  }

  const diff = Date.now() - date.getTime();

  if (diff < 0) {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
  }

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('agora', 'just now');
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

export function ActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-activity-feed'],
    queryFn: () => activityService.list({ size: 8 }),
    staleTime: 30_000,
  });

  const logs = data?.content ?? [];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          {t('Atividade recente', 'Recent activity')}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-2 w-1/3 rounded bg-muted animate-pulse mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('Nenhuma atividade registrada ainda.', 'No activity recorded yet.')}
        </p>
      ) : (
        <div className="space-y-1">
          {logs.map((log: ActivityLog) => {
            const icon = iconMap[log.actionType] || <Settings className="h-3.5 w-3.5" />;
            const color = colorMap[log.actionType] || 'bg-muted text-muted-foreground';
            return (
              <div key={log.id} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/30 transition-colors">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color}`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground leading-snug">{log.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{log.userName || '—'}</span>
                    <span className="text-[11px] text-muted-foreground/50">·</span>
                    <span className="text-[11px] text-muted-foreground">{formatRelativeTime(log.performedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
