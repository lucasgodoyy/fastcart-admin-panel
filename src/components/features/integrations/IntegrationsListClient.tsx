'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import {
  BarChart3, Facebook, Globe, TrendingUp, ArrowRight, CheckCircle2, Circle,
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
      id: 'google-shopping',
      name: 'Google Shopping',
      description: t(
        'Exiba seus produtos nos resultados de compras do Google.',
        'Display your products in Google Shopping search results.'
      ),
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      href: '/admin/online-store/google-shopping',
      category: t('Canais de venda', 'Sales channels'),
      connected: !!store?.slug, // placeholder — Google Shopping has its own config
      statusLabel: t('Ver configuração', 'View configuration'),
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
                  className="group relative flex items-start gap-4 rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/30"
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
