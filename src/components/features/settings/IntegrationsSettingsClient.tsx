'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CreditCard, ShieldCheck, Truck } from 'lucide-react';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import integrationService from '@/services/integrationService';
import { MelhorEnvioConnectionStatus, StripeConnectStatus } from '@/types/integration';

const STRIPE_QUERY_KEY = ['integration', 'stripe-connect'];
const MELHOR_QUERY_KEY = ['integration', 'melhor-envio'];

export function IntegrationsSettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: stripeStatus, isLoading: isLoadingStripe } = useQuery<StripeConnectStatus>({
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
    onError: () => toast.error('Falha ao iniciar conexão com Stripe.'),
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

  return (
    <SettingsPageLayout
      title="Integrações"
      description="Conecte pagamentos e frete da loja no modelo SaaS."
    >
      <div className="grid gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Stripe Connect</h2>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            {isLoadingStripe
              ? 'Carregando status...'
              : stripeStatus?.connected
                ? `Conectado (${stripeStatus.accountStatus || 'PENDING'})`
                : 'Não conectado'}
          </div>

          {stripeStatus?.connected && (
            <div className="mb-4 space-y-1 text-xs text-muted-foreground">
              <p>Account ID: {stripeStatus.stripeAccountId}</p>
              <p>Onboarding: {stripeStatus.onboardingCompleted ? 'Completo' : 'Pendente'}</p>
              <p>Charges enabled: {stripeStatus.chargesEnabled ? 'Sim' : 'Não'}</p>
              <p>Payouts enabled: {stripeStatus.payoutsEnabled ? 'Sim' : 'Não'}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => openStripeOnboardingMutation.mutate()}
              disabled={openStripeOnboardingMutation.isPending}
            >
              {stripeStatus?.connected ? 'Continuar onboarding Stripe' : 'Conectar Stripe'}
            </Button>

            {stripeStatus?.connected && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openStripeDashboardMutation.mutate()}
                  disabled={openStripeDashboardMutation.isPending}
                >
                  Abrir dashboard Stripe
                </Button>

                <Button
                  variant="outline"
                  onClick={() => disconnectStripeMutation.mutate()}
                  disabled={disconnectStripeMutation.isPending}
                >
                  Desconectar Stripe
                </Button>
              </>
            )}
          </div>
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
