'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Globe, Shield, CheckCircle, Plus, ExternalLink, Loader2,
  Trash2, RefreshCw, Copy, ShoppingCart, AlertTriangle, X,
} from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import customDomainService, { CustomDomain } from '@/services/customDomainService';
import { toast } from 'sonner';

export function DomainsClient() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const { data: store, isLoading: loadingStore } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const { data: customDomains = [], isLoading: loadingDomains } = useQuery<CustomDomain[]>({
    queryKey: ['custom-domains'],
    queryFn: customDomainService.listDomains,
  });

  const addDomainMutation = useMutation({
    mutationFn: (domain: string) => customDomainService.addDomain(domain),
    onSuccess: () => {
      toast.success('Domínio adicionado! Configure os registros DNS abaixo.');
      setNewDomain('');
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
    },
    onError: () => toast.error('Falha ao adicionar domínio. Verifique se já não está em uso.'),
  });

  const verifyMutation = useMutation({
    mutationFn: (domainId: number) => customDomainService.verifyDomain(domainId),
    onSuccess: () => {
      toast.success('Domínio verificado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
    },
    onError: () => toast.error('Falha na verificação DNS. Verifique os registros e tente novamente.'),
  });

  const removeMutation = useMutation({
    mutationFn: (domainId: number) => customDomainService.removeDomain(domainId),
    onSuccess: () => {
      toast.success('Domínio removido.');
      queryClient.invalidateQueries({ queryKey: ['custom-domains'] });
    },
    onError: () => toast.error('Falha ao remover domínio.'),
  });

  const storefrontBase = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
  const storeUrl = store ? `${storefrontBase}/?storeSlug=${store.slug}` : '';

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <SettingsPageLayout
      title="Domínios"
      description="O domínio é o endereço de sua loja na internet. Gerencie domínios personalizados e configure DNS."
      helpText="Mais sobre domínios"
      helpHref="#"
    >
      {/* Default subdomain */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Subdomínio padrão</p>

        {loadingStore ? (
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Ativado
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Shield className="h-3 w-3" />
                    SSL ativado
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom domains */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Domínios personalizados</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? 'Cancelar' : 'Adicionar domínio'}
          </Button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Digite o domínio que deseja usar (ex: <strong>www.minhaloja.com.br</strong>).
            </p>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="www.minhaloja.com.br"
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => {
                  const trimmed = newDomain.trim();
                  if (!trimmed) {
                    toast.error('Digite um domínio.');
                    return;
                  }
                  addDomainMutation.mutate(trimmed);
                }}
                disabled={addDomainMutation.isPending || !newDomain.trim()}
              >
                {addDomainMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {/* Domain list */}
        {loadingDomains ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : customDomains.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Nenhum domínio personalizado configurado.
          </p>
        ) : (
          <div className="space-y-3">
            {customDomains.map((domain) => (
              <div key={domain.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{domain.domain}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        domain.verified
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {domain.verified ? (
                        <><CheckCircle className="h-3 w-3" /> Verificado</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3" /> Pendente</>
                      )}
                    </span>
                    {domain.sslActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Shield className="h-3 w-3" /> SSL
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!domain.verified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => verifyMutation.mutate(domain.id)}
                        disabled={verifyMutation.isPending}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${verifyMutation.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Remover este domínio?')) {
                          removeMutation.mutate(domain.id);
                        }
                      }}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* DNS instructions */}
                {!domain.verified && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-3 space-y-2">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                      Configure os registros DNS no seu provedor de domínio:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded bg-background/80 px-3 py-2 text-xs">
                        <div>
                          <span className="font-medium text-foreground">CNAME</span>
                          <span className="mx-2 text-muted-foreground">&rarr;</span>
                          <code className="font-mono text-foreground">{domain.cnameTarget}</code>
                        </div>
                        <button onClick={() => copyText(domain.cnameTarget)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded bg-background/80 px-3 py-2 text-xs">
                        <div>
                          <span className="font-medium text-foreground">TXT</span>
                          <span className="mx-2 text-muted-foreground">&rarr;</span>
                          <code className="font-mono text-foreground break-all">{domain.txtRecord}</code>
                        </div>
                        <button onClick={() => copyText(domain.txtRecord)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-500">
                      Após configurar, clique no botão de verificação. A propagação DNS pode levar até 48 horas.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy domain — coming soon */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Comprar domínio</p>
            <p className="text-xs text-muted-foreground">
              Registre um novo domínio diretamente pela plataforma.
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-1.5" disabled>
          <ShoppingCart className="h-4 w-4" />
          Comprar domínio (em breve)
        </Button>
      </div>

      {/* Learn more */}
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
