'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Globe,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Copy,
  Settings2,
  Rss,
  BarChart3,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import googleShoppingService, { GoogleShoppingConfig } from '@/services/googleShoppingService';

const SYNC_FREQ_OPTIONS = [
  { value: 'HOURLY', label: 'A cada hora' },
  { value: 'DAILY', label: 'Diário' },
  { value: 'WEEKLY', label: 'Semanal' },
];

const COUNTRY_OPTIONS = [
  { value: 'BR', label: 'Brasil' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'PT', label: 'Portugal' },
];

const LANGUAGE_OPTIONS = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'SYNCED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle2 className="h-3 w-3" /> Sincronizado
        </span>
      );
    case 'ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
          <XCircle className="h-3 w-3" /> Erro
        </span>
      );
    case 'SYNCING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
          <Loader2 className="h-3 w-3 animate-spin" /> Sincronizando
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" /> Nunca sincronizado
        </span>
      );
  }
}

export function GoogleShoppingClient() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<GoogleShoppingConfig>({
    queryKey: ['google-shopping-config'],
    queryFn: googleShoppingService.getConfig,
  });

  const [merchantId, setMerchantId] = useState('');
  const [targetCountry, setTargetCountry] = useState('BR');
  const [contentLanguage, setContentLanguage] = useState('pt');
  const [syncFrequency, setSyncFrequency] = useState('DAILY');
  const [enabled, setEnabled] = useState(false);
  const [verificationTag, setVerificationTag] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize form from config
  if (config && !initialized) {
    setMerchantId(config.merchantId || '');
    setTargetCountry(config.targetCountry || 'BR');
    setContentLanguage(config.contentLanguage || 'pt');
    setSyncFrequency(config.syncFrequency || 'DAILY');
    setEnabled(config.enabled);
    setVerificationTag(config.verificationTag || '');
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: googleShoppingService.updateConfig,
    onSuccess: () => {
      toast.success('Configuração salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-config'] });
    },
    onError: () => toast.error('Falha ao salvar configuração.'),
  });

  const syncMutation = useMutation({
    mutationFn: googleShoppingService.syncNow,
    onSuccess: () => {
      toast.success('Feed sincronizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-config'] });
    },
    onError: () => toast.error('Falha ao sincronizar feed.'),
  });

  const handleSave = () => {
    updateMutation.mutate({
      enabled,
      merchantId: merchantId.trim() || undefined,
      targetCountry,
      contentLanguage,
      syncFrequency,
      verificationTag: verificationTag.trim() || undefined,
    });
  };

  const hasVerificationTag = verificationTag.trim().length > 0;
  const hasMerchantId = merchantId.trim().length > 0;
  const hasFeedUrl = Boolean(config?.feedUrl);

  const copyFeedUrl = () => {
    if (config?.feedUrl) {
      navigator.clipboard.writeText(window.location.origin + config.feedUrl);
      toast.success('URL do feed copiada!');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando configuração do Google Shopping...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
              <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Google Shopping</h1>
              <p className="text-sm text-muted-foreground">
                Mostre seus produtos no Google Shopping e aumente suas vendas.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="gs-enabled" className="text-sm font-medium">
            {enabled ? 'Ativo' : 'Inativo'}
          </Label>
          <Switch
            id="gs-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>

      {/* Stats */}
      {config && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Produtos no feed</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{config.productCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Erros</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{config.errorCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Status</span>
            </div>
            <div className="mt-1">
              <StatusBadge status={config.syncStatus} />
            </div>
          </div>
        </div>
      )}

      {/* Setup checklist */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Checklist de configuração</h2>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">1) Verificação do domínio</p>
              <p className="text-xs text-muted-foreground">
                Cole o token em <strong>Tag de verificação do Google</strong> e salve.
              </p>
            </div>
            {hasVerificationTag ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Concluído
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Pendente
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">2) Merchant Center ID</p>
              <p className="text-xs text-muted-foreground">
                Preencha o ID da conta Merchant Center e salve.
              </p>
            </div>
            {hasMerchantId ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Concluído
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Pendente
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">3) Feed cadastrado no Google</p>
              <p className="text-xs text-muted-foreground">
                Copie a URL do feed abaixo e cadastre no Merchant Center como fonte de dados.
              </p>
            </div>
            {hasFeedUrl ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                <Globe className="h-3.5 w-3.5" /> Pronto para cadastrar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Pendente
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Observação: o cadastro final do feed no Merchant Center é uma ação manual do lojista no Google.
          </p>
        </div>
      </div>

      {/* Merchant Center Config */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Google Merchant Center</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="merchant-id">Merchant Center ID</Label>
            <Input
              id="merchant-id"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="Ex: 123456789"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Encontre seu ID no{' '}
              <a
                href="https://merchants.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-0.5"
              >
                Google Merchant Center <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-country">País alvo</Label>
              <select
                id="target-country"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-language">Idioma do conteúdo</Label>
              <select
                id="content-language"
                value={contentLanguage}
                onChange={(e) => setContentLanguage(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sync-frequency">Frequência de sincronização</Label>
            <select
              id="sync-frequency"
              value={syncFrequency}
              onChange={(e) => setSyncFrequency(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SYNC_FREQ_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-tag">Tag de verificação do Google</Label>
            <Input
              id="verification-tag"
              value={verificationTag}
              onChange={(e) => setVerificationTag(e.target.value)}
              placeholder="Ex: google1234567890abcdef"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Este campo é para o lojista colar o token de verificação do Merchant Center.
              No Google Merchant Center, acesse <strong>Configurações &gt; Verificação e reivindicação do site</strong>
              e copie somente o valor do atributo <code>content</code> da meta tag (não copie a tag inteira).
            </p>
          </div>
        </div>
      </div>

      {/* Product Feed */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Rss className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Product Feed</h2>
        </div>
        <div className="space-y-4 p-5">
          {config?.feedUrl ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <code className="flex-1 text-xs text-foreground break-all">{config.feedUrl}</code>
              <Button variant="ghost" size="sm" onClick={copyFeedUrl} className="shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Salve a configuração acima para gerar a URL do product feed.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Cadastre esta URL no Google Merchant Center como seu feed de produtos.
            O feed é gerado automaticamente a partir dos seus produtos ativos.
          </p>

          {config?.lastSyncedAt && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {new Date(config.lastSyncedAt).toLocaleString()}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || !config?.merchantId}
            >
              {syncMutation.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Sincronizar agora
            </Button>
          </div>
        </div>
      </div>

      {/* Setup guide */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
          Como configurar o Google Shopping
        </h3>
        <ol className="space-y-1.5 text-xs text-blue-700 dark:text-blue-400 list-decimal pl-4">
          <li>
            Crie uma conta no{' '}
            <a href="https://merchants.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
              Google Merchant Center
            </a>{' '}
            (gratuito).
          </li>
          <li>No Merchant Center, pegue o token da meta tag de verificação do site e cole em <strong>Tag de verificação do Google</strong>.</li>
          <li>Salve e volte ao Merchant Center para concluir a verificação do domínio.</li>
          <li>Copie seu Merchant Center ID e cole no campo acima.</li>
          <li>Ative o feed e escolha o país alvo e idioma dos seus produtos.</li>
          <li>No Merchant Center, cadastre a URL do feed gerada acima como fonte de dados.</li>
          <li><strong>Opcional:</strong> vincule sua conta do Google Ads para campanhas pagas Shopping.</li>
        </ol>
      </div>

      {/* Requires */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-700 dark:text-amber-400">
            <p className="font-semibold mb-1">Requisitos externos</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Conta Google Merchant Center (gratuita)</li>
              <li>Conta Google Ads (opcional, apenas para campanhas pagas)</li>
              <li>Produtos com título, descrição, preço, imagem e GTIN/MPN preenchidos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar configuração
        </Button>
      </div>
    </div>
  );
}
