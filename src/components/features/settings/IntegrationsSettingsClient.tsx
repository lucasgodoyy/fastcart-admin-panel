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
  Bug,
  ClipboardList,
} from 'lucide-react';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import integrationService from '@/services/integrationService';
import { MelhorEnvioConnectionStatus, MercadoPagoStatus, StripeConnectStatus } from '@/types/integration';

const STRIPE_QUERY_KEY = ['integration', 'stripe-connect'];
const MELHOR_QUERY_KEY = ['integration', 'melhor-envio'];
const MERCADOPAGO_QUERY_KEY = ['integration', 'mercadopago'];

/* ─── Stripe status helpers ─── */
function getStripeState(status?: StripeConnectStatus) {
  if (!status || !status.connected) return 'NOT_CONNECTED';
  if (status.chargesEnabled && status.payoutsEnabled) return 'ACTIVE';
  if (status.pendingReview) return 'REVIEW_PENDING';
  if (status.onboardingCompleted) return 'RESTRICTED';
  return 'ONBOARDING_PENDING';
}

const STRIPE_REQUIREMENT_LABELS: Record<string, string> = {
  'company.representative.political_exposure': 'Exposicao politica do representante',
  'company.representative.first_name': 'Nome do representante',
  'company.representative.last_name': 'Sobrenome do representante',
  'company.representative.email': 'Email do representante',
  'company.representative.phone': 'Telefone do representante',
  'company.representative.dob.day': 'Dia de nascimento do representante',
  'company.representative.dob.month': 'Mes de nascimento do representante',
  'company.representative.dob.year': 'Ano de nascimento do representante',
  'company.representative.address.line1': 'Endereco do representante',
  'company.representative.address.city': 'Cidade do representante',
  'company.representative.address.state': 'Estado do representante',
  'company.representative.address.postal_code': 'CEP do representante',
  'company.representative.id_number': 'Documento do representante',
  'company.tax_id': 'CNPJ/Tax ID da empresa',
  'company.verification.document': 'Documento da empresa',
  'external_account': 'Conta bancaria',
};

function prettifyStripeRequirement(value: string) {
  if (STRIPE_REQUIREMENT_LABELS[value]) return STRIPE_REQUIREMENT_LABELS[value];

  return value
    .replaceAll('.', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStripeDeadline(deadline?: number | null) {
  if (!deadline) return null;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(deadline * 1000));
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
    case 'REVIEW_PENDING':
      return {
        icon: <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />,
        label: 'Em analise',
        description:
          'A Stripe esta analisando os dados enviados. O botao abaixo permanece disponivel para voce voltar ao fluxo e acompanhar o progresso.',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800',
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

type IntegrationsMode = 'settings' | 'payments' | 'shipping';

type DiagnosticEntry = {
  id: string;
  level: 'info' | 'success' | 'error';
  title: string;
  description: string;
  timestamp: string;
};

function buildDiagnosticEntry(level: DiagnosticEntry['level'], title: string, description: string): DiagnosticEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level,
    title,
    description,
    timestamp: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

function extractApiError(err: any) {
  const status = err?.response?.status;
  const backendMessage = err?.response?.data?.message;
  const fallbackMessage = err?.message || 'Erro desconhecido';
  const message = backendMessage || fallbackMessage;

  return {
    status,
    message,
    description: status
      ? `HTTP ${status} - ${message}`
      : message,
  };
}

const MODE_META: Record<IntegrationsMode, { title: string; description: string }> = {
  settings: { title: 'Integrações', description: 'Conecte pagamentos e frete da loja no modelo SaaS.' },
  payments: { title: 'Pagamentos', description: 'Configure a integração de pagamentos da sua loja.' },
  shipping: { title: 'Frete', description: 'Configure a integração de frete da sua loja.' },
};

export function IntegrationsSettingsClient({ mode = 'settings' }: { mode?: IntegrationsMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const showStripe = mode === 'settings' || mode === 'payments';
  const showMelhorEnvio = mode === 'settings' || mode === 'shipping';
  const showMercadoPago = mode === 'settings' || mode === 'payments';
  const meta = MODE_META[mode];

  const {
    data: stripeStatus,
    isLoading: isLoadingStripe,
    isRefetching: isRefetchingStripe,
  } = useQuery<StripeConnectStatus>({
    queryKey: STRIPE_QUERY_KEY,
    queryFn: integrationService.getStripeStatus,
    enabled: showStripe,
  });

  const { data: melhorEnvioStatus, isLoading: isLoadingMelhorEnvio } = useQuery<MelhorEnvioConnectionStatus>({
    queryKey: MELHOR_QUERY_KEY,
    queryFn: integrationService.getMelhorEnvioStatus,
    enabled: showMelhorEnvio,
  });

  const { data: mercadoPagoStatus, isLoading: isLoadingMercadoPago } = useQuery<MercadoPagoStatus>({
    queryKey: MERCADOPAGO_QUERY_KEY,
    queryFn: integrationService.getMercadoPagoStatus,
    enabled: showMercadoPago,
  });

  const [mercadoPagoDiagnostics, setMercadoPagoDiagnostics] = useState<DiagnosticEntry[]>([
    buildDiagnosticEntry(
      'info',
      'Pronto para diagnostico',
      'Os eventos do Mercado Pago aparecerao aqui durante status, autorizacao, callback e desconexao.'
    ),
  ]);

  const appendMercadoPagoDiagnostic = (entry: DiagnosticEntry) => {
    setMercadoPagoDiagnostics((current) => [entry, ...current].slice(0, 8));
  };

  const openStripeOnboardingMutation = useMutation({
    mutationFn: integrationService.createStripeOnboardingLink,
    onSuccess: (response) => {
      console.log('[Stripe UI] Onboarding link received, redirecting to:', response.onboardingUrl);
      window.location.href = response.onboardingUrl;
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      console.error('[Stripe UI] Onboarding error:', err?.response?.status, err?.response?.data);
      toast.error(`Falha ao iniciar conexão com Stripe: ${msg}`);
    },
  });

  const openStripeDashboardMutation = useMutation({
    mutationFn: integrationService.createStripeDashboardLink,
    onSuccess: (response) => {
      console.log('[Stripe UI] Dashboard link received, redirecting to:', response.dashboardUrl);
      window.location.href = response.dashboardUrl;
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      console.error('[Stripe UI] Dashboard link error:', err?.response?.status, err?.response?.data);
      toast.error(`Falha ao abrir dashboard Stripe: ${msg}`);
    },
  });

  const disconnectStripeMutation = useMutation({
    mutationFn: integrationService.disconnectStripe,
    onSuccess: () => {
      toast.success('Stripe desconectado com sucesso.');
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      console.error('[Stripe UI] Disconnect error:', err?.response?.status, err?.response?.data);
      toast.error(`Falha ao desconectar Stripe: ${msg}`);
    },
  });

  const openMelhorEnvioAuthorizeMutation = useMutation({
    mutationFn: integrationService.getMelhorEnvioAuthorizeUrl,
    onSuccess: (response) => {
      window.location.href = response.authorizeUrl;
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || '';
      if (msg.includes('OAuth não configurado')) {
        toast.error('OAuth do Melhor Envio não configurado no servidor. Use a opção "Conectar com Token" para conectar diretamente.');
        setShowTokenInput(true);
      } else {
        toast.error('Falha ao iniciar conexão com Melhor Envio. Tente "Conectar com Token".');
      }
    },
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

  const manualStripeLinkMutation = useMutation({
    mutationFn: (stripeAccountId: string) => integrationService.manuallyLinkStripeAccount(stripeAccountId),
    onSuccess: (response) => {
      toast.success(`Conta Stripe vinculada: ${response.stripeAccountId}`);
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
      setManualStripeAccountId('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      toast.error(`Falha ao vincular conta manualmente: ${msg}`);
    },
  });

  const [showTokenInput, setShowTokenInput] = useState(false);
  const [directToken, setDirectToken] = useState('');
  const [manualStripeAccountId, setManualStripeAccountId] = useState('');

  const openMercadoPagoAuthorizeMutation = useMutation({
    mutationFn: integrationService.getMercadoPagoAuthorizeUrl,
    onMutate: () => {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'info',
          'Solicitando URL de autorizacao',
          'Chamando /admin/stores/me/mercadopago/authorize-url para iniciar o OAuth do lojista.'
        )
      );
    },
    onSuccess: (response) => {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'success',
          'URL de autorizacao gerada',
          `OAuth iniciado com sucesso. O navegador sera redirecionado para: ${response.authorizeUrl}`
        )
      );
      window.location.href = response.authorizeUrl;
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      const details = extractApiError(err);
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'error',
          'Falha ao gerar URL de autorizacao',
          `${details.description}. Se este erro vier antes do redirecionamento, o problema esta no backend/configuracao da loja, nao no site do Mercado Pago.`
        )
      );
      toast.error(`Falha ao iniciar conexão com Mercado Pago: ${msg}`);
    },
  });

  const disconnectMercadoPagoMutation = useMutation({
    mutationFn: integrationService.disconnectMercadoPago,
    onMutate: () => {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'info',
          'Desconectando Mercado Pago',
          'Chamando /admin/stores/me/mercadopago/disconnect para limpar a conta conectada da loja.'
        )
      );
    },
    onSuccess: () => {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'success',
          'Mercado Pago desconectado',
          'A loja voltou ao estado nao conectado. Agora e possivel repetir o fluxo de autorizacao do zero.'
        )
      );
      toast.success('Mercado Pago desconectado com sucesso.');
      queryClient.invalidateQueries({ queryKey: MERCADOPAGO_QUERY_KEY });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      const details = extractApiError(err);
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'error',
          'Falha ao desconectar',
          `${details.description}. Confira se o usuario logado ainda tem contexto de loja.`
        )
      );
      toast.error(`Falha ao desconectar Mercado Pago: ${msg}`);
    },
  });

  useEffect(() => {
    const stripeReturn = searchParams.get('stripe');
    if (stripeReturn === 'return') {
      console.log('[Stripe UI] ===== STRIPE RETURN DETECTED =====');
      console.log('[Stripe UI] URL:', window.location.href);
      console.log('[Stripe UI] Invalidating stripe status query and refetching...');
      toast.success('Retorno do Stripe recebido. Validando status...');
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
      router.replace('/admin/settings/integrations');
      return;
    }

    if (stripeReturn === 'refresh') {
      console.log('[Stripe UI] ===== STRIPE REFRESH DETECTED =====');
      console.log('[Stripe UI] User needs to complete onboarding');
      toast.info('Complete o onboarding do Stripe para ativar pagamentos.');
      queryClient.invalidateQueries({ queryKey: STRIPE_QUERY_KEY });
      router.replace('/admin/settings/integrations');
    }
  }, [queryClient, router, searchParams]);

  /* Handle Melhor Envio OAuth callback redirect from backend */
  useEffect(() => {
    const melhorEnvioResult = searchParams.get('melhor_envio');
    if (melhorEnvioResult === 'success') {
      toast.success('Melhor Envio conectado com sucesso!');
      queryClient.invalidateQueries({ queryKey: MELHOR_QUERY_KEY });
      router.replace(window.location.pathname);
      return;
    }
    if (melhorEnvioResult === 'error') {
      const reason = searchParams.get('reason');
      const reasonMap: Record<string, string> = {
        authorization_denied: 'Autorização negada pelo usuário.',
        missing_code: 'Código de autorização ausente.',
        missing_state: 'State ausente na resposta.',
        invalid_state_or_code: 'State ou código inválido.',
        internal_error: 'Erro interno ao processar callback.',
      };
      toast.error(reasonMap[reason ?? ''] ?? 'Falha ao conectar Melhor Envio.');
      queryClient.invalidateQueries({ queryKey: MELHOR_QUERY_KEY });
      router.replace(window.location.pathname);
      return;
    }

    /* Handle direct OAuth code flow (if frontend is the redirect target) */
    const oauthError = searchParams.get('error');
    const oauthCode = searchParams.get('code');

    if (oauthError) {
      toast.error('Autorização do Melhor Envio cancelada ou inválida.');
      router.replace(window.location.pathname);
      return;
    }

    if (!oauthCode) return;
    if (connectMelhorEnvioMutation.isPending) return;

    connectMelhorEnvioMutation.mutate(oauthCode);
  }, [connectMelhorEnvioMutation, queryClient, router, searchParams]);

  /* Handle Mercado Pago OAuth callback redirect from backend */
  useEffect(() => {
    const mpResult = searchParams.get('mercadopago');
    if (mpResult === 'success') {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'success',
          'Callback do Mercado Pago concluido',
          'O navegador retornou do Mercado Pago com sucesso. Atualizando o status salvo da loja agora.'
        )
      );
      toast.success('Mercado Pago conectado com sucesso!');
      queryClient.invalidateQueries({ queryKey: MERCADOPAGO_QUERY_KEY });
      router.replace(window.location.pathname);
    } else if (mpResult === 'error') {
      const reason = searchParams.get('reason') || 'unknown';
      const reasonMap: Record<string, string> = {
        missing_params: 'Parâmetros ausentes na resposta do Mercado Pago.',
        invalid_state: 'Identificador da loja inválido.',
        exchange_failed: 'Falha ao trocar código de autorização.',
      };
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'error',
          'Callback retornou com erro',
          `${reasonMap[reason] ?? `Falha ao conectar Mercado Pago: ${reason}`}. Se a URL abriu no Mercado Pago e so falhou na volta, o problema esta no callback/backend.`
        )
      );
      toast.error(reasonMap[reason] ?? `Falha ao conectar Mercado Pago: ${reason}`);
      queryClient.invalidateQueries({ queryKey: MERCADOPAGO_QUERY_KEY });
      router.replace(window.location.pathname);
    }
  }, [queryClient, router, searchParams]);

  useEffect(() => {
    if (!showMercadoPago || isLoadingMercadoPago) return;

    if (mercadoPagoStatus?.connected) {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'success',
          'Status carregado: conta conectada',
          `connected=true, hasAccessToken=${String(mercadoPagoStatus.hasAccessToken)}, hasPublicKey=${String(mercadoPagoStatus.hasPublicKey)}, mercadoPagoUserId=${mercadoPagoStatus.mercadoPagoUserId ?? 'null'}`
        )
      );
      return;
    }

    if (mercadoPagoStatus) {
      appendMercadoPagoDiagnostic(
        buildDiagnosticEntry(
          'info',
          'Status carregado: conta nao conectada',
          `connected=false, status=${mercadoPagoStatus.status}, hasAccessToken=${String(mercadoPagoStatus.hasAccessToken)}, hasPublicKey=${String(mercadoPagoStatus.hasPublicKey)}`
        )
      );
    }
  }, [showMercadoPago, isLoadingMercadoPago, mercadoPagoStatus]);

  const stripeState = getStripeState(stripeStatus);
  const stripeIndicator = getStripeIndicator(stripeState);
  const isStripeLoading = isLoadingStripe || isRefetchingStripe;
  const stripeDeadline = formatStripeDeadline(stripeStatus?.currentDeadline);
  const stripeNeedsAttention = stripeState !== 'ACTIVE' && stripeStatus?.connected;
  const impactedCapabilities = [
    !stripeStatus?.chargesEnabled ? 'Pagamentos' : null,
    !stripeStatus?.payoutsEnabled ? 'Repasses' : null,
    (!stripeStatus?.chargesEnabled || !stripeStatus?.payoutsEnabled) ? 'Transferencias' : null,
  ].filter(Boolean) as string[];

  return (
    <SettingsPageLayout
      title={meta.title}
      description={meta.description}
    >
      <div className="grid gap-4">
        {/* ─── STRIPE CONNECT ─── */}
        {showStripe && (
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
                {stripeNeedsAttention && (
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                    {stripeState === 'REVIEW_PENDING' ? (
                      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-sky-600 dark:text-sky-400" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {stripeState === 'REVIEW_PENDING' ? (
                        <>
                          <strong>Em analise pela Stripe.</strong> Os documentos foram enviados e a conta continua em progresso.
                          {stripeDeadline ? ` Vencimento atual: ${stripeDeadline}.` : ''}
                        </>
                      ) : stripeState === 'RESTRICTED' ? (
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

                {stripeStatus?.pendingVerification?.length ? (
                  <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-950/20">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Em analise
                    </div>
                    <p className="mt-2 text-xs text-sky-800 dark:text-sky-200">
                      Estamos analisando os dados enviados. A Stripe pode levar ate dois dias uteis para concluir.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-sky-900 dark:text-sky-100">
                      {stripeStatus.pendingVerification.map((item) => (
                        <li key={item}>• {prettifyStripeRequirement(item)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {stripeStatus?.currentlyDue?.length ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      Dados necessarios
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-amber-900 dark:text-amber-100">
                      {stripeStatus.currentlyDue.map((item) => (
                        <li key={item}>• {prettifyStripeRequirement(item)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {impactedCapabilities.length ? (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950/20">
                    <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                      Funcionalidades impactadas
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-rose-900 dark:text-rose-100">
                      {impactedCapabilities.map((item) => (
                        <li key={item}>• {item} suspensos ate a verificacao terminar</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    Vinculo manual
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Se voce criar uma conta conectada manualmente no dashboard da Stripe, cole aqui o ID `acct_...` para vincular esta loja.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={manualStripeAccountId}
                      onChange={(event) => setManualStripeAccountId(event.target.value)}
                      placeholder="acct_1234567890"
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={manualStripeLinkMutation.isPending || !manualStripeAccountId.trim().startsWith('acct_')}
                      onClick={() => manualStripeLinkMutation.mutate(manualStripeAccountId.trim())}
                    >
                      {manualStripeLinkMutation.isPending ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Vincular conta manualmente
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                <Bug className="h-3.5 w-3.5" />
                Diagnostico do Mercado Pago
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Use este painel para ver onde o fluxo falhou: status da loja, requisicao da URL de autorizacao, retorno do callback e mensagens do backend.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-background/70 p-2">
                  <div className="text-[11px] font-medium text-foreground">Origem atual</div>
                  <div className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                    {typeof window !== 'undefined' ? window.location.origin : 'carregando...'}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/70 p-2">
                  <div className="text-[11px] font-medium text-foreground">Proximo passo esperado</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {!mercadoPagoStatus?.connected
                      ? 'Gerar authorize-url, abrir no navegador e voltar com callback.'
                      : 'Conta conectada; validar pagamentos ou desconectar para novo teste.'}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {mercadoPagoDiagnostics.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-md border p-2 text-xs ${
                      entry.level === 'error'
                        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                        : entry.level === 'success'
                          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20'
                          : 'border-border bg-background/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>{entry.title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <p className="mt-1 leading-relaxed text-muted-foreground">{entry.description}</p>
                  </div>
                ))}
              </div>
            </div>
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

              {stripeNeedsAttention && (
                <Button
                  onClick={() => openStripeOnboardingMutation.mutate()}
                  disabled={openStripeOnboardingMutation.isPending}
                  size="sm"
                  variant={stripeState === 'RESTRICTED' ? 'destructive' : 'default'}
                >
                  {openStripeOnboardingMutation.isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  {stripeState === 'REVIEW_PENDING'
                    ? 'Ver progresso da verificacao'
                    : stripeState === 'RESTRICTED'
                      ? 'Continuar verificacao'
                      : 'Completar cadastro'}
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
        )}

        {showMelhorEnvio && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Truck className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Melhor Envio</h2>
                <p className="text-xs text-muted-foreground">Frete automático para sua loja</p>
              </div>
            </div>
            {!isLoadingMelhorEnvio && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  melhorEnvioStatus?.connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {melhorEnvioStatus?.connected ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {melhorEnvioStatus?.connected ? 'Conectado' : 'Não conectado'}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {isLoadingMelhorEnvio ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando status do Melhor Envio...
              </div>
            ) : melhorEnvioStatus?.connected ? (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sua conta Melhor Envio está conectada. Cotações de frete e etiquetas funcionando normalmente.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-3 text-center">
                    <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Conta</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-500">{melhorEnvioStatus.providerAccountId || 'ID não informado'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <span className="text-xs font-medium text-muted-foreground">Conectado em</span>
                    <span className="text-[10px] text-muted-foreground">{melhorEnvioStatus.connectedAt ? new Date(melhorEnvioStatus.connectedAt).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <span className="text-xs font-medium text-muted-foreground">Expira em</span>
                    <span className="text-[10px] text-muted-foreground">{melhorEnvioStatus.expiresAt ? new Date(melhorEnvioStatus.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conecte sua conta do Melhor Envio para habilitar cotação automática de frete, geração de etiquetas e rastreamento de envios.
                </p>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed space-y-1">
                    <p className="font-semibold">Como conectar:</p>
                    <p>
                      <strong>Opção 1 — OAuth (recomendado):</strong> Clique em &quot;Conectar Melhor Envio&quot;. Você será
                      redirecionado para criar conta / autorizar o acesso. Ao autorizar, retornará automaticamente.
                    </p>
                    <p>
                      <strong>Opção 2 — Token direto:</strong> Se já possui uma conta, gere um token em{' '}
                      <a
                        href="https://sandbox.melhorenvio.com.br/painel/gerenciar/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200"
                      >
                        Painel Melhor Envio → Integrações → Meus Tokens
                      </a>{' '}
                      e cole abaixo.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!isLoadingMelhorEnvio && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3 bg-muted/30">
              <Button
                size="sm"
                onClick={() => openMelhorEnvioAuthorizeMutation.mutate()}
                disabled={openMelhorEnvioAuthorizeMutation.isPending || connectMelhorEnvioMutation.isPending}
              >
                {openMelhorEnvioAuthorizeMutation.isPending && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {melhorEnvioStatus?.connected ? (
                  <>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Reconectar
                  </>
                ) : (
                  'Conectar Melhor Envio'
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTokenInput(!showTokenInput)}
                disabled={connectMelhorEnvioTokenMutation.isPending}
              >
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                {showTokenInput ? 'Cancelar' : 'Conectar com Token'}
              </Button>

              {melhorEnvioStatus?.connected && (
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja desconectar o Melhor Envio? Cotações de frete pararão de funcionar.')) {
                        disconnectMelhorEnvioMutation.mutate();
                      }
                    }}
                    disabled={disconnectMelhorEnvioMutation.isPending}
                  >
                    <Unplug className="mr-2 h-3.5 w-3.5" />
                    Desconectar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Token input area */}
          {showTokenInput && (
            <div className="border-t border-border px-5 py-4 space-y-2 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Cole o access token gerado no{' '}
                <a
                  href="https://sandbox.melhorenvio.com.br/painel/gerenciar/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Painel Melhor Envio
                </a>
                . Selecione todas as permissões ao gerar o token.
              </p>
              <textarea
                value={directToken}
                onChange={(e) => setDirectToken(e.target.value)}
                placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOi..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono min-h-15 resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
        </div>
        )}

        {/* ─── MERCADO PAGO ─── */}
        {showMercadoPago && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/30">
                <CreditCard className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Mercado Pago</h2>
                <p className="text-xs text-muted-foreground">Pagamentos via Pix, cartão e boleto</p>
              </div>
            </div>
            {!isLoadingMercadoPago && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  mercadoPagoStatus?.connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {mercadoPagoStatus?.connected ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {mercadoPagoStatus?.connected ? 'Conectado' : 'Não conectado'}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {isLoadingMercadoPago ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando status do Mercado Pago...
              </div>
            ) : mercadoPagoStatus?.connected ? (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sua conta do Mercado Pago está conectada. Pagamentos via Pix, cartão de crédito/débito e boleto estão habilitados.
                  A plataforma retém 2% de comissão sobre cada venda.
                </p>
                {mercadoPagoStatus.mercadoPagoUserId && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">MP User ID:</span>{' '}
                    {mercadoPagoStatus.mercadoPagoUserId}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StatusCard label="Conta conectada" ok={mercadoPagoStatus.hasAccessToken} />
                  <StatusCard label="Public Key" ok={mercadoPagoStatus.hasPublicKey} />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conecte sua conta do Mercado Pago para receber pagamentos via Pix, cartão de crédito/débito e boleto diretamente na sua conta.
                </p>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-950/30">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <div className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed space-y-1">
                    <p className="font-semibold">Como funciona:</p>
                    <p>1. Clique em &quot;Conectar com Mercado Pago&quot; abaixo.</p>
                    <p>2. Você será redirecionado para o Mercado Pago para autorizar a plataforma.</p>
                    <p>3. Após autorizar, você voltará automaticamente ao painel.</p>
                    <p className="text-sky-600 dark:text-sky-400 font-medium">A plataforma retém 2% de comissão sobre cada venda.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!isLoadingMercadoPago && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3 bg-muted/30">
              {!mercadoPagoStatus?.connected && (
                <Button
                  size="sm"
                  onClick={() => openMercadoPagoAuthorizeMutation.mutate()}
                  disabled={openMercadoPagoAuthorizeMutation.isPending}
                >
                  {openMercadoPagoAuthorizeMutation.isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Conectar com Mercado Pago
                </Button>
              )}

              {mercadoPagoStatus?.connected && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: MERCADOPAGO_QUERY_KEY })}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Atualizar status
                  </Button>

                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja desconectar o Mercado Pago? Pagamentos via MP pararão de funcionar.')) {
                          disconnectMercadoPagoMutation.mutate();
                        }
                      }}
                      disabled={disconnectMercadoPagoMutation.isPending}
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
        )}
      </div>

      {mode === 'settings' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Modelo multi-tenant: cada loja conecta sua própria conta Stripe, Mercado Pago e Melhor Envio.
        </div>
      )}
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
