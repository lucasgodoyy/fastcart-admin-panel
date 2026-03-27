'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import storeService from '@/services/storeService';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';
import {
  ArrowLeft, Globe, CheckCircle2, Copy, ExternalLink, Info, AlertTriangle,
} from 'lucide-react';

const PLATFORM_DOMAIN = 'rapidocart.com.br';

export function DomainsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [customDomain, setCustomDomain] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store-domains'],
    queryFn: storeService.getMyStore,
  });

  useEffect(() => {
    if (store && !loaded) {
      setCustomDomain(store.customDomain || '');
      setLoaded(true);
    }
  }, [store, loaded]);

  const saveDomainMutation = useMutation({
    mutationFn: (domain: string) =>
      storeService.updateMyStore({ customDomain: domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store-domains'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Domínio personalizado salvo!', 'Custom domain saved!'));
    },
    onError: () => {
      toast.error(t('Erro ao salvar domínio.', 'Error saving domain.'));
    },
  });

  const removeDomainMutation = useMutation({
    mutationFn: () => storeService.updateMyStore({ customDomain: '' }),
    onSuccess: () => {
      setCustomDomain('');
      queryClient.invalidateQueries({ queryKey: ['my-store-domains'] });
      queryClient.invalidateQueries({ queryKey: ['my-store-integrations'] });
      toast.success(t('Domínio personalizado removido.', 'Custom domain removed.'));
    },
  });

  const subdomain = store?.subdomain || store?.slug || '';
  const subdomainUrl = `${subdomain}.${PLATFORM_DOMAIN}`;
  const isDomainValid = customDomain.trim().length > 3 && /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(customDomain.trim().toLowerCase());
  const hasCustomDomain = !!store?.customDomain;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('Copiado!', 'Copied!'));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/integrations')}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5">
            <Globe className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t('Domínios', 'Domains')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Gerencie o endereço da sua loja', 'Manage your store address')}
            </p>
          </div>
        </div>
      </div>

      {/* Free subdomain section */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <h2 className="font-semibold text-sm">
            {t('Subdomínio gratuito', 'Free subdomain')}
          </h2>
        </div>

        <p className="text-xs text-muted-foreground">
          {t(
            'Sua loja já está disponível no endereço abaixo. Este subdomínio é criado automaticamente a partir do slug da sua loja.',
            'Your store is already available at the address below. This subdomain is automatically created from your store slug.'
          )}
        </p>

        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <code className="text-sm font-mono flex-1 truncate">{subdomainUrl}</code>
          <button
            onClick={() => copyToClipboard(`https://${subdomainUrl}`)}
            className="shrink-0 rounded-md p-1.5 hover:bg-muted transition-colors"
            title={t('Copiar', 'Copy')}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
          <a
            href={`https://${subdomainUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md p-1.5 hover:bg-muted transition-colors"
            title={t('Abrir', 'Open')}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {t(
              'O Google Analytics rastreia por domínio. Se sua loja usa o subdomínio, configure o GA com este endereço. Se usar domínio personalizado, configure com o domínio personalizado.',
              'Google Analytics tracks by domain. If your store uses the subdomain, configure GA with this address. If using a custom domain, configure with the custom domain.'
            )}
          </p>
        </div>
      </div>

      {/* Custom domain section */}
      <div className="rounded-lg border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-sm">
          {t('Domínio personalizado', 'Custom domain')}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({t('opcional', 'optional')})
          </span>
        </h2>

        <p className="text-xs text-muted-foreground">
          {t(
            'Conecte seu próprio domínio (ex: www.minhaloja.com.br) para dar uma identidade profissional à sua loja.',
            'Connect your own domain (e.g., www.mystore.com) to give your store a professional identity.'
          )}
        </p>

        <div>
          <label className="text-sm font-medium" htmlFor="custom-domain">
            {t('Domínio', 'Domain')}
          </label>
          <input
            id="custom-domain"
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
            placeholder="www.minhaloja.com.br"
            className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={255}
          />
          {customDomain && !isDomainValid && (
            <p className="text-xs text-red-500 mt-1">
              {t('Digite um domínio válido (ex: www.minhaloja.com.br)', 'Enter a valid domain (e.g., www.mystore.com)')}
            </p>
          )}
        </div>

        {/* DNS instructions */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {t('Configuração DNS necessária', 'DNS configuration required')}
            </span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {t(
              'Após salvar, configure um registro CNAME no seu provedor de DNS:',
              'After saving, configure a CNAME record in your DNS provider:'
            )}
          </p>
          <div className="font-mono text-xs bg-white dark:bg-black/30 rounded p-2.5 space-y-1">
            <div><span className="text-muted-foreground">Type:</span> <span className="font-semibold">CNAME</span></div>
            <div><span className="text-muted-foreground">Host:</span> <span className="font-semibold">{customDomain || 'www'}</span></div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-semibold">{subdomainUrl}</span>
              <button
                onClick={() => copyToClipboard(subdomainUrl)}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => saveDomainMutation.mutate(customDomain.trim())}
            disabled={!isDomainValid || saveDomainMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveDomainMutation.isPending
              ? t('Salvando...', 'Saving...')
              : t('Salvar domínio', 'Save domain')}
          </button>
          {hasCustomDomain && (
            <button
              onClick={() => removeDomainMutation.mutate()}
              disabled={removeDomainMutation.isPending}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              {t('Remover', 'Remove')}
            </button>
          )}
        </div>
      </div>

      {/* How Shopify does it */}
      <div className="rounded-lg border bg-muted/30 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {t('Como funciona', 'How it works')}
          </h3>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
          <li>
            {t(
              'Cada loja recebe um subdomínio gratuito: slug.rapidocart.com.br',
              'Each store gets a free subdomain: slug.rapidocart.com.br'
            )}
          </li>
          <li>
            {t(
              'O subdomínio é gerado a partir do slug da loja e é único na plataforma.',
              'The subdomain is generated from the store slug and is unique on the platform.'
            )}
          </li>
          <li>
            {t(
              'Você pode conectar seu próprio domínio apontando um CNAME para o seu subdomínio.',
              'You can connect your own domain by pointing a CNAME to your subdomain.'
            )}
          </li>
          <li>
            {t(
              'Após a propagação DNS (até 48h), sua loja estará acessível pelo domínio personalizado.',
              'After DNS propagation (up to 48h), your store will be accessible via the custom domain.'
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
