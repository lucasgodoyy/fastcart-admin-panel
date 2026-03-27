'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import {
  BarChart3, Facebook, Globe, TrendingUp, ArrowRight, CheckCircle2, Circle,
  Tag, Search, Mail, Star, MessageSquare, Flame, Code,
} from 'lucide-react';

interface Integration {
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

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-integrations'],
    queryFn: storeService.getMyStore,
  });

  const integrations: Integration[] = [
    // ── Analytics ──
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      description: t(
        'Acompanhe visitantes, conversões e comportamento na sua loja com o GA4.',
        'Track visitors, conversions, and behavior in your store with GA4.'
      ),
      icon: <BarChart3 className="h-8 w-8 text-yellow-500" />,
      href: '/admin/integrations/google-analytics',
      category: t('Analytics', 'Analytics'),
      connected: !!store?.googleAnalyticsId,
      statusLabel: store?.googleAnalyticsId
        ? `${t('Conectado', 'Connected')}: ${store.googleAnalyticsId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      description: t(
        'Gerencie todas as tags de marketing em um único lugar, sem alterar código.',
        'Manage all marketing tags in one place, without changing code.'
      ),
      icon: <Tag className="h-8 w-8 text-blue-500" />,
      href: '/admin/integrations/gtm',
      category: t('Analytics', 'Analytics'),
      connected: !!store?.gtmId,
      statusLabel: store?.gtmId
        ? `${t('Conectado', 'Connected')}: ${store.gtmId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'hotjar',
      name: 'Hotjar',
      description: t(
        'Mapas de calor e gravações de sessão para entender o comportamento dos visitantes.',
        'Heatmaps and session recordings to understand visitor behavior.'
      ),
      icon: <Flame className="h-8 w-8 text-orange-500" />,
      href: '/admin/integrations/hotjar',
      category: t('Analytics', 'Analytics'),
      connected: !!store?.hotjarId,
      statusLabel: store?.hotjarId
        ? `${t('Conectado', 'Connected')}: ${store.hotjarId}`
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
      icon: <Facebook className="h-8 w-8 text-blue-600" />,
      href: '/admin/integrations/facebook-pixel',
      category: t('Marketing', 'Marketing'),
      connected: !!store?.facebookPixelId,
      statusLabel: store?.facebookPixelId
        ? `${t('Conectado', 'Connected')}: ${store.facebookPixelId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: t(
        'Rastreie conversões do Google Ads para otimizar suas campanhas.',
        'Track Google Ads conversions to optimize your campaigns.'
      ),
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      href: '/admin/integrations/google-ads',
      category: t('Marketing', 'Marketing'),
      connected: !!store?.googleAdsId,
      statusLabel: store?.googleAdsId
        ? `${t('Conectado', 'Connected')}: ${store.googleAdsId}`
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: t(
        'Sincronize clientes e envie campanhas de email marketing automatizadas.',
        'Sync customers and send automated email marketing campaigns.'
      ),
      icon: <Mail className="h-8 w-8 text-yellow-600" />,
      href: '/admin/integrations/mailchimp',
      category: t('Marketing', 'Marketing'),
      connected: !!store?.mailchimpApiKey,
      statusLabel: store?.mailchimpApiKey
        ? t('Conectado', 'Connected')
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
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      href: '/admin/integrations/google-merchant',
      category: t('Canais de venda', 'Sales channels'),
      connected: !!store?.googleMerchantId,
      statusLabel: store?.googleMerchantId
        ? `${t('Conectado', 'Connected')}: ${store.googleMerchantId}`
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
      icon: <Search className="h-8 w-8 text-green-500" />,
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
      icon: <Search className="h-8 w-8 text-teal-500" />,
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
      icon: <Star className="h-8 w-8 text-amber-500" />,
      href: '/admin/integrations/ebit',
      category: t('Reputação', 'Reputation'),
      connected: !!store?.ebitId,
      statusLabel: store?.ebitId
        ? t('Conectado', 'Connected')
        : t('Não configurado', 'Not configured'),
    },
    {
      id: 'google-reviews',
      name: t('Google Avaliações', 'Google Customer Reviews'),
      description: t(
        'Colete avaliações de clientes via Google após a compra.',
        'Collect customer reviews via Google after purchase.'
      ),
      icon: <Star className="h-8 w-8 text-blue-500" />,
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
      icon: <Globe className="h-8 w-8 text-emerald-600" />,
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
      icon: <Code className="h-8 w-8 text-purple-500" />,
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
      icon: <MessageSquare className="h-8 w-8 text-indigo-500" />,
      href: '/admin/integrations/chat-widget',
      category: t('Infraestrutura', 'Infrastructure'),
      connected: !!store?.externalChatScript,
      statusLabel: store?.externalChatScript
        ? t('Ativo', 'Active')
        : t('Não configurado', 'Not configured'),
    },
  ];

  const categories = [...new Set(integrations.map((i) => i.category))];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('Integrações', 'Integrations')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t(
            'Conecte serviços externos para potencializar sua loja.',
            'Connect external services to power up your store.'
          )}
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations
              .filter((i) => i.category === cat)
              .map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => router.push(integration.href)}
                  className="group relative flex items-start gap-4 rounded-lg border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="shrink-0 rounded-lg bg-muted/60 p-3">
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{integration.name}</h3>
                      {integration.connected ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {integration.description}
                    </p>
                    <p className="text-xs mt-2 font-medium text-muted-foreground">
                      {integration.statusLabel}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-1" />
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
