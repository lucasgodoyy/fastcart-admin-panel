'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import storeService from '@/services/storeService';
import integrationService from '@/services/integrationService';
import { t } from '@/lib/admin-language';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, Facebook, Globe, TrendingUp, CheckCircle2, AlertTriangle, XCircle,
  Tag, Search, Mail, Star, MessageSquare, Flame, Code, Zap, Loader2,
  ExternalLink, Link2, Link2Off, CreditCard, Truck, ShoppingCart, ArrowRight,
} from 'lucide-react';
import { StripeConnectStatus, MelhorEnvioConnectionStatus, MercadoPagoStatus } from '@/types/integration';

/* ─── Stripe helpers ─── */
function getStripeState(status?: StripeConnectStatus) {
  if (!status || !status.connected) return 'NOT_CONNECTED';
  if (status.chargesEnabled && status.payoutsEnabled) return 'ACTIVE';
  if (status.pendingReview) return 'REVIEW_PENDING';
  if (status.onboardingCompleted) return 'RESTRICTED';
  return 'ONBOARDING_PENDING';
}

type OAuthStatus = 'active' | 'pending' | 'restricted' | 'review' | 'disconnected';

function statusBadge(status: OAuthStatus) {
  const map: Record<OAuthStatus, { label: string; className: string; icon: React.ReactNode }> = {
    active:       { label: 'Ativo',              className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    pending:      { label: 'Pendente',           className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',           icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    restricted:   { label: 'Ação necessária',    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',           icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    review:       { label: 'Em análise',         className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800',                       icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
    disconnected: { label: 'Não conectado',      className: 'bg-muted text-muted-foreground border-border',                                                                           icon: <XCircle className="h-3.5 w-3.5" /> },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.className}`}>
      {m.icon} {m.label}
    </span>
  );
}

interface ConfigIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
  connected: boolean;
  statusLabel: string;
}

export function IntegrationsListClient() {
  const router = useRouter();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['my-store-integrations'],
    queryFn: storeService.getMyStore,
  });

  const { data: stripeStatus, isLoading: stripeLoading } = useQuery({
    queryKey: ['integration', 'stripe-connect'],
    queryFn: integrationService.getStripeStatus,
    retry: false,
  });

  const { data: meStatus, isLoading: meLoading } = useQuery({
    queryKey: ['integration', 'melhor-envio'],
    queryFn: integrationService.getMelhorEnvioStatus,
    retry: false,
  });

  const { data: mpStatus, isLoading: mpLoading } = useQuery({
    queryKey: ['integration', 'mercadopago'],
    queryFn: integrationService.getMercadoPagoStatus,
    retry: false,
  });

  /* Stripe mutations */
  const stripeOnboarding = useMutation({
    mutationFn: integrationService.createStripeOnboardingLink,
    onSuccess: (res) => { window.open(res.onboardingUrl, '_blank'); },
    onError: () => toast.error('Erro ao gerar link do Stripe.'),
  });

  const stripeDashboard = useMutation({
    mutationFn: integrationService.createStripeDashboardLink,
    onSuccess: (res) => { window.open(res.dashboardUrl, '_blank'); },
    onError: () => toast.error('Erro ao acessar dashboard do Stripe.'),
  });

  /* Melhor Envio mutation */
  const meConnect = useMutation({
    mutationFn: integrationService.getMelhorEnvioAuthorizeUrl,
    onSuccess: (res) => { window.location.href = res.authorizeUrl; },
    onError: () => toast.error('Erro ao gerar URL de autorização do Melhor Envio.'),
  });

  /* Mercado Pago mutation */
  const mpConnect = useMutation({
    mutationFn: integrationService.getMercadoPagoAuthorizeUrl,
    onSuccess: (res) => { window.location.href = res.authorizeUrl; },
    onError: () => toast.error('Erro ao gerar URL de autorização do Mercado Pago.'),
  });

  const stripeState = getStripeState(stripeStatus);
  const meConnected = meStatus?.connected ?? false;
  const mpConnected = mpStatus?.connected ?? false;

  /* ── Config integrations (analytics / marketing / infra) ── */
  const configIntegrations: ConfigIntegration[] = [
    // ── Analytics ──
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      description: t(
        'Acompanhe visitantes, conversões e comportamento na sua loja com o GA4.',
        'Track visitors, conversions, and behavior in your store with GA4.'
      ),
      icon: <BarChart3 className="h-6 w-6 text-yellow-500" />,
      href: '/admin/integrations/google-analytics',
      category: t('Analytics', 'Analytics'),
      connected: !!store?.googleAnalyticsId,
      statusLabel: store?.googleAnalyticsId
        ? `ID: ${store.googleAnalyticsId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      description: t(
        'Gerencie todas as tags de marketing em um único lugar, sem alterar código.',
        'Manage all marketing tags in one place, without changing code.'
      ),
      icon: <Tag className="h-6 w-6 text-blue-500" />,
      href: '/admin/integrations/gtm',
      category: t('Analytics', 'Analytics'),
      connected: !!store?.gtmId,
      statusLabel: store?.gtmId
        ? `ID: ${store.gtmId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'hotjar',
      name: 'Hotjar',
      description: t(
        'Mapas de calor e gravações de sessão para entender o comportamento dos visitantes.',
        'Heatmaps and session recordings to understand visitor behavior.'
      ),
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      href: '/admin/integrations/hotjar',
      category: t('Analytics', 'Analytics'),
      connected: !!store?.hotjarId,
      statusLabel: store?.hotjarId
        ? `ID: ${store.hotjarId}`
        : t('Não configurado', 'Not configured'),
    },
    // ── Marketing ──
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel (Meta)',
      description: t(
        'Rastreie conversões do Facebook e Instagram Ads e crie públicos de remarketing.',
        'Track Facebook and Instagram Ads conversions and build remarketing audiences.'
      ),
      icon: <Facebook className="h-6 w-6 text-blue-600" />,
      href: '/admin/integrations/facebook-pixel',
      category: t('Marketing', 'Marketing'),
      connected: !!store?.facebookPixelId,
      statusLabel: store?.facebookPixelId
        ? `ID: ${store.facebookPixelId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: t(
        'Rastreie conversões do Google Ads para otimizar suas campanhas.',
        'Track Google Ads conversions to optimize your campaigns.'
      ),
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      href: '/admin/integrations/google-ads',
      category: t('Marketing', 'Marketing'),
      connected: !!store?.googleAdsId,
      statusLabel: store?.googleAdsId
        ? `ID: ${store.googleAdsId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: t(
        'Sincronize clientes e envie campanhas de email marketing automatizadas.',
        'Sync customers and send automated email marketing campaigns.'
      ),
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      href: '/admin/integrations/mailchimp',
      category: t('Marketing', 'Marketing'),
      connected: !!store?.mailchimpApiKey,
      statusLabel: store?.mailchimpApiKey
        ? t('API Key configurada', 'API Key configured')
        : t('Não configurado', 'Not configured'),
    },
    // ── Canais de Venda ──
    {
      id: 'google-shopping',
      name: 'Google Shopping',
      description: t(
        'Exiba seus produtos nos resultados de compras do Google.',
        'Display your products in Google Shopping search results.'
      ),
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      href: '/admin/integrations/google-merchant',
      category: t('Canais de venda', 'Sales channels'),
      connected: !!store?.googleMerchantId,
      statusLabel: store?.googleMerchantId
        ? `ID: ${store.googleMerchantId}`
        : t('Não configurado', 'Not configured'),
    },
    // ── SEO & Verificação ──
    {
      id: 'google-verification',
      name: t('Verificação Google', 'Google Verification'),
      description: t(
        'Verifique sua loja no Google Search Console com a meta tag.',
        'Verify your store in Google Search Console with the meta tag.'
      ),
      icon: <Search className="h-6 w-6 text-green-500" />,
      href: '/admin/integrations/verification-tags',
      category: t('SEO & Verificação', 'SEO & Verification'),
      connected: !!store?.googleVerificationTag,
      statusLabel: store?.googleVerificationTag
        ? t('Verificado', 'Verified')
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'bing-verification',
      name: t('Verificação Bing', 'Bing Verification'),
      description: t(
        'Verifique sua loja no Bing Webmaster Tools.',
        'Verify your store in Bing Webmaster Tools.'
      ),
      icon: <Search className="h-6 w-6 text-teal-500" />,
      href: '/admin/integrations/verification-tags',
      category: t('SEO & Verificação', 'SEO & Verification'),
      connected: !!store?.bingVerificationTag,
      statusLabel: store?.bingVerificationTag
        ? t('Verificado', 'Verified')
        : t('Não configurado', 'Not configured'),
    },
    // ── Reputação ──
    {
      id: 'ebit',
      name: 'Ebit / Reclame Aqui',
      description: t(
        'Exiba selo de reputação e colete avaliações de clientes pós-compra.',
        'Display reputation badge and collect post-purchase customer reviews.'
      ),
      icon: <Star className="h-6 w-6 text-amber-500" />,
      href: '/admin/integrations/ebit',
      category: t('Reputação', 'Reputation'),
      connected: !!store?.ebitId,
      statusLabel: store?.ebitId
        ? `ID: ${store.ebitId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'google-reviews',
      name: t('Google Avaliações', 'Google Customer Reviews'),
      description: t(
        'Colete avaliações de clientes via Google após a compra.',
        'Collect customer reviews via Google after purchase.'
      ),
      icon: <Star className="h-6 w-6 text-blue-500" />,
      href: '/admin/integrations/google-reviews',
      category: t('Reputação', 'Reputation'),
      connected: store?.googleCustomerReviewsEnabled === true,
      statusLabel: store?.googleCustomerReviewsEnabled
        ? t('Ativo', 'Active')
        : t('Desativado', 'Disabled'),
    },
    // ── Infraestrutura ──
    {
      id: 'domains',
      name: t('Domínios', 'Domains'),
      description: t(
        'Gerencie seu subdomínio gratuito e configure um domínio personalizado.',
        'Manage your free subdomain and configure a custom domain.'
      ),
      icon: <Globe className="h-6 w-6 text-emerald-600" />,
      href: '/admin/integrations/domains',
      category: t('Infraestrutura', 'Infrastructure'),
      connected: !!store?.subdomain,
      statusLabel: store?.subdomain
        ? `${store.subdomain}.rapidocart.com.br`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'conversion-codes',
      name: t('Códigos de Conversão', 'Conversion Codes'),
      description: t(
        'Insira scripts no checkout e na página de confirmação para rastreio de conversões.',
        'Insert scripts in checkout and confirmation pages for conversion tracking.'
      ),
      icon: <Code className="h-6 w-6 text-purple-500" />,
      href: '/admin/integrations/conversion-codes',
      category: t('Infraestrutura', 'Infrastructure'),
      connected: !!store?.conversionCodeCheckout || !!store?.conversionCodeConfirmation,
      statusLabel: store?.conversionCodeCheckout || store?.conversionCodeConfirmation
        ? t('Configurado', 'Configured')
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'chat-widget',
      name: t('Chat / Widget Externo', 'External Chat / Widget'),
      description: t(
        'Adicione um widget de chat (Tawk.to, Crisp, JivoChat, etc.) à sua loja.',
        'Add a chat widget (Tawk.to, Crisp, JivoChat, etc.) to your store.'
      ),
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
      href: '/admin/integrations/chat-widget',
      category: t('Infraestrutura', 'Infrastructure'),
      connected: !!store?.externalChatScript,
      statusLabel: store?.externalChatScript
        ? t('Ativo', 'Active')
        : t('Não configurado', 'Not configured'),
    },
    // ── Automações ──
    {
      id: 'zapier',
      name: 'Zapier',
      description: t(
        'Conecte sua loja a mais de 7.000 aplicativos com webhooks automáticos.',
        'Connect your store to 7,000+ apps with automatic webhooks.'
      ),
      icon: <Zap className="h-6 w-6 text-orange-500" />,
      href: '/admin/integrations/zapier',
      category: t('Automações', 'Automations'),
      connected: false,
      statusLabel: t('Não configurado', 'Not configured'),
    },
  ];

  const categories = [...new Set(configIntegrations.map((i) => i.category))];
  const isLoading = storeLoading || stripeLoading || meLoading || mpLoading;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  /* ── Stripe CTA ── */
  function StripeAction() {
    const busy = stripeOnboarding.isPending || stripeDashboard.isPending;
    switch (stripeState) {
      case 'ACTIVE':
        return (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => stripeDashboard.mutate()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <ExternalLink className="h-4 w-4 mr-1.5" />}
            {t('Acessar dashboard', 'Access dashboard')}
          </Button>
        );
      case 'REVIEW_PENDING':
        return (
          <Button size="sm" variant="outline" disabled onClick={() => stripeOnboarding.mutate()}>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            {t('Em análise...', 'Under review...')}
          </Button>
        );
      case 'ONBOARDING_PENDING':
        return (
          <Button size="sm" disabled={busy} onClick={() => stripeOnboarding.mutate()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Link2 className="h-4 w-4 mr-1.5" />}
            {t('Completar cadastro', 'Complete signup')}
          </Button>
        );
      case 'RESTRICTED':
        return (
          <Button size="sm" variant="destructive" disabled={busy} onClick={() => stripeOnboarding.mutate()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <AlertTriangle className="h-4 w-4 mr-1.5" />}
            {t('Resolver pendências', 'Resolve issues')}
          </Button>
        );
      default:
        return (
          <div className="flex flex-col gap-2">
            <Button size="sm" disabled={busy} onClick={() => stripeOnboarding.mutate()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Link2 className="h-4 w-4 mr-1.5" />}
              {t('Conectar Stripe', 'Connect Stripe')}
            </Button>
            <a
              href="https://dashboard.stripe.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground underline text-center"
            >
              {t('Não tem conta? Criar gratuitamente', "Don't have an account? Create for free")}
            </a>
          </div>
        );
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Integrações', 'Integrations')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t(
            'Conecte serviços externos à sua loja. Diferente dos Aplicativos (recursos internos), aqui você vincula contas de terceiros.',
            'Connect external services to your store. Unlike Apps (internal features), here you link third-party accounts.'
          )}
        </p>
      </div>

      {/* ── Seção: Pagamento & Frete (OAuth) ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('Pagamento & Frete', 'Payment & Shipping')}
          </span>
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            {t('Conexão via OAuth — conta externa necessária', 'OAuth connection — external account required')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Stripe */}
          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 p-2.5">
                  <CreditCard className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Stripe</p>
                  <p className="text-xs text-muted-foreground">{t('Cartão de crédito / débito', 'Credit / debit card')}</p>
                </div>
              </div>
              {statusBadge(
                stripeState === 'ACTIVE' ? 'active'
                  : stripeState === 'REVIEW_PENDING' ? 'review'
                  : stripeState === 'RESTRICTED' ? 'restricted'
                  : stripeState === 'ONBOARDING_PENDING' ? 'pending'
                  : 'disconnected'
              )}
            </div>
            {stripeStatus?.stripeAccountId && (
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 truncate">
                {stripeStatus.stripeAccountId}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex-1">
              {stripeState === 'ACTIVE'
                ? t('Recebimentos e repasses ativos. Acesse o dashboard para ver transações.', 'Payouts active. Access dashboard to view transactions.')
                : stripeState === 'RESTRICTED'
                ? t('O Stripe requer informações adicionais para manter sua conta ativa.', 'Stripe requires additional information to keep your account active.')
                : stripeState === 'ONBOARDING_PENDING'
                ? t('Você iniciou o cadastro mas não concluiu. Complete para ativar os pagamentos.', 'You started signup but did not finish. Complete to activate payments.')
                : stripeState === 'REVIEW_PENDING'
                ? t('O Stripe está analisando seus dados. Aguarde o retorno por email.', 'Stripe is reviewing your data. Wait for their email.')
                : t('Receba pagamentos com cartão direto na sua conta bancária via Stripe Connect.', 'Receive card payments directly to your bank via Stripe Connect.')}
            </p>
            <StripeAction />
          </div>

          {/* Mercado Pago */}
          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-50 dark:bg-sky-950/30 p-2.5">
                  <ShoppingCart className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Mercado Pago</p>
                  <p className="text-xs text-muted-foreground">{t('Cartão, Pix, boleto', 'Card, Pix, boleto')}</p>
                </div>
              </div>
              {statusBadge(mpConnected ? 'active' : 'disconnected')}
            </div>
            {mpStatus?.mercadoPagoUserId && (
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 truncate">
                {t('Usuário', 'User')}: {mpStatus.mercadoPagoUserId}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex-1">
              {mpConnected
                ? t('Conta vinculada. Aceite Pix, cartão e boleto de forma transparente.', 'Account linked. Accept Pix, card and boleto transparently.')
                : t('Aceite Pix, cartão, boleto e parcelamento. Vincula sua conta Mercado Pago via OAuth.', 'Accept Pix, card, boleto and installments. Link your Mercado Pago account via OAuth.')}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant={mpConnected ? 'outline' : 'default'}
                disabled={mpConnect.isPending}
                onClick={mpConnected
                  ? () => router.push('/admin/settings/integrations')
                  : () => mpConnect.mutate()}
              >
                {mpConnect.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  : mpConnected
                    ? <ExternalLink className="h-4 w-4 mr-1.5" />
                    : <Link2 className="h-4 w-4 mr-1.5" />}
                {mpConnected
                  ? t('Gerenciar', 'Manage')
                  : t('Conectar conta', 'Connect account')}
              </Button>
              {!mpConnected && (
                <a
                  href="https://www.mercadopago.com.br/hub/registration/start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground underline text-center"
                >
                  {t('Não tem conta? Criar gratuitamente', "Don't have an account? Create for free")}
                </a>
              )}
            </div>
          </div>

          {/* Melhor Envio */}
          <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Melhor Envio</p>
                  <p className="text-xs text-muted-foreground">{t('Frete / cotação / etiquetas', 'Shipping / quotes / labels')}</p>
                </div>
              </div>
              {statusBadge(meConnected ? 'active' : 'disconnected')}
            </div>
            {meStatus?.expiresAt && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                {t('Token expira em', 'Token expires on')}: {new Date(meStatus.expiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex-1">
              {meConnected
                ? t('Conta vinculada. Cotações, rastreio e etiquetas disponíveis.', 'Account linked. Quotes, tracking and labels available.')
                : t('Calcule frete (Correios, Loggi, Jadlog etc.), gere etiquetas e rastreie pedidos via Melhor Envio.', 'Calculate shipping (Correios, Loggi, Jadlog etc.), generate labels and track orders via Melhor Envio.')}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant={meConnected ? 'outline' : 'default'}
                disabled={meConnect.isPending}
                onClick={meConnected
                  ? () => router.push('/admin/shipping')
                  : () => meConnect.mutate()}
              >
                {meConnect.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  : meConnected
                    ? <ExternalLink className="h-4 w-4 mr-1.5" />
                    : <Link2 className="h-4 w-4 mr-1.5" />}
                {meConnected
                  ? t('Gerenciar envios', 'Manage shipping')
                  : t('Conectar via OAuth', 'Connect via OAuth')}
              </Button>
              {!meConnected && (
                <a
                  href="https://melhorenvio.com.br/painel/cadastro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground underline text-center"
                >
                  {t('Não tem conta? Criar gratuitamente', "Don't have an account? Create for free")}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Seções: Analytics, Marketing, etc. ── */}
      {categories.map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cat}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {configIntegrations.filter((i) => i.category === cat).map((integration) => (
              <div
                key={integration.id}
                className="flex items-center gap-4 rounded-lg border bg-card p-4"
              >
                <div className="shrink-0 rounded-lg bg-muted/60 p-2.5">
                  {integration.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{integration.name}</p>
                    {integration.connected
                      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> {t('Configurado', 'Configured')}</span>
                      : <span className="text-xs text-muted-foreground">{t('Não configurado', 'Not configured')}</span>
                    }
                  </div>
                  {integration.connected && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{integration.statusLabel}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={integration.connected ? 'outline' : 'ghost'}
                  className="shrink-0"
                  onClick={() => router.push(integration.href)}
                >
                  {integration.connected ? t('Editar', 'Edit') : t('Configurar', 'Configure')}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
