'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Puzzle, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import storeAppService from '@/services/admin/storeAppService';
import { StoreApp } from '@/types/store-app';
import { t } from '@/lib/admin-language';

const APP_LABELS: Record<string, { name: string; description: string; category: string }> = {
  abandoned_cart: { name: 'Carrinho Abandonado', description: 'Recuperação automática de carrinhos', category: 'Conversão' },
  coupons: { name: 'Cupons', description: 'Cupons de desconto por percentual ou valor fixo', category: 'Conversão' },
  promotions: { name: 'Promoções', description: 'Promoções compre X pague Y', category: 'Conversão' },
  free_shipping: { name: 'Frete Grátis', description: 'Regras de frete grátis por valor ou região', category: 'Conversão' },
  upsell: { name: 'Upsell & Cross-sell', description: 'Ofertas de produtos complementares', category: 'Conversão' },
  countdown_timer: { name: 'Countdown Timer', description: 'Contadores regressivos de urgência', category: 'Conversão' },
  reviews: { name: 'Avaliações', description: 'Avaliações e notas de produtos', category: 'Confiança' },
  faq: { name: 'FAQ / Perguntas Frequentes', description: 'Base de perguntas e respostas', category: 'Confiança' },
  email_marketing: { name: 'E-mail Marketing', description: 'Campanhas de e-mail automatizadas', category: 'Marketing' },
  newsletter: { name: 'Newsletter', description: 'Captação de leads via newsletter', category: 'Marketing' },
  affiliates: { name: 'Afiliados', description: 'Programa de afiliados com comissões', category: 'Marketing' },
  google_shopping: { name: 'Google Shopping', description: 'Feed de produtos para Google Shopping', category: 'Marketing' },
  chat: { name: 'Chat ao Vivo', description: 'Chat em tempo real com clientes', category: 'Comunicação' },
  whatsapp: { name: 'WhatsApp', description: 'Botão de atendimento via WhatsApp', category: 'Comunicação' },
  blog: { name: 'Blog', description: 'Blog integrado para SEO e conteúdo', category: 'Conteúdo' },
  custom_domains: { name: 'Domínios Personalizados', description: 'Domínios próprios na loja', category: 'Infra' },
  analytics: { name: 'Analytics', description: 'Métricas e estatísticas avançadas', category: 'Analytics' },
  inventory_management: { name: 'Gestão de Estoque', description: 'Controle avançado de estoque', category: 'Operações' },
  returns: { name: 'Devoluções & Trocas', description: 'Fluxo de devoluções e trocas', category: 'Operações' },
  loyalty: { name: 'Programa de Fidelidade', description: 'Pontos e recompensas para clientes', category: 'Conversão' },
  product_subscriptions: { name: 'Assinaturas de Produto', description: 'Compras recorrentes automáticas', category: 'Conversão' },
  nfe: { name: 'Nota Fiscal (NF-e)', description: 'Emissão de notas fiscais eletrônicas', category: 'Operações' },
  gift_cards: { name: 'Gift Cards', description: 'Cartões-presente da loja', category: 'Conversão' },
};

const CATEGORIES = ['Conversão', 'Confiança', 'Marketing', 'Comunicação', 'Conteúdo', 'Operações', 'Infra', 'Analytics'];

export function StoreAppsClient() {
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery<StoreApp[]>({
    queryKey: ['store-apps'],
    queryFn: storeAppService.list,
  });

  const initMutation = useMutation({
    mutationFn: storeAppService.initialize,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-apps'] });
      toast.success(t('Apps inicializados!', 'Apps initialized!'));
    },
    onError: () => toast.error(t('Erro ao inicializar apps', 'Error initializing apps')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ appKey, enabled }: { appKey: string; enabled: boolean }) =>
      storeAppService.toggle(appKey, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-apps'] });
    },
    onError: () => toast.error(t('Erro ao atualizar app', 'Error updating app')),
  });

  const appMap = new Map(apps.map(a => [a.appKey, a]));

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    apps: Object.entries(APP_LABELS)
      .filter(([, meta]) => meta.category === cat)
      .map(([key, meta]) => ({ key, ...meta, app: appMap.get(key) })),
  })).filter(g => g.apps.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Aplicativos da Loja', 'Store Apps')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Ative ou desative funcionalidades da sua loja.', 'Toggle store features on or off.')}
          </p>
        </div>
        {apps.length === 0 && (
          <Button onClick={() => initMutation.mutate()} disabled={initMutation.isPending}>
            <Puzzle className="h-4 w-4 mr-2" />
            {t('Inicializar Apps', 'Initialize Apps')}
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {grouped.map(({ category, apps: categoryApps }) => (
          <div key={category}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryApps.map(({ key, name, description, app }) => {
                const enabled = app?.enabled ?? false;
                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate({ appKey: key, enabled: !enabled })}
                      disabled={toggleMutation.isPending || !app}
                      className="shrink-0 mt-0.5"
                    >
                      {enabled ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
