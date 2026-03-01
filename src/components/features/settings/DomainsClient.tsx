'use client';

import { useQuery } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Globe, Shield, CheckCircle, Plus, ExternalLink, Loader2 } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';

export function DomainsClient() {
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const storefrontBase = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
  const storeUrl = store ? `${storefrontBase}/?storeSlug=${store.slug}` : '';

  return (
    <SettingsPageLayout
      title="Domínios"
      description="O domínio é o endereço de sua loja na internet. Você pode ter mais de um e gerenciá-los aqui."
      helpText="Mais sobre domínios"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Administre seus domínios</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{store?.slug || '—'}.lojaki.store</p>
                <p className="text-xs text-muted-foreground mt-0.5 break-all">{storeUrl}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Por padrão</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Ativado
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    <Shield className="h-3 w-3" />
                    SSL ativado
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button variant="outline" className="gap-1.5" disabled>
          <Plus className="h-4 w-4" />
          Adicionar domínio personalizado (em breve)
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Aprenda mais</p>

        {[
          {
            title: 'Configure seu domínio',
            desc: 'Use um domínio próprio para destacar a identidade da sua marca.',
          },
          {
            title: 'Verifique a configuração',
            desc: 'Siga estes passos para revisar se seu domínio ficou corretamente vinculado.',
          },
          {
            title: 'Consulte o vencimento',
            desc: 'Identifique se o registro do seu domínio deve ser renovado em breve.',
          },
          {
            title: 'Certificado de segurança',
            desc: 'Saiba se seu certificado de segurança está ativo.',
          },
        ].map((item) => (
          <a
            key={item.title}
            href="#"
            className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent/50 group"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-xs text-primary flex items-center gap-1 shrink-0 ml-2">
              Ver tutorial
              <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        ))}
      </div>
    </SettingsPageLayout>
  );
}
