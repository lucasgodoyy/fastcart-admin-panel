'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Unplug,
  KeyRound,
} from 'lucide-react';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import integrationService from '@/services/integrationService';
import { MelhorEnvioConnectionStatus, StripeConnectStatus } from '@/types/integration';

const STRIPE_QUERY_KEY = ['integration', 'stripe-connect'];
const MELHOR_QUERY_KEY = ['integration', 'melhor-envio'];

/* ─── Stripe status helpers ─── */
function getStripeState(status?: StripeConnectStatus) {
  if (!status || !status.connected) return 'NOT_CONNECTED';
  if (status.chargesEnabled && status.payoutsEnabled) return 'ACTIVE';
  if (status.onboardingCompleted) return 'RESTRICTED';
  return 'ONBOARDING_PENDING';
}

function getStripeIndicator(state: string) {
  switch (state) {
    case 'ACTIVE':
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        label: 'Ativo',
        description: 'Pagamentos, repasses e transferências funcionando normalmente.',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
      };
    case 'RESTRICTED':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        label: 'Ação necessária',
        description:
          'O Stripe precisa de informações adicionais para manter os pagamentos ativos. Complete o onboarding para evitar suspensões.',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      };
    case 'ONBOARDING_PENDING':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        label: 'Onboarding pendente',
        description:
          'Você iniciou a conexão com o Stripe mas ainda não completou todas as etapas. Clique em "Completar cadastro" para continuar.',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      };
    default:
      return {
        icon: <XCircle className="h-5 w-5 text-muted-foreground" />,
        label: 'Não conectado',
        description:
          'Conecte sua conta Stripe para receber pagamentos dos seus clientes diretamente na sua conta bancária.',
        badgeClass: 'bg-muted text-muted-foreground border-border',
      };
  }
}

export function IntegrationsSettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    data: stripeStatus,
    isLoading: isLoadingStripe,
    isRefetching: isRefetchingStripe,
  } = useQuery<StripeConnectStatus>({
    queryKey: STRIPE_QUERY_KEY,
    queryFn: integrationService.getStripeStatus,
  });

  const { data: melhorEnvioStatus, isLoading: isLoadingMelhorEnvio } = useQuery<MelhorEnvioConnectionStatus>({
    queryKey: MELHOR_QUERY_KEY,
    queryFn: integrationService.getMelhorEnvioStatus,
  });

  const openStripeOnboardingMutation = useMutation({
    mutationFn: integrationService.createStripeOnboardingLink,
    onSuccess: (response) => {
      window.location.href = response.onboardingUrl;
    },
    onError: () => toast.error('Falha ao iniciar conexão com Stripe. Tente novamente.'),
  });

  const openStripeDashboardMutation = useMutation({
    mutationFn: integrationService.createStripeDashboardLink,
    onSuccess: (response) => {
      window.location.href = response.dashboardUrl;
    },
    onError: () => toast.error('Falha ao abrir dashboard Stripe.'),
  });

  const disconnectStripeMutation = useMutation({
    mutationFn: integrationService.disconnectStripe,
    onSuccess: () => {
      toast.success('Stripe desconectado com sucesso.');
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
    },
    onError: () => toast.error('Falha ao desconectar Stripe.'),
  });

  const openMelhorEnvioAuthorizeMutation = useMutation({
    mutationFn: integrationService.getMelhorEnvioAuthorizeUrl,
    onSuccess: (response) => {
      window.location.href = response.authorizeUrl;
    },
    onError: () => toast.error('Falha ao iniciar conexão com Melhor Envio.'),
  });

  const connectMelhorEnvioMutation = useMutation({
    mutationFn: (code: string) => integrationService.connectMelhorEnvio(code),
    onSuccess: () => {
      toast.success('Melhor Envio conectado com sucesso.');
      queryClient.invalidateQueries({ queryKey: MELHOR_QUERY_KEY });
      router.replace('/admin/settings/integrations');
    },
    onError: () => {
      toast.error('Falha ao finalizar conexão com Melhor Envio.');
      router.replace('/admin/settings/integrations');
    },
  });

  const disconnectMelhorEnvioMutation = useMutation({
    mutationFn: integrationService.disconnectMelhorEnvio,
    onSuccess: () => {
      toast.success('Melhor Envio desconectado com sucesso.');
      queryClient.invalidateQueries({ queryKey: MELHOR_QUERY_KEY });
    },
    onError: () => toast.error('Falha ao desconectar Melhor Envio.'),
  });

  const connectMelhorEnvioTokenMutation = useMutation({
    mutationFn: (token: string) => integrationService.connectMelhorEnvioWithToken(token),
    onSuccess: () => {
      toast.success('Melhor Envio conectado com token direto!');
      queryClient.invalidateQueries({ queryKey: MELHOR_QUERY_KEY });
      setShowTokenInput(false);
      setDirectToken('');
    },
    onError: () => toast.error('Token inválido ou expirado. Verifique e tente novamente.'),
  });

  const [showTokenInput, setShowTokenInput] = useState(false);
  const [directToken, setDirectToken] = useState('');

  useEffect(() => {
    const stripeReturn = searchParams.get('stripe');
    if (stripeReturn === 'return') {
      toast.success('Retorno do Stripe recebido. Validando status...');
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
      router.replace('/admin/settings/integrations');
      return;
    }

    if (stripeReturn === 'refresh') {
      toast.info('Complete o onboarding do Stripe para ativar pagamentos.');
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
      router.replace('/admin/settings/integrations');
    }
  }, [queryClient, router, searchParams]);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    const oauthCode = searchParams.get('code');
    const oauthState = searchParams.get('state');

    if (oauthError) {
      toast.error('Autorização do Melhor Envio cancelada ou inválida.');
      router.replace('/admin/settings/integrations');
      return;
    }

    if (!oauthCode) return;
    if (oauthState && !oauthState.startsWith('store-')) {
      toast.error('State inválido no retorno do Melhor Envio.');
      router.replace('/admin/settings/integrations');
      return;
    }
    if (connectMelhorEnvioMutation.isPending) return;

    connectMelhorEnvioMutation.mutate(oauthCode);
  }, [connectMelhorEnvioMutation, router, searchParams]);

  const stripeState = getStripeState(stripeStatus);
  const stripeIndicator = getStripeIndicator(stripeState);
  const isStripeLoading = isLoadingStripe || isRefetchingStripe;

  return (
    <SettingsPageLayout
      title="Integrações"
      description="Conecte pagamentos e frete da loja no modelo SaaS."
    >
      <div className="grid gap-4">
        {/* ─── STRIPE CONNECT ─── */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/30">
                <CreditCard className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Stripe Connect</h2>
                <p className="text-xs text-muted-foreground">Receba pagamentos na sua conta</p>
              </div>
            </div>
            {!isStripeLoading && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${stripeIndicator.badgeClass}`}
              >
                {stripeIndicator.icon}
                {stripeIndicator.label}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {isStripeLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando status do Stripe...
              </div>
            ) : (
              <>
                {/* Status message */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stripeIndicator.description}
                </p>

                {/* Detail grid — only when connected */}
                {stripeStatus?.connected && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatusCard
                      label="Pagamentos"
                      ok={stripeStatus.chargesEnabled}
                    />
                    <StatusCard
                      label="Repasses"
                      ok={stripeStatus.payoutsEnabled}
                    />
                    <StatusCard
                      label="Onboarding"
                      ok={stripeStatus.onboardingCompleted}
                    />
                  </div>
                )}

                {/* Warning banner for restricted / pending */}
                {(stripeState === 'RESTRICTED' || stripeState === 'ONBOARDING_PENDING') && (
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {stripeState === 'RESTRICTED' ? (
                        <>
                          <strong>Funcionalidades podem ser suspensas.</strong> O Stripe solicitou
                          informações adicionais (ex: documento de identidade, dados bancários). Complete
                          as pendências para evitar interrupção nos pagamentos.
                        </>
                      ) : (
                        <>
                          <strong>Cadastro incompleto.</strong> Você precisa finalizar o processo de
                          verificação no Stripe para começar a receber pagamentos. Clique no botão abaixo
                          para continuar de onde parou.
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          {!isStripeLoading && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3 bg-muted/30">
              {stripeState === 'NOT_CONNECTED' && (
                <Button
                  onClick={() => openStripeOnboardingMutation.mutate()}
                  disabled={openStripeOnboardingMutation.isPending}
                  size="sm"
                >
                  {openStripeOnboardingMutation.isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Conectar Stripe
                </Button>
              )}

              {(stripeState === 'ONBOARDING_PENDING' || stripeState === 'RESTRICTED') && (
                <Button
                  onClick={() => openStripeOnboardingMutation.mutate()}
                  disabled={openStripeOnboardingMutation.isPending}
                  size="sm"
                  variant={stripeState === 'RESTRICTED' ? 'destructive' : 'default'}
                >
                  {openStripeOnboardingMutation.isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  {stripeState === 'RESTRICTED' ? 'Resolver pendências' : 'Completar cadastro'}
                </Button>
              )}

              {stripeState === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openStripeDashboardMutation.mutate()}
                  disabled={openStripeDashboardMutation.isPending}
                >
                  {openStripeDashboardMutation.isPending ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  )}
                  Abrir dashboard Stripe
                </Button>
              )}

              {stripeStatus?.connected && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY })}
                  >
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefetchingStripe ? 'animate-spin' : ''}`} />
                    Atualizar status
                  </Button>

                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja desconectar o Stripe? Você não receberá mais pagamentos até reconectar.')) {
                          disconnectStripeMutation.mutate();
                        }
                      }}
                      disabled={disconnectStripeMutation.isPending}
                    >
                      <Unplug className="mr-2 h-3.5 w-3.5" />
                      Desconectar
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Melhor Envio</h2>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            {isLoadingMelhorEnvio
              ? 'Carregando status...'
              : melhorEnvioStatus?.connected
                ? 'Conectado'
                : 'Não conectado'}
          </div>

          {melhorEnvioStatus?.connected && (
            <div className="mb-4 space-y-1 text-xs text-muted-foreground">
              <p>Conta do provedor: {melhorEnvioStatus.providerAccountId || 'Não informado'}</p>
              <p>
                Conectado em:{' '}
                {melhorEnvioStatus.connectedAt
                  ? new Date(melhorEnvioStatus.connectedAt).toLocaleString()
                  : '-'}
              </p>
              <p>
                Expira em:{' '}
                {melhorEnvioStatus.expiresAt
                  ? new Date(melhorEnvioStatus.expiresAt).toLocaleString()
                  : 'Não informado'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => openMelhorEnvioAuthorizeMutation.mutate()}
              disabled={openMelhorEnvioAuthorizeMutation.isPending || connectMelhorEnvioMutation.isPending}
            >
              {melhorEnvioStatus?.connected ? 'Reconectar Melhor Envio' : 'Conectar Melhor Envio'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowTokenInput(!showTokenInput)}
              disabled={connectMelhorEnvioTokenMutation.isPending}
            >
              <KeyRound className="mr-2 h-3.5 w-3.5" />
              {showTokenInput ? 'Cancelar' : 'Conectar com Token'}
            </Button>

            {melhorEnvioStatus?.connected && (
              <Button
                variant="outline"
                onClick={() => disconnectMelhorEnvioMutation.mutate()}
                disabled={disconnectMelhorEnvioMutation.isPending}
              >
                Desconectar Melhor Envio
              </Button>
            )}
          </div>

          {showTokenInput && (
            <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                Cole o access token gerado no painel do Melhor Envio (sandbox ou produção).
              </p>
              <textarea
                value={directToken}
                onChange={(e) => setDirectToken(e.target.value)}
                placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOi..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono min-h-[60px] resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="sm"
                onClick={() => {
                  const trimmed = directToken.trim();
                  if (!trimmed) {
                    toast.error('Cole o token antes de conectar.');
                    return;
                  }
                  connectMelhorEnvioTokenMutation.mutate(trimmed);
                }}
                disabled={connectMelhorEnvioTokenMutation.isPending || !directToken.trim()}
              >
                {connectMelhorEnvioTokenMutation.isPending && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Validar e Conectar
              </Button>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            O lojista pode criar a conta no Melhor Envio durante o fluxo de autorização.
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Modelo multi-tenant: cada loja conecta sua própria conta Stripe e Melhor Envio.
      </div>
    </SettingsPageLayout>
  );
}

/* ─── Small status card component ─── */
function StatusCard({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center ${
        ok
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
      }`}
    >
      {ok ? (
        <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="mb-1 h-4 w-4 text-red-500" />
      )}
      <span className={`text-xs font-medium ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
        {label}
      </span>
      <span className={`text-[10px] ${ok ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
        {ok ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
}
