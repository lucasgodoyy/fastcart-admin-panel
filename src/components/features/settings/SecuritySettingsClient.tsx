'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Loader2, Monitor, Smartphone, X, Shield, ShieldCheck } from 'lucide-react';
import accountSettingsService, { AccountInfo, SessionInfo } from '@/services/accountSettingsService';
import { toast } from 'sonner';
import { t } from '@/lib/admin-language';

export function SecuritySettingsClient() {
  const queryClient = useQueryClient();

  const { data: account } = useQuery<AccountInfo>({
    queryKey: ['my-account'],
    queryFn: () => accountSettingsService.getMyAccount(),
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<SessionInfo[]>({
    queryKey: ['my-sessions'],
    queryFn: () => accountSettingsService.getActiveSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: number) => accountSettingsService.revokeSession(sessionId),
    onSuccess: () => {
      toast.success(t('Sessão encerrada.', 'Session revoked.'));
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] });
    },
    onError: () => toast.error(t('Erro ao encerrar sessão.', 'Error revoking session.')),
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => accountSettingsService.revokeAllOtherSessions(),
    onSuccess: () => {
      toast.success(t('Todas as outras sessões foram encerradas.', 'All other sessions revoked.'));
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] });
    },
    onError: () => toast.error(t('Erro ao encerrar sessões.', 'Error revoking sessions.')),
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getDeviceIcon = (os: string | null) => {
    const lower = (os || '').toLowerCase();
    if (lower.includes('android') || lower.includes('ios') || lower.includes('iphone')) {
      return <Smartphone className="h-5 w-5 text-muted-foreground" />;
    }
    return <Monitor className="h-5 w-5 text-muted-foreground" />;
  };

  const getLocation = (session: SessionInfo) => {
    const parts = [session.city, session.region, session.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : session.ipAddress || t('Desconhecida', 'Unknown');
  };

  return (
    <SettingsPageLayout
      title={t('Segurança', 'Security')}
      description={t('Gerencie a autenticação de dois fatores e sessões ativas.', 'Manage two-factor authentication and active sessions.')}
    >
      {/* 2FA Section */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          {account?.twoFactorEnabled
            ? <ShieldCheck className="h-6 w-6 text-green-500" />
            : <Shield className="h-6 w-6 text-muted-foreground" />
          }
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('Autenticação de dois fatores (2FA)', 'Two-factor authentication (2FA)')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {account?.twoFactorEnabled
                ? t('2FA está ativado para sua conta.', '2FA is enabled for your account.')
                : t('Adicione uma camada extra de segurança à sua conta.', 'Add an extra layer of security to your account.')}
            </p>
          </div>
        </div>

        {!account?.twoFactorEnabled && (
          <div className="rounded-md border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm text-foreground">
              {t(
                'Recomendamos usar um dos seguintes aplicativos para gerar códigos de verificação:',
                'We recommend using one of the following apps to generate verification codes:'
              )}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Google Authenticator</li>
              <li>Authy</li>
              <li>Microsoft Authenticator</li>
            </ul>
            <Button className="mt-3" disabled>
              {t('Ativar 2FA', 'Enable 2FA')}
              <span className="ml-2 text-xs opacity-60">({t('em breve', 'coming soon')})</span>
            </Button>
          </div>
        )}
      </div>

      {/* Sessions Section */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('Sessões e dispositivos', 'Sessions & devices')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('Gerencie os dispositivos onde sua conta está conectada.', 'Manage devices where your account is logged in.')}
            </p>
          </div>
          {sessions && sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => revokeAllMutation.mutate()}
              disabled={revokeAllMutation.isPending}
            >
              {revokeAllMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {t('Encerrar todas as outras', 'Revoke all others')}
            </Button>
          )}
        </div>

        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="divide-y divide-border">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-4 py-3">
                <div className="shrink-0">{getDeviceIcon(session.os)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {session.browser || session.deviceName || t('Navegador desconhecido', 'Unknown browser')}
                      {session.os ? ` - ${session.os}` : ''}
                    </span>
                    {session.isCurrent && (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {t('Sessão atual', 'Current')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getLocation(session)} · {t('Último acesso:', 'Last seen:')} {formatDate(session.lastSeenAt || session.createdAt)}
                  </p>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeMutation.mutate(session.id)}
                    disabled={revokeMutation.isPending}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            {t('Nenhuma sessão ativa encontrada.', 'No active sessions found.')}
          </p>
        )}
      </div>
    </SettingsPageLayout>
  );
}
